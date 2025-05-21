# FalconVision Frontend

This directory contains the frontend of the **FalconVision** application, a cross-platform video analysis tool that detects humans in drone footage using computer vision models. The frontend is built with **React**, **TypeScript**, and **Electron**, making it capable of running as both a web app and a desktop application.

## Features

- 🎥 Upload video files and perform real-time detection streaming.
- 📊 View detection results with bounding boxes, timestamps, and class probabilities.
- 📍 Annotate each detection frame with a custom location field.
- 🌐 Multilingual support (German 🇩🇪 and English 🇬🇧).
- 📁 Model selection: switch between different pre-trained YOLO models.
- 📄 Export detections as a PDF report (including bounding box data and images).
- 🖥️ Cross-platform Electron app support.

## Technologies Used

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for fast development and builds
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Electron](https://www.electronjs.org/) for desktop integration
- [jsPDF](https://github.com/parallax/jsPDF) and [autoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) for PDF export

## Setup (Development)

```bash
cd frontend
npm install
npm run start  # Starts Vite dev server + Electron
```

To only run the Vite dev server:
```bash
npm run dev
```

## Production Build

To build the production-ready Electron application:
```bash
npm run dist
```
This will generate a `.AppImage` (Linux), `.exe` (Windows), or other binaries depending on your OS.

## File Structure

```
frontend/
├── public/               # Static files (e.g. icon.png)
├── src/
│   ├── pages/            # Main views: VideoAnalysis, Settings
│   ├── context/          # React context for model state
│   ├── assets/           # Local image imports
│   ├── electron/         # Electron main process & preload
│   └── App.tsx           # Application root
├── dist-render/          # Vite production output
├── package.json          # NPM scripts and dependencies
├── vite.config.ts        # Vite configuration
└── electron-builder.json # Electron Builder config
```

## Notes

- All detection data is fetched from the local Flask API (default `http://localhost:5000`).
- The application expects detection model weights and paths to be specified via the UI or config.
- Backend must be running separately if not bundled.

---

For overall project context, see the [main README](../README.md).
