<div align="center">
  <h1 align="center">Auto DS-160 Filler</h1>
  <p align="center">
    <strong>Fill your US Visa application in seconds, not hours.</strong>
  </p>
  <p align="center">
    Powered by GPT-5.1 · Local-First · Privacy Focused
  </p>
</div>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![GPT-5.1](https://img.shields.io/badge/AI-GPT--5.1-10A37F?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

</div>

<br/>

<div align="center">
  <!-- 建议在这里放一张 GIF 演示，比如：assets/demo.gif -->
  <img src="https://via.placeholder.com/800x400?text=Demo+Preview+Placeholder" alt="Demo Preview" width="100%" style="border-radius: 8px; border: 1px solid #eee;">
</div>

<br/>

## Introduction

**Auto DS-160 Filler** is an open-source Chrome Extension designed to modernize the painful experience of the US Visa application process (CEAC website).

Instead of manually filling out 100+ fields, simply describe your information in natural language. We use **GPT-5.1** to parse your data into the strict DS-160 schema and inject it directly into the official form.

> **Privacy Note**: We do not run a backend server. Your data and API keys are stored locally in your browser and communicate directly with OpenAI.

## Features

- 🪄 **Natural Language Input**
  Dump your resume or bio in English/Chinese. The AI figures out the rest.

- ⚡️ **GPT-5.1 Powered**
  Utilizes the next-gen multimodal model for high-precision field mapping and logic checking.

- 🛡️ **Local & Private**
  No databases, no tracking. Your personal data never leaves your machine except to hit the OpenAI API.

- 🎯 **Strict Schema Validation**
  Built with rigorous TypeScript interfaces matching the official DS-160 form logic.

- 🔌 **One-Click Auto-Fill**
  Injects data into the legacy CEAC system via standard DOM manipulation.

## Quick Start

This project is currently in **Developer Preview**.

### Prerequisites

- Node.js 18+
- OpenAI API Key (with GPT-5.1 access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/auto-ds160-filler.git
   cd auto-ds160-filler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode** (top right).
   - Click **Load unpacked**.
   - Select the `dist` directory.

## Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [OpenAI API](https://platform.openai.com/docs/models) (GPT-5.1)
- **Bundler**: [CRXJS](https://crxjs.dev/vite-plugin)

## Roadmap

- [x] Personal Information Section
- [x] Passport Information Section
- [x] Travel History & Companions
- [x] Education & Work History
- [x] Family Information (Parents & Spouse)
- [x] Address & Phone Information
- [x] Security Questions (Basic Support)
- [ ] Photo Validation Helper
- [ ] PDF Export

## Development & Debugging

Since this is a Chrome Extension, you can't run it directly in Node.js.

1. **Watch Mode**: Run `npm run dev` to watch for file changes.
2. **Chrome Logs**:
   - Right-click the extension icon -> **Inspect Popup** to debug the React UI.
   - On the DS-160 page, open DevTools (`F12`) to see logs from the Content Script (e.g., "Filling #surname with ZHANG").
3. **Reload**: After code changes, go to `chrome://extensions/` and click the refresh icon on the card.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
