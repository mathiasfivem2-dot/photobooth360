import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);

  const [images, setImages] = useState([]);
  const [videoURL, setVideoURL] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const CLOUD_NAME = "dcklzhxou";
  const UPLOAD_PRESET = "360photoboot";

  // 📸 cámara
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    videoRef.current.srcObject = stream;
  };

  // ⏱️ countdown
  const startCapture = () => {
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        captureFrames();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  // 📷 capturar fotos
  const captureFrames = () => {
    setCapturing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let frames = [];
    let total = 30; // cantidad de fotos

    let i = 0;

    const interval = setInterval(() => {
      ctx.drawImage(video, 0, 0);
      frames.push(canvas.toDataURL("image/jpeg"));

      i++;

      if (i >= total) {
        clearInterval(interval);
        setCapturing(false);
        uploadFrames(frames);
      }
    }, 100); // velocidad
  };

  // ☁️ subir imágenes
  const uploadFrames = async (frames) => {
    try {
      let uploaded = [];

      for (let img of frames) {
        const res = await fetch(img);
        const blob = await res.blob();

        const formData = new FormData();
        formData.append("file", blob);
        formData.append("upload_preset", UPLOAD_PRESET);

        const upload = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData
          }
        );

        const data = await upload.json();
        uploaded.push(data.public_id);
      }

      // 🎥 generar video boomerang
      const base = uploaded[0];

      const video = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/fl_splice,l_${uploaded
        .join("/")}/fl_layer_apply,e_loop:2,f_mp4,vc_h264/${base}.mp4`;

      setVideoURL(video);
    } catch (err) {
      alert("Error generando video");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 PhotoBooth 360 PRO</h1>

      <video ref={videoRef} autoPlay playsInline width="300" />

      {countdown && (
        <h1 style={{ fontSize: "60px", color: "red" }}>{countdown}</h1>
      )}

      {capturing && <h2>📷 Capturando...</h2>}

      <br /><br />

      <button onClick={startCamera}>Encender cámara</button>

      <br /><br />

      <button onClick={startCapture}>
        🔴 Crear Boomerang
      </button>

      {videoURL && (
        <div>
          <h3>🎬 Resultado:</h3>

          <video src={videoURL} controls width="300" />

          <br /><br />

          <a href={videoURL} download>
            <button>⬇️ Descargar</button>
          </a>
        </div>
      )}
    </div>
  );
}