import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment" // usa cámara trasera (mejor en iPhone)
      },
      audio: false
    });

    videoRef.current.srcObject = stream;
  } catch (err) {
    console.log(err);
    alert("iPhone bloqueó la cámara. Probá recargar la página.");
  }
};

  const startRecording = () => {
    const stream = videoRef.current.srcObject;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    let chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>📸 PhotoBooth 360</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="300"
        style={{ borderRadius: "10px" }}
      />

      <br /><br />

      <button onClick={startCamera}>Encender cámara</button>
      <button onClick={startRecording}>Grabar 5s</button>

{videoURL && (
  <div>
    <h3>Vista previa:</h3>

    <video src={videoURL} controls width="300" />

    <br /><br />

    <a href={videoURL} download="video360.webm">
      <button>⬇️ Descargar video</button>
    </a>
  </div>
)}