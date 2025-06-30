# FalconVision Codex Agent Instructions

## 🧠 Purpose

This agent powers the FalconVision App – a drone-based search-and-rescue tool that uses YOLOv11 models to detect humans in mountainous regions. The goal is to allow users to process video input offline, annotate detections, and export reports.

## 📂 Project Structure

```
.
├── backend/                    # Flask API with YOLOv11 model inference
├── frontend/                   # Electron + React frontend
├── falcon-vision-models/       # Saved YOLO model weights (custom + predefined)
├── uploads/                   # Temporary frame images from video processing
├── start.sh / start_windows.bat # One-click startup scripts
```

## ⚙️ Capabilities

The agent should:

- Detect when the user selects a video and starts analysis.
- Pass video and model choice to the backend.
- Parse streamed detection data from Flask.
- Visualize bounding boxes, timestamps, and allow user to annotate locations.
- Export the detection data and frame previews into a PDF.

## 📦 Model Management

Users can:
- Select pre-trained models.
- Add custom `.pt` files via file dialog.
- Custom weights get copied into `falcon-vision-models/`.

Models are identified by:
```ts
{
  label_de: string;
  label_en: string;
  value: string; // internal key
  path?: string; // optional local path
}
```

## 🛠️ Electron Specific

- App loads `dist-render/index.html` using `loadFile`
- `preload.js` exposes `electronAPI.selectWeights()`
- Main process handles weight selection and copies them to `falcon-vision-models/`

## 🔌 Backend API

### Endpoint
`POST /detect_stream?skip=N&model=modelName&path=optionalCustomPath`

### Request
- video: MP4 upload
- skip: number of frames to skip (int)
- model: one of the known model keys or “custom”
- path: optional file path for a custom model

### Response
NDJSON stream with:
```json
{
  "frame": 0,
  "timestamp": 1.2,
  "progress": 15.5,
  "detections": [ ... ],
  "image": "http://localhost:5000/uploads/frame_0.jpg"
}
```

Ends with:
```json
{ "status": "done", "frames_processed": 100, "total_detections": 55 }
```

## 📤 Output

- Frames with detections are saved in `/uploads/`
- PDF reports generated via `jspdf` + `autotable`
- Users can enter location manually per frame

## 🧪 Local Setup

- `npm install && npm run dev` inside `frontend`
- `flask run` or compiled `app.exe` in `backend`
- Use `start.sh` / `start_windows.bat` for unified launch

## 🚀 Build Targets

- `npm run dist`: Generates AppImage for Linux and optionally `.exe` for Windows




For support or extension of capabilities, contact the FalconVision maintainers.
