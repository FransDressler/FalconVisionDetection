import { useState, useRef } from 'react';
import { useModels } from '../context/ModelContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/icon.png';
// Types
interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  class: number;
}

interface FrameUpdate {
  frame?: number;
  timestamp?: number;
  progress?: number;
  detections?: Detection[];
  image?: string;
  total_frames?: number;
  status?: string;
  frames_processed?: number;
  total_detections?: number;
}

interface Props {
  language: 'de' | 'en';
}

function VideoAnalysis({ language }: Props) {
  const t = (de: string, en: string) => (language === 'de' ? de : en);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [detections, setDetections] = useState<FrameUpdate[]>([]);
  const [skipValue, setSkipValue] = useState<number>(35);
  const { models } = useModels();
  const [selectedModel, setSelectedModel] = useState<string>('ensemble_yolov11l');
  const ortMapRef = useRef<Record<number, string>>({});

  const selectedModelObject = models.find((m) => m.value === selectedModel);

  const handleOrtChange = (frame: number, value: string) => {
    ortMapRef.current[frame] = value;
  };

  const handleStreamUpload = async () => {
    if (!file) return;
    setDetections([]);
    setProgress(0);
    ortMapRef.current = {};

    const formData = new FormData();
    formData.append('video', file);

    try {
      let url = `http://localhost:5000/detect_stream?skip=${skipValue}&model=${selectedModel}`;
      if (selectedModelObject?.path) {
        url += `&path=${encodeURIComponent(selectedModelObject.path)}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) return;

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        chunk.split("\n").forEach((line) => {
          if (!line.trim()) return;
          const data: FrameUpdate = JSON.parse(line);
          if (data.status === 'done') {
            setProgress(100);
            return;
          }
          if (data.progress !== undefined) {
            setProgress((prev) => Math.max(prev, data.progress));
          }
          if (data.detections && data.timestamp !== undefined) {
            setDetections((prev) => [...prev, data]);
          }
        });
      }
    } catch (error) {
      console.error("❌ Upload/Streaming Error:", error);
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();

    for (let i = 0; i < detections.length; i++) {
      const frame = detections[i];
      if (frame.image) {
        const imgData = await fetch(frame.image)
          .then((res) => res.blob())
          .then((blob) => new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          }));

        doc.addImage(imgData, 'JPEG', 10, 10, 60, 45);
      }

      const ort = ortMapRef.current[frame.frame ?? 0] || "-";

      autoTable(doc, {
        startY: 60,
        head: [[
          t('Frame', 'Frame'),
          t('Zeitstempel (s)', 'Timestamp (s)'),
          t('Ort', 'Location'),
          t('Klasse', 'Class'),
          t('Confidence', 'Confidence'),
          t('Position', 'Position')
        ]],
        body: frame.detections?.map((d) => [
          frame.frame,
          frame.timestamp?.toFixed(2),
          ort,
          d.class,
          `${(d.confidence * 100).toFixed(1)}%`,
          `[${d.x1}, ${d.y1}] → [${d.x2}, ${d.y2}]`
        ]) ?? []
      });

      if (i < detections.length - 1) {
        doc.addPage();
      }
    }

    doc.save("FalconVision-Detections.pdf");};
  
    return (
      <div className="min-h-screen bg-gray-100 p-6 text-center">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="FalconVision Icon" className="h-24 w-24 object-contain drop-shadow-lg mb-2" />
          <h1 className="text-4xl font-extrabold drop-shadow-lg text-sky-700 tracking-wide uppercase">
            Falcon Vision
          </h1>
        </div>
  
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="cursor-pointer drop-shadow-lg border-2 border-sky-400 bg-white text-gray-700 px-4 py-2 rounded-full shadow-sm hover:bg-sky-100 hover:border-sky-500 transition"
          />
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Modell:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="border px-2 py-1 rounded shadow-sm"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {language === 'de' ? m.label_de : m.label_en}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700 drop-shadow-lg">
              {t('Skip Frames:', 'Skip frames:')}
            </label>
            <input
              type="number"
              value={skipValue}
              onChange={(e) => setSkipValue(parseInt(e.target.value))}
              className="border px-2 py-1 drop-shadow-lg rounded shadow-sm w-20"
            />
          </div>
        </div>
  
        <button
          onClick={handleStreamUpload}
          className="px-6 py-2 bg-sky-600 drop-shadow-lg text-white font-semibold rounded shadow hover:bg-sky-700 transition disabled:opacity-50"
          disabled={!file}
        >
          {t('Video analysieren', 'Analyze video')}
        </button>
  
        <div className="w-full max-w-xl mx-auto drop-shadow-lg rounded-full h-5 mt-6 relative shadow-inner bg-gray-200">
          <div className="absolute inset-0 flex justify-center items-center text-sm font-bold text-gray-800 z-10">
            {progress.toFixed(0)}%
          </div>
          <div
            className="bg-sky-500 h-5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
  
        {/* PDF Download-Button */}
        <div className="mt-6">
          <button
            onClick={downloadPDF}
            disabled={progress < 100 || detections.length === 0}
            className={`px-4 py-2 rounded font-semibold shadow ${
              progress < 100 || detections.length === 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {t('PDF herunterladen', 'Download PDF')}
          </button>
        </div>
  
        {/* Restlicher Output wie gehabt */}
        {detections.length > 0 && (
          <div className="mt-10 text-left max-w-5xl mx-auto">
            <h2 className="text-2xl drop-shadow-lg font-semibold mb-4 border-b pb-2 text-sky-800">
              {t('Frames mit Detektionen', 'Frames with detections')}
            </h2>
  
            <div className="flex flex-col gap-6">
              {detections.map((update, index) => (
                <div key={index} className="flex flex-col md:flex-row border border-gray-300 rounded-lg shadow-md bg-white overflow-hidden hover:shadow-lg transition">
                  <div className="md:w-1/2">
                    {update.image && (
                      <img src={update.image} alt={`Frame ${update.frame}`} className="w-full object-cover" />
                    )}
                  </div>
  
                  <div className="md:w-1/2 p-4 flex flex-col gap-3 text-sm text-gray-700">
                    <p><strong>🖼 {t('Frame', 'Frame')}:</strong> {update.frame}</p>
                    <p><strong>🕒 {t('Zeitstempel', 'Timestamp')}:</strong> {update.timestamp?.toFixed(2)} s</p>
                    <p><strong>🧍 {t('Detektionen', 'Detections')}:</strong> {update.detections?.length}</p>
  
                    {update.detections?.map((box, i) => (
                      <div key={i} className="border border-gray-200 rounded p-2 bg-gray-50 shadow-sm">
                        <p><strong>{t('Klasse', 'Class')}:</strong> {box.class} | <strong>Confidence:</strong> {(box.confidence * 100).toFixed(1)}%</p>
                        <p><strong>{t('Position', 'Position')}:</strong> [{box.x1}, {box.y1}] → [{box.x2}, {box.y2}]</p>
                      </div>
                    ))}
  
                    <div className="border-t pt-2">
                      <label htmlFor={`ort-${update.frame}`} className="font-semibold block mb-1">
                        📍 {t('Ort', 'Location')}:
                      </label>
                      <input
                        type="text"
                        id={`ort-${update.frame}`}
                        className="border rounded px-2 py-1 w-full"
                        placeholder={t('Ort eingeben', 'Enter location')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  export default VideoAnalysis;