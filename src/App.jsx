import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const CLOUD_NAME = "dcklzhxou";
  const UPLOAD_PRESET = "360photoboot";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error al abrir la cámara");
    }
  };

  const startRecording = () => {
    const stream = videoRef.current.srcObject;
    if (!stream) return alert("Encendé la cámara");

    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        record(stream);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const record = (stream) => {
    let chunks = [];
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstart = () => setIsRecording(true);

    recorder.onstop = async () => {
      setIsRecording(false);

      const blob = new Blob(chunks, { type: "video/mp4" });

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();

        // 🔁 BOOMERANG REAL
        const boomerangURL = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/e_loop:2/${data.public_id}.mp4`;

        setVideoURL(boomerangURL);
      } catch (err) {
        alert("Error subiendo el video");
      }
    };

    recorder.start();
    setTimeout(() => recorder.stop(), 10000);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 PhotoBooth 360</h1>

      <video ref={videoRef} autoPlay playsInline width="300" />

      {countdown && (
        <h1 style={{ fontSize: "60px", color: "red" }}>{countdown}</h1>
      )}

      <br /><br />

      <button onClick={startCamera}>Encender cámara</button>

      <br /><br />

      <button
        onClick={startRecording}
        disabled={isRecording}
        style={{
          padding: "15px",
          fontSize: "18px",
          backgroundColor: "red",
          color: "white",
          borderRadius: "10px"
        }}
      >
        {isRecording ? "🎥 Grabando..." : "🔴 Grabar Boomerang"}
      </button>

      {videoURL && (
        <div>
          <h3>🎬 Boomerang listo:</h3>

          <video src={videoURL} controls width="300" />

          <br /><br />

          <a href={videoURL} download>
            <button>⬇️ Descargar video</button>
          </a>
        </div>
      )}
    </div>
  );
}