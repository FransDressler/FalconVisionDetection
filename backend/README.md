# FalconVision Backend

This is the backend component of the **FalconVision** application. It is built with Flask and provides video-based human detection using YOLO models. Detection results are streamed to the frontend as the video is processed.

---

## 🚀 Features

- 🔍 Human detection using YOLO (Ultralytics)
- 🎥 Frame-by-frame video analysis with skip control
- 📡 Streaming NDJSON response to the frontend
- 🖼️ Automatic saving of annotated detection frames
- 🧠 Model selection & custom weight support

---

## ⚙️ Requirements

- Python 3.11+
- pip or `venv` (recommended)
- PyTorch-compatible environment (CUDA if available)
- [Ultralytics](https://github.com/ultralytics/ultralytics)

---

## ⚙️ Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## ▶️ Run the Backend

```bash
python app.py
```

Once started, the backend will be available at:

```
http://localhost:5000
```

---

## 📡 API Endpoints

### `POST /detect_stream`

Run YOLO detection on a video file.

**Query Parameters:**

- `skip`: Optional – number of frames to skip (default: `1`)
- `model`: Identifier string for the selected model (e.g., `model1`, `model2`, or `custom`)
- `path`: (Optional) Absolute path to a custom YOLO `.pt` model file

**Form Data:**

- `video`: The video file to be analyzed

**Response:**

- Streaming NDJSON:
  - Frame number
  - Timestamp
  - Detection bounding boxes and confidence
  - Link to annotated frame image

---

### `GET /uploads/<filename>`

Serve a saved annotated detection image.

---

## 📁 Project Structure

```
backend/
├── app.py                 # Main Flask app
├── requirements.txt       # Python dependencies
├── uploads/               # Output frame images with detections
├── models/                # Custom YOLO weights (if needed)
└── venv/                  # Python virtual environment
```

---

## 🧠 Custom Weight Support

To use your own YOLO model weights, provide the absolute path when calling `/detect_stream`.

**Example:**

```
/detect_stream?skip=30&model=custom&path=/absolute/path/to/best.pt
```

The frontend allows file selection and transmits this path automatically.

---

## 📝 Notes

- The `/uploads` directory is cleared at the beginning of every detection session.
- Each frame with detections is saved with bounding boxes overlaid.
- The backend is designed for streaming response, supporting long video files with ongoing progress updates.

---

## 🪪 License

MIT License – free to use, modify, and distribute.
