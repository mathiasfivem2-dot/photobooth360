import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    videoRef.current.srcObject = stream;
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

    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.onstart = () => setIsRecording(true);

    recorder.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      createBoomerang(url);
    };

    recorder.start();

    setTimeout(() => recorder.stop(), 10000);
  };

  // 🔁 CREAR BOOMERANG REAL
  const createBoomerang = (src) => {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream);

      let chunks = [];

      recorder.ondataavailable = e => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      recorder.start();

      let forward = true;

      const draw = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (forward) {
          video.currentTime += 0.03;
          if (video.currentTime >= video.duration) forward = false;
        } else {
          video.currentTime -= 0.03;
          if (video.currentTime <= 0) forward = true;
        }

        requestAnimationFrame(draw);
      };

      video.play();
      draw();

      setTimeout(() => recorder.stop(), 8000); // duración boomerang
    };
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
          <h3>Resultado Boomerang:</h3>

          <video src={videoURL} controls width="300" />

          <br /><br />

          <a href={videoURL} download="boomerang.mp4">
            <button>⬇️ Descargar Boomerang</button>
          </a>
        </div>
      )}
    </div>
  );
}