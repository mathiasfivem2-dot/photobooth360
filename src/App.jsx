import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [videoURL, setVideoURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [playReverse, setPlayReverse] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });

      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Error cámara. Usá Safari.");
    }
  };

  const startRecording = () => {
    const stream = videoRef.current.srcObject;

    if (!stream) {
      alert("Encendé la cámara primero");
      return;
    }

    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count--;

      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        recordVideo(stream);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const recordVideo = (stream) => {
    let chunks = [];

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstart = () => setIsRecording(true);

    mediaRecorder.onstop = () => {
      setIsRecording(false);

      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);

      startBoomerangEffect();
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 10000); // 10 segundos
  };

  // 🔁 BOOMERANG SIMPLE (reproducción ida/vuelta)
  const startBoomerangEffect = () => {
    setPlayReverse(false);

    setInterval(() => {
      setPlayReverse(prev => !prev);
    }, 2000);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 PhotoBooth 360</h1>

      <video ref={videoRef} autoPlay playsInline width="300" />

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
        {isRecording ? "🎥 Grabando..." : "🔴 Grabar 10s"}
      </button>

      {videoURL && (
        <div>
          <h3>Vista previa (boomerang):</h3>

          <video
            src={videoURL}
            width="300"
            autoPlay
            loop
            controls
            style={{
              transform: playReverse ? "scaleX(-1)" : "scaleX(1)"
            }}
          />

          <br /><br />

          <a href={videoURL} download="video360.mp4">
            <button>⬇️ Descargar video</button>
          </a>
        </div>
      )}
    </div>
  );
}