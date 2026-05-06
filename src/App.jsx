import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);

  const [videoURL, setVideoURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const CLOUD_NAME = "dcklzhxou";
  const UPLOAD_PRESET = "360photoboot";

  // 📸 CÁMARA (optimizada iPhone)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error al acceder a la cámara");
    }
  };

  // ⏱️ CUENTA REGRESIVA
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

  // 🎥 GRABACIÓN (fix iPhone)
  const record = (stream) => {
    let chunks = [];

    let options = {};

    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
      options.mimeType = "video/webm;codecs=vp8";
    } else if (MediaRecorder.isTypeSupported("video/mp4")) {
      options.mimeType = "video/mp4";
    }

    const recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstart = () => setIsRecording(true);

    recorder.onstop = async () => {
      setIsRecording(false);

      if (chunks.length === 0) {
        alert("No se grabó video");
        return;
      }

      const blob = new Blob(chunks, { type: options.mimeType });

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

        // 🔥 BOOMERANG COMPATIBLE iPHONE
        const boomerangURL = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_mp4,vc_h264,e_loop:2/${data.public_id}.mp4`;

        setVideoURL(boomerangURL);
      } catch (err) {
        alert("Error subiendo el video");
      }
    };

    recorder.start(100); // importante para iPhone

    setTimeout(() => recorder.stop(), 10000); // 10 segundos
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 PhotoBooth 360 PRO</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="300"
        style={{ borderRadius: "10px" }}
      />

      {countdown && (
        <h1 style={{ fontSize: "60px", color: "red" }}>
          {countdown}
        </h1>
      )}

      <br /><br />

      <button onClick={startCamera}>
        Encender cámara
      </button>

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