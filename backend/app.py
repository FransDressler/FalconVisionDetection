import os
import json
import glob
import cv2
from flask import Flask, request, Response, stream_with_context, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MODEL_MAP = {
    "ensemble_yolov11l": "../falcon-vision-models/ensemble_model.pt",
    "heridal_yolov11l":  "../falcon-vision-models/heridal.pt",
    "human_yolov11l":    "../falcon-vision-models/human.pt"
}

@app.route('/detect_stream', methods=['POST'])
def detect_stream():
    # 1) clear out old frames
    for f in glob.glob(os.path.join(UPLOAD_DIR, "*.jpg")):
        os.remove(f)

    # 2) pick the right model path
    model_key   = request.args.get("model", "")
    custom_path = request.args.get("path", None)

    if custom_path:
        model_path = custom_path
    elif model_key in MODEL_MAP:
        model_path = MODEL_MAP[model_key]
    else:
        # immediate JSON error
        return Response(
            json.dumps({"error": "No model path found for key '%s'" % model_key}),
            mimetype="application/json",
            status=400
        )

    print(f"Loading model at: {model_path}")
    try:
        model = YOLO(model_path)
    except Exception as e:
        return Response(
            json.dumps({"error": f"Failed to load model: {str(e)}"}),
            mimetype="application/json",
            status=500
        )

    # 3) accept and save the video
    file   = request.files.get('video')
    skip_n = int(request.args.get("skip", 1))
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    file.save(filepath)

    cap = cv2.VideoCapture(filepath)
    total_frames   = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_count    = 0
    total_detections = 0

    def generate():
        # send initial metadata
        yield json.dumps({
            "total_frames": total_frames,
            "current_frame": 0,
            "status": "running"
        }) + "\n"

        nonlocal frame_count, total_detections
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # skip logic
                if frame_count % skip_n != 0:
                    frame_count += 1
                    continue

                fps       = cap.get(cv2.CAP_PROP_FPS) or 1
                timestamp = frame_count / fps

                # run YOLO
                preds = model.predict(frame, conf=0.5)[0]
                detections = []
                for box in preds.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    conf = float(box.conf[0])
                    cls  = int(box.cls[0])
                    # draw on frame
                    cv2.rectangle(frame, (x1,y1), (x2,y2), (0,0,255), 2)
                    cv2.putText(frame, f"{cls} {conf:.2f}", (x1,y1-10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,255), 2)

                    detections.append({
                        "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                        "confidence": conf, "class": cls
                    })

                total_detections += len(detections)
                update = {
                    "frame": frame_count,
                    "timestamp": timestamp,
                    "progress": (frame_count / total_frames) * 100,
                }

                if detections:
                    fname = f"frame_{frame_count}.jpg"
                    cv2.imwrite(os.path.join(UPLOAD_DIR, fname), frame)
                    update["detections"] = detections
                    update["image"]      = f"http://localhost:5000/uploads/{fname}"

                yield json.dumps(update) + "\n"
                frame_count += 1

        except Exception as e:
            # any error becomes a single JSON error line
            yield json.dumps({"error": str(e)}) + "\n"

        finally:
            # cleanup
            cap.release()
            if os.path.exists(filepath):
                os.remove(filepath)

            # final summary
            yield json.dumps({
                "status": "done",
                "frames_processed": frame_count,
                "total_detections": total_detections
            }) + "\n"

    return Response(stream_with_context(generate()), mimetype="application/x-ndjson")

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
