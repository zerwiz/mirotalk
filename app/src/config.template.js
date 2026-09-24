'use strict';

/**
 * ==============================================
 * MiroTalk P2P v.1.9.99 - Configuration File
 * ==============================================
 *
 * This file is the central configuration source.
 * All environment variables are read here so the
 * rest of the codebase imports config values
 * instead of reading process.env directly.
 *
 * Setup:
 *   cp app/src/config.template.js app/src/config.js
 *   Then edit config.js to match your environment.
 *
 * Docker/container environments inject values via
 * environment variables which are read at startup.
 *
 * Branding and customizations require a license:
 * https://codecanyon.net/item/mirotalk-p2p-webrtc-realtime-video-conferences/38376661
 */

require('dotenv').config();

const packageJson = require('../../package.json');

// Helper: parse env string to boolean
function getEnvBoolean(key, force_true_if_undefined = false) {
    if (key == undefined && force_true_if_undefined) return true;
    return key == 'true' ? true : false;
}

// Helper: safely parse JSON env vars with a fallback
function parseJsonEnv(envValue, fallback) {
    if (!envValue) return fallback;
    try {
        return JSON.parse(envValue);
    } catch (e) {
        return fallback;
    }
}

const port = process.env.PORT || 3000;

module.exports = {
    // ==========================================
    // Server
    // ==========================================
    server: {
        port: port,
        host: process.env.HOST || `http://localhost:${port}`,
        environment: process.env.NODE_ENV || 'development',
        trustProxy: !!getEnvBoolean(process.env.TRUST_PROXY),

        /**
         * Embed (iframe) Restrictions
         * ---------------------------
         * Controls which origins are allowed to embed MiroTalk P2P in an <iframe>
         * via the HTTP `Content-Security-Policy: frame-ancestors` header
         * (also mirrored to `X-Frame-Options` when possible for legacy browsers).
         *
         * Behavior:
         * - Empty / unset  → header NOT set, embedding allowed anywhere (default).
         * - 'none'         → block ALL embedding (frame-ancestors 'none' + X-Frame-Options: DENY).
         * - 'self'         → only same-origin embedding (frame-ancestors 'self' + X-Frame-Options: SAMEORIGIN).
         * - list           → comma-separated origins, 'self' is always implicitly included.
         *                    Wildcards like https://*.example.com are valid in CSP.
         *
         * IMPORTANT: This affects the widget too — the MiroTalk widget embeds
         * the room in an iframe on the host site, so every site that should
         * load the widget must be listed here.
         */
        embed: {
            allowedOrigins: process.env.ALLOWED_EMBED_ORIGINS
                ? process.env.ALLOWED_EMBED_ORIGINS.split(',')
                      .map((o) => o.trim())
                      .filter(Boolean)
                : [],
        },
    },

    // ==========================================
    // CORS
    // ==========================================
    cors: {
        origin: parseJsonEnv(process.env.CORS_ORIGIN, '*'),
        methods: parseJsonEnv(process.env.CORS_METHODS, ['GET', 'POST']),
    },

    // ==========================================
    // Host Protection
    // ==========================================
    host: {
        protected: getEnvBoolean(process.env.HOST_PROTECTED),
        userAuth: getEnvBoolean(process.env.HOST_USER_AUTH),
        // HOST_USERS passwords must contain between 1 and 36 characters.
        users: parseJsonEnv(process.env.HOST_USERS, [{ username: 'MiroTalk', password: 'P2P' }]),
        maxLoginAttempts: process.env.HOST_MAX_LOGIN_ATTEMPTS || 5,
        minLoginBlockTime: process.env.HOST_MIN_LOGIN_BLOCK_TIME || 15, // in minutes
        maxRoomParticipants: parseInt(process.env.ROOM_MAX_PARTICIPANTS) || 1000,
        showActiveRooms: getEnvBoolean(process.env.SHOW_ACTIVE_ROOMS) || false,
    },

    // ==========================================
    // JWT
    // ==========================================
    jwt: {
        key: process.env.JWT_KEY || 'mirotalk_jwt_secret',
        exp: process.env.JWT_EXP || '1h',
    },

    // ==========================================
    // Presenters
    // ==========================================
    // WARNING: without host protection / user auth, the peer name is unverified client input,
    // so each entry acts as a shared secret. Use unique, non-guessable values (never a real
    // name or email) or anyone who guesses it becomes presenter. Empty by default: a shipped
    // name is a public credential.
    presenters: parseJsonEnv(process.env.PRESENTERS, []),

    // ==========================================
    // API
    // ==========================================
    api: {
        keySecret: process.env.API_KEY_SECRET,
        disabled: parseJsonEnv(process.env.API_DISABLED, ['token', 'meetings']),
    },

    // ==========================================
    // Ngrok
    // ==========================================
    ngrok: {
        enabled: getEnvBoolean(process.env.NGROK_ENABLED),
        authToken: process.env.NGROK_AUTH_TOKEN,
    },

    // ==========================================
    // WebRTC ICE Servers
    // ==========================================
    webrtc: {
        stun: {
            enabled: getEnvBoolean(process.env.STUN_SERVER_ENABLED),
            url: process.env.STUN_SERVER_URL,
        },
        turn: {
            enabled: getEnvBoolean(process.env.TURN_SERVER_ENABLED),
            url: process.env.TURN_SERVER_URL,
            username: process.env.TURN_SERVER_USERNAME,
            credential: process.env.TURN_SERVER_CREDENTIAL,
        },
    },

    // ==========================================
    // IP Lookup
    // ==========================================
    ipLookup: {
        enabled: getEnvBoolean(process.env.IP_LOOKUP_ENABLED),
    },

    // ==========================================
    // Survey
    // ==========================================
    survey: {
        enabled: getEnvBoolean(process.env.SURVEY_ENABLED),
        url: process.env.SURVEY_URL || 'https://www.questionpro.com/t/AUs7VZq00L',
    },

    // ==========================================
    // Redirect
    // ==========================================
    redirect: {
        enabled: getEnvBoolean(process.env.REDIRECT_ENABLED),
        url: process.env.REDIRECT_URL || '/newcall',
    },

    // ==========================================
    // Sentry
    // ==========================================
    sentry: {
        enabled: getEnvBoolean(process.env.SENTRY_ENABLED),
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.0'),
        logLevels: process.env.SENTRY_LOG_LEVELS
            ? process.env.SENTRY_LOG_LEVELS.split(',').map((level) => level.trim())
            : ['error'],
    },

    // ==========================================
    // Slack
    // ==========================================
    slack: {
        enabled: getEnvBoolean(process.env.SLACK_ENABLED),
        signingSecret: process.env.SLACK_SIGNING_SECRET,
    },

    // ==========================================
    // ChatGPT / OpenAI
    // ==========================================
    chatGPT: {
        enabled: getEnvBoolean(process.env.CHATGPT_ENABLED),
        basePath: process.env.CHATGPT_BASE_PATH,
        apiKey: process.env.CHATGPT_APIKEY,
        model: process.env.CHATGPT_MODEL,
        max_tokens: parseInt(process.env.CHATGPT_MAX_TOKENS),
        temperature: parseInt(process.env.CHATGPT_TEMPERATURE),
    },

    // ==========================================
    // Whisper Speech-to-Text (server-side transcription)
    // ==========================================
    // Server-side audio transcription using an OpenAI-compatible Whisper
    // endpoint. Works with the official OpenAI API or any self-hosted,
    // OpenAI-compatible server (whisper.cpp server, faster-whisper, etc.).
    //
    // IMPORTANT: Whisper is a side-channel only. The browser records short
    // audio segments from a SECONDARY copy of the local microphone stream and
    // sends them here for transcription. It NEVER sits in the WebRTC media
    // path: the RTCPeerConnection audio track is untouched and keeps the
    // lowest possible latency. The resulting text is distributed to peers over
    // the existing WebRTC DataChannel, not through this server.
    //
    // - enabled        : Enable/disable Whisper transcription [true/false] (default: false)
    // - basePath       : OpenAI-compatible API endpoint (default: 'https://api.openai.com/v1/')
    //                    For a self-hosted server use e.g. 'http://localhost:8000/v1/'
    // - apiKey         : API secret key (ALWAYS store in .env, never sent to the browser).
    //                    May be empty for self-hosted servers that don't require auth.
    // - model          : Whisper model name (default: 'whisper-1')
    // - language       : Optional ISO-639-1 language hint (e.g. 'en'). Empty = auto-detect.
    // - segmentSeconds : Length of each recorded audio segment sent for transcription (default: 3)
    // - maxAudioBytes  : Reject audio segments larger than this (default: 25MB)
    whisper: {
        enabled: getEnvBoolean(process.env.WHISPER_ENABLED),
        basePath: process.env.WHISPER_BASE_PATH || 'https://api.openai.com/v1/',
        apiKey: process.env.WHISPER_API_KEY || '',
        model: process.env.WHISPER_MODEL || 'whisper-1',
        language: process.env.WHISPER_LANGUAGE || '',
        segmentSeconds: parseInt(process.env.WHISPER_SEGMENT_SECONDS) || 3,
        maxAudioBytes: parseInt(process.env.WHISPER_MAX_AUDIO_BYTES) || 25 * 1024 * 1024,
    },

    // ==========================================
    // IP Whitelist
    // ==========================================
    ipWhitelist: {
        enabled: getEnvBoolean(process.env.IP_WHITELIST_ENABLED),
        allowed: parseJsonEnv(process.env.IP_WHITELIST_ALLOWED, []),
    },

    // ==========================================
    // OIDC - OpenID Connect
    // ==========================================
    oidc: {
        enabled: process.env.OIDC_ENABLED ? getEnvBoolean(process.env.OIDC_ENABLED) : false,
        allowRoomCreationForAuthUsers: process.env.OIDC_ALLOW_ROOMS_CREATION_FOR_AUTH_USERS
            ? getEnvBoolean(process.env.OIDC_ALLOW_ROOMS_CREATION_FOR_AUTH_USERS)
            : false,
        baseUrlDynamic: process.env.OIDC_BASE_URL_DYNAMIC ? getEnvBoolean(process.env.OIDC_BASE_URL_DYNAMIC) : false,
        /*
         * When `baseUrlDynamic` is true, the OIDC baseURL (and therefore the redirect_uri
         * sent to the IdP) is derived from the incoming `Host` header. To prevent
         * Host-header injection from redirecting authorization codes to an attacker,
         * list every origin the server is allowed to serve here (full origin, no path).
         * The static `config.baseURL` is always trusted and does not need to be repeated.
         * Example: ['https://p2p.mirotalk.com', 'https://meet.example.com']
         */
        allowedDynamicBaseURLs: process.env.OIDC_ALLOWED_DYNAMIC_BASE_URLS
            ? process.env.OIDC_ALLOWED_DYNAMIC_BASE_URLS.split(',')
                  .map((u) => u.trim())
                  .filter(Boolean)
            : [],
        config: {
            issuerBaseURL: process.env.OIDC_ISSUER_BASE_URL,
            clientID: process.env.OIDC_CLIENT_ID,
            clientSecret: process.env.OIDC_CLIENT_SECRET,
            baseURL: process.env.OIDC_BASE_URL,
            secret: process.env.SESSION_SECRET,
            authorizationParams: {
                response_type: 'code',
                scope: 'openid profile email',
            },
            authRequired: process.env.OIDC_AUTH_REQUIRED ? getEnvBoolean(process.env.OIDC_AUTH_REQUIRED) : false,
            auth0Logout: process.env.OIDC_AUTH_LOGOUT ? getEnvBoolean(process.env.OIDC_AUTH_LOGOUT) : true,
            routes: {
                callback: '/auth/callback',
                login: false,
                logout: '/logout',
            },
        },
    },

    // ==========================================
    // Mattermost
    // ==========================================
    mattermost: {
        enabled: getEnvBoolean(process.env.MATTERMOST_ENABLED),
        serverUrl: process.env.MATTERMOST_SERVER_URL,
        username: process.env.MATTERMOST_USERNAME,
        password: process.env.MATTERMOST_PASSWORD,
        token: process.env.MATTERMOST_TOKEN,
        roomTokenExpire: process.env.MATTERMOST_ROOM_TOKEN_EXPIRE,
    },

    // ==========================================
    // Stats / Analytics
    // ==========================================
    stats: {
        enabled: process.env.STATS_ENABLED ? getEnvBoolean(process.env.STATS_ENABLED) : true,
        src: process.env.STATS_SCR || 'https://stats.mirotalk.com/script.js',
        id: process.env.STATS_ID || 'c7615aa7-ceec-464a-baba-54cb605d7261',
    },

    // ==========================================
    // Email
    // ==========================================
    email: {
        alert: process.env.EMAIL_ALERT === 'true' || false,
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        username: process.env.EMAIL_USERNAME,
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || process.env.EMAIL_USERNAME,
        sendTo: process.env.EMAIL_SEND_TO,
        https: process.env.HTTPS === 'true' || false,
        serverPort: process.env.PORT || 3000,
    },

    // ==========================================
    // Branding (UI customizations)
    // ==========================================
    brand: {
        htmlInjection: true,
        app: {
            language: 'en', // https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
            translationMode: 'google', // In-room UI: auto (native file else Google) | native (human files only, no Google) | google (default, always Google)
            name: 'Þing',
            title: '<h1>Þing</h1>The assembly hall of Ymir.<br />Peer-to-peer, private, fast.',
            description:
                'A room of your own. Start a call in a single click — no download, no plugin, no toll booth. Meet, talk, and share your screen while the media flows directly between your people.',
            joinDescription: 'Pick a room name.<br />How about this one?',
            joinButtonLabel: 'ENTER HALL',
            customizeRoomButtonLabel: 'CUSTOMIZE ROOM',
            joinLastLabel: 'Your recent room:',
        },
        og: {
            type: 'app-webrtc',
            siteName: 'Ymir · Þing',
            title: 'Þing — the assembly hall of Ymir',
            description:
                'Peer-to-peer video hall of Ymir. Rooms of your own — screen sharing, chat, recording, whiteboard — with media flowing directly between participants.',
            image: '../images/logo.svg',
            url: '',
        },
        site: {
            shortcutIcon: '../images/logo.svg',
            appleTouchIcon: '../images/logo.svg',
            landingTitle: 'Þing — the assembly hall of Ymir',
            newCallTitle: 'Þing — a room of your own',
            newCallRoomTitle: 'Pick a name. <br />Share the link. <br />The hall opens.',
            newCallRoomDescription:
                "Every room carries its own disposable URL. Pick a name, share it, and the hall opens — that's all it takes.",
            loginTitle: 'Þing — the door is guarded',
            loginHeading: 'Welcome',
            loginDescription: 'Enter your mark to step into the hall.',
            loginButtonLabel: 'Enter',
            joinRoomTitle: 'Pick a name.<br />Share the link.<br />The hall opens.',
            joinRoomButtonLabel: 'ENTER HALL',
            clientTitle: 'Þing — assembly hall of Ymir · Video, Chat & Screen Sharing',
            privacyPolicyTitle: 'Þing — privacy and the law',
            stunTurnTitle: 'Test STUN/TURN servers',
            notFoundTitle: 'Þing — nothing here',
            waitingRoomTitle: 'Þing — awaiting the host',
            waitingRoomHeading: 'Awaiting the host…',
            waitingRoomDescription:
                "The hall hasn't opened yet.<br />You'll enter when the host opens the room.",
            waitingRoomStatus: 'Sounding the hall…',
            waitingRoomReady: 'The hall is open! Entering…',
            waitingRoomWaiting: 'Awaiting the host…',
            waitingRoomHostLink: 'Are you the host?',
            waitingRoomLoginLink: 'Enter here',
            waitingRoomElapsedJust: 'Just began awaiting',
            waitingRoomElapsedMinutes: 'Awaiting {minutes}',
            waitingRoomSongUrl: '../sounds/waiting-music.mp3',
        },
        html: {
            topSponsors: false,
            features: true,
            teams: false,
            tryEasier: false,
            poweredBy: false,
            sponsors: false,
            pastSponsors: false,
            advertisers: false,
            supportUs: false,
            footer: true,
        },
        about: {
            imageUrl: '../images/logo.svg',
            title: `Þing — the assembly hall of Ymir`,
            html: `
                <div class="about-content">
                    <p class="about-description">
                        A hall of your own. Peer-to-peer by design — the media flows directly
                        between the gathered, never through a stranger's server. Rooms are of our
                        own making; the record stays in the vault.
                    </p>
                    <footer class="about-footer">
                        &copy; ${new Date().getFullYear()} Ymir — Þing. All rights reserved.
                    </footer>
                </div>
            `,
        },
        // https://docs.mirotalk.com/mirotalk-p2p/integration/#widgets-integration
        widget: {
            enabled: false,
            roomId: 'ymir-hall',
            theme: 'dark',
            widgetState: 'minimized',
            widgetType: 'support',
            supportWidget: {
                position: 'top-right',
                expertImages: [],
                buttons: {
                    audio: true,
                    video: true,
                    screen: true,
                    chat: true,
                    join: true,
                },
                checkOnlineStatus: false,
                isOnline: true,
                customMessages: {
                    heading: 'Need help?',
                    subheading: 'Ask the ravens of the hall.',
                    connectText: 'connect in < 5 seconds',
                    onlineText: 'The hall is open',
                    offlineText: 'The hall is shut',
                    poweredBy: 'Powered by Ymir · Þing',
                },
            },
        },
        //...
    },
    // ==========================================
    // Themes
    // ==========================================
    /**
     * Theme definitions — CSS custom properties for each theme.
     * Admins can override individual themes or add new ones.
     * The client merges these with built-in defaults, so you
     * only need to specify the properties you want to change.
     */
    themes: {
        /* Ymir look-and-feel: the dark theme wears the Algiz palette.
           Slate-obsidian grounds, cyan accents, the hall's own skin. */
        dark: {
            '--body-bg': 'radial-gradient(#0f172a, #020617)',
            '--msger-bg': 'radial-gradient(#0f172a, #020617)',
            '--msger-private-bg': 'radial-gradient(#0f172a, #020617)',
            '--wb-bg': 'radial-gradient(#0f172a, #020617)',
            '--elem-border-color': '1px solid rgba(56, 189, 248, 0.18)',
            '--navbar-bg': 'rgba(2, 6, 23, 0.92)',
            '--select-bg': '#0f172a',
            '--tab-btn-active': '#1e293b',
            '--box-shadow': '0px 4px 12px 0px rgba(0, 0, 0, 0.5)',
            '--left-msg-bg': '#11262e',
            '--right-msg-bg': '#0a1f35',
            '--private-msg-bg': '#0e2540',
            '--btn-bar-bg-color': '#022c43',
            '--btn-bar-color': '#e0f2fe',
            '--btns-bg-color': 'rgba(2, 6, 23, 0.8)',
            '--dd-color': '#38BDF8',
        },
        /* Example: override dark theme background
        dark: {
            '--body-bg': 'radial-gradient(#1a1a2e, #0a0a14)',
            '--msger-bg': 'radial-gradient(#1a1a2e, #0a0a14)',
        },
        */
        /* Example: add a custom theme
        ocean: {
            '--body-bg': 'radial-gradient(#0d2137, #061220)',
            '--msger-bg': 'radial-gradient(#0d2137, #061220)',
            '--msger-private-bg': 'radial-gradient(#0d2137, #061220)',
            '--wb-bg': 'radial-gradient(#0d2137, #061220)',
            '--elem-border-color': '1px solid rgba(56, 189, 248, 0.15)',
            '--navbar-bg': 'rgba(6, 18, 32, 0.88)',
            '--select-bg': '#0f2a45',
            '--tab-btn-active': '#163d5e',
            '--box-shadow': '0px 4px 12px 0px rgba(0, 0, 0, 0.5)',
            '--left-msg-bg': '#112d4a',
            '--right-msg-bg': '#0a1f35',
            '--private-msg-bg': '#0e2540',
            '--btn-bar-bg-color': '#E0F2FE',
            '--btn-bar-color': '#061220',
            '--btns-bg-color': 'rgba(6, 18, 32, 0.75)',
            '--dd-color': '#38BDF8',
        },
        */
    },
    /**
     * Configuration for controlling the visibility of buttons in the MiroTalk P2P client.
     * Set properties to true to show the corresponding buttons, or false to hide them.
     * captionBtn, showSwapCameraBtn, showScreenShareBtn, showFullScreenBtn, showVideoPipBtn, showDocumentPipBtn -> (auto-detected).
     */
    buttons: {
        main: {
            showAudioBtn: true,
            showVideoBtn: true,
            showScreenBtn: true, // autodetected
            showMyHandBtn: true,
            showChatRoomBtn: true,
            showParticipantsBtn: true,
            showMySettingsBtn: true,
            showExtraBtn: true,
            showShareQr: true,
            showShareRoomBtn: true, // For guests
            showHideMeBtn: true,
            showRecordStreamBtn: true,
            showFullScreenBtn: true,
            showRoomEmojiPickerBtn: true,
            showCaptionRoomBtn: true,
            showWhiteboardBtn: true,
            showSnapshotRoomBtn: true,
            showFileShareBtn: true,
            showDocumentPipBtn: true,
            showAboutBtn: true, // Please keep me always true, Thank you!
        },
        chat: {
            showTogglePinBtn: true,
            showMaxBtn: true,
            showSaveMessageBtn: true,
            showMarkDownBtn: true,
            showChatGPTBtn: getEnvBoolean(process.env.CHATGPT_ENABLED, true),
            showFileShareBtn: true,
            showShareVideoAudioBtn: true,
            showParticipantsBtn: true,
        },
        caption: {
            showTogglePinBtn: true,
            showMaxBtn: true,
        },
        settings: {
            showActiveRoomsBtn: true,
            showMicOptionsBtn: true,
            showTabRoomPeerName: true,
            showTabRoomParticipants: true,
            showTabRoomSecurity: true,
            showTabEmailInvitation: true,
            showCaptionEveryoneBtn: true,
            showMuteEveryoneBtn: true,
            showHideEveryoneBtn: true,
            showEjectEveryoneBtn: true,
            showLockRoomBtn: true,
            showUnlockRoomBtn: true,
            showJoinLockBtn: true,
            showShortcutsBtn: true,
            customNoiseSuppression: getEnvBoolean(process.env.CUSTOM_NOISE_SUPPRESSION_ENABLED, true),
        },
        remote: {
            showAudioVolume: true,
            audioBtnClickAllowed: true,
            videoBtnClickAllowed: true,
            showVideoPipBtn: true,
            showKickOutBtn: true,
            showSnapShotBtn: true,
            showFileShareBtn: true,
            showShareVideoAudioBtn: true,
            showGeoLocationBtn: true,
            showPrivateMessageBtn: true,
            showZoomInOutBtn: false,
            showVideoFocusBtn: true,
        },
        local: {
            showVideoPipBtn: true,
            showSnapShotBtn: true,
            showVideoCircleBtn: true,
            showZoomInOutBtn: false,
            showVideoFocusBtn: true,
        },
        whiteboard: {
            whiteboardLockBtn: false,
        },
    },
    // ==========================================
    // Webhook
    // ==========================================
    webhook: {
        enabled: false, // Enable webhook functionality
        url: 'http://localhost:8888/webhook-endpoint', // Webhook server URL
    },
};
