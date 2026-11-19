import { useRef, useState, useCallback } from 'react';

export function useMediaCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSimulated, setIsSimulated] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const animFrameRef = useRef(null);
  const onVideoFrameRef = useRef(null);
  const onAudioChunkRef = useRef(null);

  // Helper to attach current active stream to any video element
  const attachVideoElement = useCallback((videoElement) => {
    if (!videoElement) return;
    videoRef.current = videoElement;
    if (streamRef.current) {
      try {
        videoElement.srcObject = streamRef.current;
        videoElement.play().catch(e => console.log('Video element play:', e));
      } catch (err) {
        console.warn('attachVideoElement error:', err);
      }
    }
  }, []);

  const startCapture = useCallback(async (videoElement, onVideo, onAudio) => {
    if (videoElement) videoRef.current = videoElement;
    if (onVideo) onVideoFrameRef.current = onVideo;
    if (onAudio) onAudioChunkRef.current = onAudio;

    let stream = null;

    // 1. Try real WebCam with ideal (tolerant) constraints
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
            audio: true
          });
        } catch (e1) {
          console.warn('High-res media failed, trying basic video+audio:', e1);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch (e2) {
            console.warn('Audio+video failed, trying video only:', e2);
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
        }
      }
    } catch (hardwareErr) {
      console.warn('Physical camera/mic error:', hardwareErr);
    }

    if (stream) {
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log('Video play:', e));
      }

      // Audio Context + Analyser if audio tracks exist
      try {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks && audioTracks.length > 0) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const audioCtx = new AudioCtx({ sampleRate: 16000 });
          audioContextRef.current = audioCtx;
          
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          source.connect(analyser);

          // ScriptProcessor fallback
          const scriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
          scriptNode.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              const s = Math.max(-1, Math.min(1, input[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            if (onAudioChunkRef.current) onAudioChunkRef.current(pcm16.buffer);
          };
          source.connect(scriptNode);
          const muteGain = audioCtx.createGain();
          muteGain.gain.value = 0;
          scriptNode.connect(muteGain);
          muteGain.connect(audioCtx.destination);

          // Audio Level Polling
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkAudioLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length / 255;
            setAudioLevel(avg);
            animFrameRef.current = requestAnimationFrame(checkAudioLevel);
          };
          checkAudioLevel();
        }
      } catch (audioErr) {
        console.warn('Audio processing initialization warning:', audioErr);
      }

      // Video frame streaming to WebSocket
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      captureIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob && onVideoFrameRef.current) {
              onVideoFrameRef.current(blob);
            }
          }, 'image/jpeg', 0.8);
        }
      }, 1000 / 15);

      setIsCapturing(true);
      setIsSimulated(false);
      return;
    }

    // 2. Fallback: Dynamic Real-Time Simulation Stream
    console.log('Activating dynamic face simulation stream...');
    setIsCapturing(true);
    setIsSimulated(true);

    const simCanvas = document.createElement('canvas');
    simCanvas.width = 640;
    simCanvas.height = 480;
    const sCtx = simCanvas.getContext('2d');
    let angle = 0;

    // Simulated animated video stream with realistic face
    const frameInt = setInterval(() => {
      angle += 0.05;
      // Background gradient
      const bgGrad = sCtx.createLinearGradient(0, 0, 0, 480);
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(1, '#050811');
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, 640, 480);

      const cx = 320 + Math.sin(angle) * 15;
      const cy = 240 + Math.cos(angle * 0.8) * 8;

      // Realistic Face Shape
      sCtx.fillStyle = '#fce7d2';
      sCtx.beginPath();
      sCtx.ellipse(cx, cy, 95, 125, 0, 0, Math.PI * 2);
      sCtx.fill();

      // Hair
      sCtx.fillStyle = '#1e1b18';
      sCtx.beginPath();
      sCtx.ellipse(cx, cy - 75, 105, 75, 0, Math.PI, Math.PI * 2);
      sCtx.fill();

      // Eyes
      sCtx.fillStyle = '#ffffff';
      sCtx.beginPath();
      sCtx.ellipse(cx - 38, cy - 15, 18, 10, 0, 0, Math.PI * 2);
      sCtx.ellipse(cx + 38, cy - 15, 18, 10, 0, 0, Math.PI * 2);
      sCtx.fill();

      // Irises / Pupils
      const eyeDx = Math.sin(angle * 1.5) * 4;
      sCtx.fillStyle = '#2563eb';
      sCtx.beginPath();
      sCtx.arc(cx - 38 + eyeDx, cy - 15, 7, 0, Math.PI * 2);
      sCtx.arc(cx + 38 + eyeDx, cy - 15, 7, 0, Math.PI * 2);
      sCtx.fill();

      // Nose
      sCtx.strokeStyle = '#d49b78';
      sCtx.lineWidth = 2.5;
      sCtx.beginPath();
      sCtx.moveTo(cx, cy - 10);
      sCtx.lineTo(cx - 4, cy + 22);
      sCtx.lineTo(cx + 8, cy + 22);
      sCtx.stroke();

      // Mouth
      sCtx.strokeStyle = '#c56858';
      sCtx.lineWidth = 3;
      sCtx.beginPath();
      sCtx.arc(cx, cy + 50, 22, 0.1, Math.PI - 0.1);
      sCtx.stroke();

      // Stream to WebSocket
      simCanvas.toBlob((blob) => {
        if (blob && onVideoFrameRef.current) {
          onVideoFrameRef.current(blob);
        }
      }, 'image/jpeg', 0.8);
    }, 1000 / 30);

    // Capture Canvas stream to video element
    try {
      if (simCanvas.captureStream) {
        const simStream = simCanvas.captureStream(30);
        streamRef.current = simStream;
        if (videoRef.current) {
          videoRef.current.srcObject = simStream;
          videoRef.current.play().catch(e => console.log('Sim video play:', e));
        }
      }
    } catch (e) {
      console.warn('captureStream error:', e);
    }

    // Simulated audio
    const audioInt = setInterval(() => {
      const samples = 1600;
      const pcm16 = new Int16Array(samples);
      const freq = 180 + Math.sin(Date.now() / 500) * 30;
      for (let i = 0; i < samples; i++) {
        pcm16[i] = Math.sin(2 * Math.PI * freq * (i / 16000)) * 12000;
      }
      if (onAudioChunkRef.current) {
        onAudioChunkRef.current(pcm16.buffer);
      }
      setAudioLevel(0.35 + Math.sin(Date.now() / 400) * 0.2);
    }, 100);

    captureIntervalRef.current = frameInt;
    audioContextRef.current = { _simAudioInt: audioInt, close: () => clearInterval(audioInt) };
  }, []);

  const stopCapture = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (streamRef.current) {
      if (streamRef.current.getTracks) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current._simAudioInt) {
        clearInterval(audioContextRef.current._simAudioInt);
      } else if (audioContextRef.current.close) {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
    setIsSimulated(false);
    setAudioLevel(0);
  }, []);

  return { startCapture, stopCapture, attachVideoElement, isCapturing, isSimulated, audioLevel };
}
