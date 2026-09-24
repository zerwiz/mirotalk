'use strict';

/**
 * Þing — the video skin (open-source effects, on-device).
 * MediaPipe Selfie Segmentation (Apache-2.0) removes the room behind the
 * speaker and lays the cloth of the hall instead: a blur, or a chosen
 * image. Runs wholly in the browser — no audio or video leaves the seat
 * (First Law holds), no vendor server, no licence key.
 *
 * The class takes a raw camera MediaStream and returns a processed
 * MediaStream ready for the peers, exactly as the RNNoise processor does
 * for audio. client.js tucks this behind the same toggle pattern.
 */
class ThingBackground {
    constructor() {
        this.segmentation = null;
        this.canvas = null;
        this.ctx = null;
        this.output = null;
        this.inputVideo = null;
        this.backgroundImage = null;
        this.mode = 'blur'; // 'blur' | 'image'
        this.blurRadius = 18;
        this.running = false;
        this.frameLock = false;
    }

    static isSupported() {
        return (
            typeof SelfieSegmentation !== 'undefined' &&
            typeof document !== 'undefined' &&
            typeof HTMLCanvasElement !== 'undefined' &&
            typeof HTMLCanvasElement.prototype.captureStream === 'function'
        );
    }

    /**
     * Set the background: 'blur' or an image URL.
     */
    setBackground(mode, imageUrl = null) {
        this.mode = mode;
        if (mode === 'image' && imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                this.backgroundImage = img;
            };
            img.src = imageUrl;
        } else if (mode === 'blur') {
            this.backgroundImage = null;
        }
    }

    /**
     * Start skinning a camera stream.
     * @param {MediaStream} stream - raw camera stream
     * @returns {Promise<MediaStream>} processed stream
     */
    async start(stream) {
        if (!ThingBackground.isSupported()) {
            console.warn('ThingBackground: MediaPipe or captureStream not supported.');
            return stream;
        }

        this.stop();

        this.segmentation = new SelfieSegmentation({
            locateFile: (file) => `../mediapipe/${file}`,
        });
        await this.segmentation.initialize();

        this.canvas = document.createElement('canvas');
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings ? track.getSettings() : {};
        this.canvas.width = settings.width || 1280;
        this.canvas.height = settings.height || 720;
        this.ctx = this.canvas.getContext('2d');

        this.inputVideo = document.createElement('video');
        this.inputVideo.srcObject = stream;
        this.inputVideo.autoplay = true;
        this.inputVideo.muted = true;
        this.inputVideo.playsInline = true;
        await this.inputVideo.play();

        this.output = this.canvas.captureStream(30);
        // carry the raw audio through untouched — the hall's ear hears all
        for (const t of stream.getAudioTracks()) {
            this.output.addTrack(t);
        }
        // keep the raw camera for a clean lift-off when the skin comes off
        this.originalRawStream = stream;

        this.segmentation.onResults((results) => {
            if (!this.running) return;
            if (this.frameLock) return;
            this.frameLock = true;
            try {
                this.composite(results);
            } finally {
                this.frameLock = false;
            }
        });

        this.running = true;
        this.renderLoop();
        return this.output;
    }

    async renderLoop() {
        while (this.running) {
            if (this.inputVideo && this.inputVideo.readyState >= 2) {
                try {
                    await this.segmentation.send({ image: this.inputVideo });
                } catch (e) {
                    // transient; keep the loop alive
                }
            }
            await new Promise((r) => setTimeout(r, 30));
        }
    }

    /**
     * Composite the mask: draw the raw frame, then the person over the
     * chosen background. The mask from MediaPipe is a CanvasImageSource;
     * we use it as a source-in alpha for the person layer.
     */
    composite(results) {
        const { ctx, canvas, inputVideo } = this;
        const W = canvas.width;
        const H = canvas.height;

        // 1. Background layer: blur the raw frame, or draw the chosen image.
        if (this.mode === 'blur') {
            ctx.filter = `blur(${this.blurRadius}px)`;
            ctx.drawImage(inputVideo, 0, 0, W, H);
            ctx.filter = 'none';
        } else if (this.backgroundImage) {
            ctx.drawImage(this.backgroundImage, 0, 0, W, H);
        } else {
            ctx.fillStyle = '#0e0c09'; // the stone of the hall
            ctx.fillRect(0, 0, W, H);
        }

        // 2. Person layer clipped to the segmentation mask.
        const mask = results.segmentationMask;
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = W;
        maskCanvas.height = H;
        const mctx = maskCanvas.getContext('2d');
        mctx.drawImage(mask, 0, 0, W, H);

        ctx.save();
        ctx.globalCompositeOperation = 'destination-in';
        // draw the person: raw video alpha-masked by the mask
        const person = document.createElement('canvas');
        person.width = W;
        person.height = H;
        const pctx = person.getContext('2d');
        pctx.drawImage(inputVideo, 0, 0, W, H);
        pctx.globalCompositeOperation = 'destination-in';
        pctx.drawImage(maskCanvas, 0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(person, 0, 0, W, H);
        ctx.restore();
    }

    stop() {
        this.running = false;
        if (this.segmentation) {
            try {
                this.segmentation.close();
            } catch (e) {
                // already closed
            }
            this.segmentation = null;
        }
        if (this.inputVideo) {
            this.inputVideo.srcObject = null;
            this.inputVideo = null;
        }
        this.canvas = null;
        this.output = null;
    }
}

// Global hand-off — loaded before client.js, same pattern as RNNoiseProcessor.
if (typeof window !== 'undefined') window.ThingBackground = ThingBackground;