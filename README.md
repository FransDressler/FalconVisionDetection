# FalconVision

**FalconVision** is an offline-capable drone search system designed to locate missing persons in mountainous terrain using computer vision and YOLOv11. It includes a streamlined interface built with Electron and Vite for video analysis and model customization.

## Features

* ✈️ Local drone video analysis (no internet required)
* 🔍 Person detection using fine-tuned YOLOv11 models
* 🔠 Choose between pre-trained models or custom YOLO weights
* ⏳ Adjustable frame skipping for faster processing
* ⌚ Live progress bar and detection results
* 📄 PDF export of all detected frames, including confidence, timestamps and locations
* 📄 Multilingual UI (German / English toggle)

## Technologies

* Frontend: React + Vite + Tailwind + Electron
* Backend: Python + Flask + Ultralytics YOLOv11

## Installation

This repo contains the full source code. For installation instructions and binaries, see the [Releases](https://github.com/FransDressler/FalconVisionDetection/releases) page.

If you're building locally:

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Start backend
cd backend && python app.py

# Start frontend (in another terminal)
cd frontend && npm run start
```

## Project Structure

```
FalconVision/
├── backend/       # Flask + YOLOv11 inference server
├── frontend/      # Electron + React video analysis interface
├── uploads/       # Temporary folder for uploaded video frames
├── start.sh       # Linux launcher script
├── start_windows.bat  # Windows launcher script
```

## Build the Electron App

To create a cross-platform distributable version:

```bash
cd frontend
npm run dist
```

This creates `.AppImage`, `.exe` and other binaries under `frontend/dist`.

---

## License

MIT License. Built with ❤️ by [Ruchit Kumar Patel](https://github.com/RuchitKumarPatel) and [Frans Dressler](https://github.com/FransDressler) @ [FalconVision](https://falconvision.org/).
