import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });

      videoRef.current.srcObject = stream;
    } catch (err) {
      console.log(err);
      alert("Error al acceder a la cámara. Probá en Safari y con HTTPS.");
    }
  };

  const startRecording = () => {
    const stream = videoRef.current.srcObject;

    if (!stream) {
      alert("Primero encendé la cámara");
      return;
    }

    let chunks = [];

    let options = {};
    if (MediaRecorder.isTypeSupported("video/mp4")) {
      options.mimeType = "video/mp4";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options.mimeType = "video/webm";
    }

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstart = () => {
      setIsRecording(true);
    };

    mediaRecorder.onstop = () => {
      setIsRecording(false);

      if (chunks.length === 0) {
        alert("No se pudo grabar el video (limitación de iPhone)");
        return;
      }

      const blob = new Blob(chunks, { type: options.mimeType || "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 PhotoBooth 360</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="300"
        style={{ borderRadius: "10px" }}
      />

      <br /><br />

      <button onClick={startCamera}>
        Encender cámara
      </button>

      <button onClick={startRecording} disabled={isRecording}>
        {isRecording ? "Grabando..." : "Grabar 5s"}
      </button>

      {videoURL && (
        <div>
          <h3>Vista previa:</h3>

          <video src={videoURL} controls width="300" />

          <br /><br />

          <a href={videoURL} download="video360.mp4">
            <button>⬇️ Descargar video</button>
          </a>
        </div>
      )}
    </div>
  );
}