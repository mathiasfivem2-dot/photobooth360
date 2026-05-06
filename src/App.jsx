import { useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const [videoURL, setVideoURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // 📸 CÁMARA (intenta 0.5x)
  const startCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === "videoinput");

      // intenta elegir cámara ultra wide
      const ultraWide = videoDevices.find(d =>
        d.label.toLowerCase().includes("ultra") ||
        d.label.toLowerCase().includes("back")
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: ultraWide
          ? { deviceId: { exact: ultraWide.deviceId } }
          : { facingMode: "environment" },
        audio: true,
      });

      videoRef.current.srcObject = stream;
    } catch (err) {
      console.log(err);
      alert("Error cámara. Probá en Safari.");
    }
  };

  // ⏱️ CUENTA REGRESIVA
  const startRecording = () => {
    const stream = videoRef.current.srcObject;

    if (!stream) {
      alert("Primero encendé la cámara");
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

  // 🎥 GRABACIÓN 10 SEGUNDOS
  const recordVideo = (stream) => {
    let chunks = [];

    let options = {};
    if (MediaRecorder.isTypeSupported("video/mp4")) {
      options.mimeType = "video/mp4";
    }

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstart = () => setIsRecording(true);

    mediaRecorder.onstop = () => {
      setIsRecording(false);

      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      createBoomerang(url);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 10000); // ⬅️ 10 segundos
  };

  // 🔁 BOOMERANG
  const createBoomerang = (videoSrc) => {
    const video = document.createElement("video");
    video.src = videoSrc;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      let frames = [];
      let fps = 30;
      let duration = video.duration;
      let totalFrames = Math.floor(duration * fps);

      let currentFrame = 0;

      const captureFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg"));

        currentFrame++;

        if (currentFrame < totalFrames) {
          video.currentTime = currentFrame / fps;
        } else {
          generateBoomerang(frames);
        }
      };

      video.addEventListener("seeked", captureFrame);

      video.currentTime = 0;
    };
  };

  const generateBoomerang = (frames) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = frames[0];

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      let allFrames = [...frames, ...frames.reverse()];

      let i = 0;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream);

      let chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      };

      recorder.start();

      const draw = () => {
        if (i >= allFrames.length) {
          recorder.stop();
          return;
        }

        const frameImg = new Image();
        frameImg.src = allFrames[i];

        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          i++;
          setTimeout(draw, 30);
        };
      };

      draw();
    };
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>📸 PhotoBooth 360 PRO</h1>

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
        {isRecording ? "🎥 Grabando..." : "🔴 Grabar Boomerang"}
      </button>

      {videoURL && (
        <div>
          <h3>Resultado:</h3>

          <video src={videoURL} controls width="300" />

          <br /><br />

          <a href={videoURL} download="boomerang.mp4">
            <button>⬇️ Descargar</button>
          </a>
        </div>
      )}
    </div>
  );
}