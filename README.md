<div align="center">
    <a href="https://ping.zerwiz.org" target="_blank">
        <img src="public/images/logo.svg" width="96">
    </a>
</div>

<h1 align="center">Þing — the assembly hall of Ymir</h1>

<h3 align="center">Peer-to-peer video rooms of your own. No toll booth, no clock, no stranger's server.</h3>

<h4 align="center">Fast, secure, real-time — up to 8K @ 60fps. Works in all browsers, everywhere you stand.</h4>

<br />

<div align="center">

[![License: AGPLv3](https://img.shields.io/badge/License-AGPLv3_Open_Source-blue.svg)](https://choosealicense.com/licenses/agpl-3.0/)

</div>

<br />

<p align="center"><strong>Þing</strong> is the meeting hall of <strong>Ymir</strong> — a self-hosted, open-source video room built on <strong>peer-to-peer WebRTC</strong>. Media flows directly between the gathered; the signalling server only introduces them. Rooms without number, calls without a clock, and the record stays where you keep it. A fork of <a href="https://github.com/miroslavpejic85/mirotalk">MiroTalk P2P</a>, cut to our own cloth.</p>

<br />

<details open>
<summary>⚡ Quick start</summary>

<br/>

**Start in 6 commands:**

```bash
git clone https://github.com/zerwiz/mirotalk.git
cd mirotalk
cp .env.template .env
cp app/src/config.template.js app/src/config.js
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) — done.

</details>

<details>
<summary>🐳 Docker</summary>

<br/>

**Prerequisites:** [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

```bash
git clone https://github.com/zerwiz/mirotalk.git
cd mirotalk
cp .env.template .env
cp app/src/config.template.js app/src/config.js
cp docker-compose.template.yml docker-compose.yml
docker-compose pull    # optional: pull official image
docker-compose up      # add -d to run in background
```

> **Note:** edit `app/src/config.js`, `.env`, and `docker-compose.yml` to customize the hall.

</details>

<details>
<summary>🚀 Features</summary>

<br/>

- 🎥 Video up to **8K @ 60fps** · Screen sharing · Recording · Picture-in-Picture
- 💬 Chat with Markdown & emoji · Collaborative whiteboard · File sharing
- 🧠 **Open effects rail** — RNNoise noise suppression and MediaPipe virtual background / blur, on-device, no vendor key
- 🔒 OIDC auth · host protection · JWT credentials · room passwords · peer-to-peer encryption
- 🔌 REST API · 133 languages · embeddable iframe & widget

</details>

<details>
<summary>📄 License</summary>

<br/>

[![AGPLv3](public/images/AGPLv3.png)](LICENSE)

Thing is free and open-source under the terms of **AGPLv3** (GNU Affero General Public License v3.0). Modifications must stay free and be made available to the public. See [Choose an open source license](https://choosealicense.com/licenses/agpl-3.0/).

The room engine is a fork of [MiroTalk P2P](https://github.com/miroslavpejic85/mirotalk) by Miroslav Pejic — the upstream AGPL attribution is kept literal, and the licence position of the hall is recorded in Ymir's plan 53.

</details>

<details>
<summary>🙏 Credits</summary>

<br/>

The upstream craft we stand on:

- [MiroTalk P2P](https://github.com/miroslavpejic85/mirotalk) — the room engine (AGPLv3)
- [RNNoise](https://github.com/xiph/rnnoise) via [@jitsi/rnnoise-wasm](https://github.com/jitsi/rnnoise-wasm) — noise suppression (Apache-2.0)
- [MediaPipe Selfie Segmentation](https://github.com/google-ai-edge/mediapipe) — virtual background / blur (Apache-2.0)
- [ianramzy](https://cruip.com/demos/neon/) — the html template
- [vasanthv](https://github.com/vasanthv/webrtc-logic) — webrtc-logic
- [fabric.js](https://fabricjs.com/) — whiteboard

</details>

<details>
<summary>🤝 Contributing</summary>

<br/>

Contributions are welcome — bug fixes, features, documentation.

1. Fork the repository
2. Create your feature branch
3. Run `npm run lint` before committing
4. Submit a pull request

</details>