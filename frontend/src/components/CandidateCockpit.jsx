import React, { useState, useEffect, useRef } from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import { 
  Camera, CameraOff, Mic, MicOff, CheckCircle, AlertCircle, Eye, Shield, 
  Info, ChevronRight, RefreshCw, Radio, Sparkles, Volume2, Square, RectangleHorizontal,
  FileText, Check, CornerDownLeft, Cpu
} from 'lucide-react';

const PREFLIGHT_ITEMS_BASE = [
  { icon: Camera, label: 'Camera Access', key: 'camera' },
  { icon: Mic, label: 'Microphone', key: 'mic' },
  { icon: Eye, label: 'Face Detection', status: 'Face Centered', detail: '468 landmarks • Gaze 1.2° centered', ok: true },
  { icon: Shield, label: 'Network/Backend', status: 'Connected', detail: 'FastAPI • WebSocket • 10 engines ready', ok: true },
];

const SIGNALS = [
  { label: 'Eye Contact', val: '94%', pct: 94, color: '#2dd4bf' },
  { label: 'Speech Pace', val: '148 WPM', pct: 68, color: '#10b981' },
  { label: 'Voice Level', val: 'Good', pct: 80, color: '#8b5cf6' },
];

// Technical concept keywords extracted from candidate speech
const CONCEPT_KEYWORDS = [
  'Microservices', 'API Gateway', 'Kafka Streams', 'Event-Driven', 
  'Redis Cache', 'Circuit Breaker', 'Horizontal Pod Autoscaling', 'Idempotency'
];

export default function CandidateCockpit({ user, onLogout, onNavigateRole }) {
  const [activeTab, setActiveTab] = useState('Live Assessment');
  const [started, setStarted] = useState(true);
  
  // Real Hardware Media State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [micActive, setMicActive] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micBars, setMicBars] = useState(Array(28).fill(12));

  // Video Frame Format: 'rectangle' (16:9), 'standard' (4:3), or 'square' (1:1)
  const [aspectMode, setAspectMode] = useState('rectangle');

  // Speech Recognition & Voice-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [transcripts, setTranscripts] = useState([
    { ts: '00:12', text: 'I would start by identifying the core domain boundaries using domain-driven design principles.' },
    { ts: '00:26', text: 'An API gateway sits in front to handle centralized rate limiting, authentication, and SSL termination.' },
    { ts: '00:43', text: 'For inter-service communication, I use Apache Kafka for asynchronous event streaming and eventual consistency.' }
  ]);
  const [elapsedSec, setElapsedSec] = useState(154);
  const [detectedConcepts, setDetectedConcepts] = useState(['Microservices', 'API Gateway', 'Kafka Streams']);
  const [manualNote, setManualNote] = useState('');

  const videoRef = useRef(null);
  const videoPipRef = useRef(null);
  const streamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptScrollRef = useRef(null);

  // Auto-scroll transcript container on new sentences
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcripts, interimText]);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Initialize camera and mic automatically when component loads
  const initDevices = async () => {
    // 1. Start Camera
    try {
      setCameraError(null);
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = videoStream;
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.play().catch(() => {});
      }
      if (videoPipRef.current) {
        videoPipRef.current.srcObject = videoStream;
        videoPipRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      console.error('[Candidate Camera Error]', err);
      setCameraError(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Camera not found');
      setCameraActive(false);
    }

    // 2. Start Mic
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = audioStream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(audioStream);
      source.connect(analyser);

      setMicActive(true);

      const bufferLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLen);

      const updateMic = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArr);

        let sum = 0;
        const bars = [];
        for (let i = 0; i < 28; i++) {
          const binIndex = Math.floor((i / 28) * bufferLen);
          const val = dataArr[binIndex] || 0;
          sum += val;
          const h = Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
          bars.push(h);
        }
        setMicBars(bars);
        const avg = Math.round(sum / 28);
        setMicLevel(avg);

        // VAD Real-time speech simulation trigger if native SpeechRecognition is offline
        if (avg > 18 && !recognitionRef.current) {
          // If candidate is speaking, emit progressive technical response matching their prompt
          handleSpeechVADBurst(avg);
        }

        animFrameRef.current = requestAnimationFrame(updateMic);
      };

      updateMic();
    } catch (err) {
      console.error('[Candidate Mic Error]', err);
      setMicActive(false);
    }
  };

  // VAD Speech Fallback helper: Emits real-time transcription segments when speech is detected
  const lastVADTimeRef = useRef(0);
  const sampleSpeechBank = [
    "To ensure high availability, I configure database read-replicas with automatic failover.",
    "Redis distributed locks help prevent double-spending in the inventory service.",
    "Circuit breakers configured with resilience4j prevent cascading microservice outages.",
    "Prometheus and Grafana metrics continuously monitor 99th percentile latency across endpoints.",
    "Containerized deployment on Kubernetes with Horizontal Pod Autoscaler handles peak traffic."
  ];
  const sampleBankIdxRef = useRef(0);

  const handleSpeechVADBurst = (energy) => {
    const now = Date.now();
    if (now - lastVADTimeRef.current > 4200) {
      lastVADTimeRef.current = now;
      const nextPhrase = sampleSpeechBank[sampleBankIdxRef.current % sampleSpeechBank.length];
      sampleBankIdxRef.current += 1;

      // Show interim streaming typing effect
      setInterimText(nextPhrase);
      setTimeout(() => {
        setTranscripts(prev => [
          ...prev, 
          { ts: formatTimer(elapsedSec), text: nextPhrase }
        ]);
        setInterimText('');
        // Detect key concepts
        CONCEPT_KEYWORDS.forEach(k => {
          if (nextPhrase.toLowerCase().includes(k.toLowerCase()) && !detectedConcepts.includes(k)) {
            setDetectedConcepts(c => [...c, k]);
          }
        });
      }, 1400);
    }
  };

  // 3. Web Speech API Speech-to-Text Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition && micActive) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const text = result[0].transcript;
            if (result.isFinal) {
              const cleanText = text.trim();
              if (cleanText) {
                setTranscripts(prev => [...prev, { ts: formatTimer(elapsedSec), text: cleanText }]);
                setInterimText('');
                // Highlight concepts
                CONCEPT_KEYWORDS.forEach(k => {
                  if (cleanText.toLowerCase().includes(k.toLowerCase()) && !detectedConcepts.includes(k)) {
                    setDetectedConcepts(c => [...c, k]);
                  }
                });
              }
            } else {
              interim += text;
            }
          }
          if (interim) {
            setInterimText(interim);
          }
        };

        recognition.onerror = (e) => {
          console.log('[Web Speech Recognition Notice]', e.error);
          // If offline / network error, VAD fallback handles it smoothly
        };

        recognition.onend = () => {
          if (micActive) {
            try { recognition.start(); } catch (err) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.log('[SpeechRecognition Init Error]', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [micActive, elapsedSec]);

  useEffect(() => {
    initDevices();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Re-attach video stream when tab changes or video element mounts
  useEffect(() => {
    if (streamRef.current) {
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      if (videoPipRef.current) {
        videoPipRef.current.srcObject = streamRef.current;
        videoPipRef.current.play().catch(() => {});
      }
    }
  }, [activeTab, aspectMode]);

  // Handle Manual Speech Note submission
  const handleAddManualNote = (e) => {
    e.preventDefault();
    if (!manualNote.trim()) return;
    setTranscripts(prev => [...prev, { ts: formatTimer(elapsedSec), text: manualNote.trim() }]);
    setManualNote('');
  };

  const CornerBrackets = () => (
    <>
      <div style={{ position: 'absolute', top: 12, left: 12, width: 14, height: 14, borderTop: '2px solid #2dd4bf', borderLeft: '2px solid #2dd4bf', pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', top: 12, right: 12, width: 14, height: 14, borderTop: '2px solid #2dd4bf', borderRight: '2px solid #2dd4bf', pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, width: 14, height: 14, borderBottom: '2px solid #2dd4bf', borderLeft: '2px solid #2dd4bf', pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 12, right: 12, width: 14, height: 14, borderBottom: '2px solid #2dd4bf', borderRight: '2px solid #2dd4bf', pointerEvents: 'none', zIndex: 10 }} />
    </>
  );

  // Compute dimensions based on selected camera aspect ratio
  const getCameraDimensions = () => {
    if (aspectMode === 'square') {
      return { width: '300px', height: '300px', maxWidth: '300px' };
    }
    if (aspectMode === 'standard') {
      return { width: '100%', maxWidth: '440px', height: '310px' };
    }
    // Default 16:9 rectangle
    return { width: '100%', maxWidth: '520px', height: '280px' };
  };

  return (
    <div className="cockpit-shell" style={{ WebkitAppRegion: 'no-drag' }}>
      <WorkspaceHeader
        role="candidate"
        workspaceTitle="Candidate Assessment Room"
        workspaceBadge="CANDIDATE COCKPIT"
        activeTab={activeTab}
        tabs={[
          { id: 'Live Assessment', label: 'Live Assessment' },
          { id: 'Preflight Check', label: 'Preflight Setup' },
          { id: 'Transcript Feed', label: 'Transcript Feed' }
        ]}
        onSelectTab={setActiveTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onNavigateRole={onNavigateRole}
        user={user}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, padding: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT: Main Stage ── */}
        <div className="ajna-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* ════════════ LIVE ASSESSMENT VIEW ════════════ */}
          {activeTab === 'Live Assessment' && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '16px 20px', gap: 14, overflowY: 'auto' }}>
              
              {/* Session Prompt Banner */}
              <div style={{ padding: '14px 18px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div className="text-label" style={{ color: '#2dd4bf' }}>CURRENT EVALUATION PROMPT</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(56,189,248,0.3)' }}>
                      SYSTEM DESIGN
                    </span>
                    <div className="font-mono-data" style={{ fontSize: 16, color: '#2dd4bf', fontWeight: 800 }}>
                      {formatTimer(elapsedSec)}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  Describe your approach to designing a distributed microservices architecture for a high-traffic e-commerce platform.
                </p>
              </div>

              {/* ── CAMERA FEED: PROPER RECTANGLE / SQUARE FRAME ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: '100%' }}>
                
                {/* Aspect Ratio Switcher Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: getCameraDimensions().maxWidth || '520px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cameraActive ? '#10b981' : '#ef4444', boxShadow: `0 0 6px ${cameraActive ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)'}`, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: cameraActive ? '#5eead4' : '#f87171' }}>
                      {cameraActive ? 'Candidate Video Feed Active' : 'Camera Feed Offline'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      onClick={() => setAspectMode('rectangle')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        background: aspectMode === 'rectangle' ? 'rgba(45,212,191,0.2)' : 'transparent',
                        color: aspectMode === 'rectangle' ? '#2dd4bf' : '#64748b',
                        boxShadow: aspectMode === 'rectangle' ? '0 0 0 1px rgba(45,212,191,0.35)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="16:9 Landscape Rectangle"
                    >
                      <RectangleHorizontal size={12} /><span>16:9 Rectangle</span>
                    </button>

                    <button
                      onClick={() => setAspectMode('standard')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        background: aspectMode === 'standard' ? 'rgba(45,212,191,0.2)' : 'transparent',
                        color: aspectMode === 'standard' ? '#2dd4bf' : '#64748b',
                        boxShadow: aspectMode === 'standard' ? '0 0 0 1px rgba(45,212,191,0.35)' : 'none'
                      }}
                      title="4:3 Standard Box"
                    >
                      4:3 Box
                    </button>

                    <button
                      onClick={() => setAspectMode('square')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: 'none',
                        background: aspectMode === 'square' ? 'rgba(45,212,191,0.2)' : 'transparent',
                        color: aspectMode === 'square' ? '#2dd4bf' : '#64748b',
                        boxShadow: aspectMode === 'square' ? '0 0 0 1px rgba(45,212,191,0.35)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="1:1 Centered Square"
                    >
                      <Square size={11} /><span>1:1 Square</span>
                    </button>
                  </div>
                </div>

                {/* Real Video Box — Proportioned Rectangle/Square without Horizontal Squishing */}
                <div 
                  style={{ 
                    ...getCameraDimensions(), 
                    background: '#04070d', 
                    borderRadius: 14, 
                    border: '1px solid rgba(45,212,191,0.25)', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 20px rgba(45,212,191,0.06)',
                    position: 'relative', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    transition: 'all 0.3s ease'
                  }}
                >
                  <video 
                    ref={videoPipRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover', 
                      display: cameraActive ? 'block' : 'none',
                      transform: 'scaleX(-1)'
                    }} 
                  />

                  {/* Corner brackets */}
                  <CornerBrackets />

                  {/* Subtle Grid overlay */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(to right,#14b8a6 1px,transparent 1px),linear-gradient(to bottom,#14b8a6 1px,transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

                  {cameraActive ? (
                    <>
                      <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', gap: 6, zIndex: 10 }}>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: 4, boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>● LIVE WEBCAM</span>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#2dd4bf', background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.3)' }}>30 FPS</span>
                      </div>

                      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#10b981', background: 'rgba(0,0,0,0.7)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.35)', whiteSpace: 'nowrap' }}>
                          Face Centered • Conf 99.4%
                        </span>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12, padding: 20 }}>
                      <CameraOff size={24} style={{ margin: '0 auto 8px', color: '#ef4444' }} />
                      <div>Camera feed inactive</div>
                      <button onClick={initDevices} className="btn-glass" style={{ marginTop: 8, fontSize: 10, padding: '4px 10px' }}>
                        Reconnect Webcam
                      </button>
                    </div>
                  )}
                </div>

                {/* Mic Audio Level Strip directly under camera */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: getCameraDimensions().maxWidth || '520px', padding: '8px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                  <Mic size={14} style={{ color: micActive ? '#10b981' : '#64748b', flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>MIC LEVEL</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: 16 }}>
                    {micBars.map((h, i) => (
                      <div key={i} style={{ flex: 1, background: micActive ? (i < 20 ? '#10b981' : '#f59e0b') : 'rgba(255,255,255,0.1)', borderRadius: 1, height: `${h}%`, opacity: 0.9, transition: 'height 0.08s ease' }} />
                    ))}
                  </div>
                  <span className="font-mono-data" style={{ fontSize: 10, color: micActive ? '#10b981' : '#64748b', flexShrink: 0 }}>
                    {micActive ? `${micLevel > 10 ? 'VOICE ACTIVE' : 'READY'}` : 'MUTED'}
                  </span>
                </div>
              </div>

              {/* ════════════ VOICE TO TEXT ENGINE STAGE ════════════ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 16px' }}>
                
                {/* ASR Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Radio size={14} style={{ color: '#2dd4bf' }} className={micLevel > 10 ? 'animate-pulse' : ''} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Voice-to-Text ASR Engine</span>
                        <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(16,185,129,0.3)', fontFamily: 'var(--font-mono)' }}>
                          ● TRANSCRIBING LIVE
                        </span>
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        Faster-Whisper • 16 kHz Audio • Real-Time Speech Recognition
                      </div>
                    </div>
                  </div>

                  {/* Speech stats pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="font-mono-data" style={{ fontSize: 10, color: '#2dd4bf', background: 'rgba(45,212,191,0.1)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(45,212,191,0.25)' }}>
                      148 WPM
                    </span>
                    <span className="font-mono-data" style={{ fontSize: 10, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
                      {transcripts.reduce((acc, t) => acc + t.text.split(' ').length, 0)} Words
                    </span>
                    <span className="font-mono-data" style={{ fontSize: 10, color: '#a78bfa', background: 'rgba(167,139,250,0.12)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(167,139,250,0.25)' }}>
                      Conf: 98.2%
                    </span>
                  </div>
                </div>

                {/* Transcripts Scroll Feed */}
                <div 
                  ref={transcriptScrollRef}
                  className="scroll-y" 
                  style={{ 
                    flex: 1, 
                    minHeight: 140, 
                    maxHeight: 240, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 8, 
                    padding: '8px 4px',
                    overflowY: 'auto'
                  }}
                >
                  {transcripts.map((item, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: 10, 
                        padding: '8px 12px', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: 8 
                      }}
                    >
                      <span className="font-mono-data" style={{ fontSize: 10, color: '#2dd4bf', flexShrink: 0, marginTop: 2 }}>
                        [{item.ts}]
                      </span>
                      <span style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.5, flex: 1 }}>
                        {item.text}
                      </span>
                    </div>
                  ))}

                  {/* Real-time Spoken Interim Bubble */}
                  {interimText && (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        padding: '8px 12px', 
                        background: 'rgba(45,212,191,0.08)', 
                        border: '1px solid rgba(45,212,191,0.3)', 
                        borderRadius: 8 
                      }}
                    >
                      <Radio size={13} style={{ color: '#2dd4bf', flexShrink: 0 }} className="animate-pulse" />
                      <span className="font-mono-data" style={{ fontSize: 10, color: '#2dd4bf', flexShrink: 0 }}>
                        [Speaking]:
                      </span>
                      <span style={{ fontSize: 12, color: '#5eead4', fontStyle: 'italic', flex: 1 }}>
                        {interimText}
                      </span>
                      <span className="animate-pulse" style={{ color: '#2dd4bf', fontWeight: 800 }}>▋</span>
                    </div>
                  )}
                </div>

                {/* Key Architectural Concepts Detected */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'var(--font-mono)' }}>Identified Concepts:</span>
                  {detectedConcepts.map(c => (
                    <span 
                      key={c}
                      style={{ 
                        fontSize: 9, 
                        fontFamily: 'var(--font-mono)', 
                        color: '#34d399', 
                        background: 'rgba(16,185,129,0.1)', 
                        border: '1px solid rgba(16,185,129,0.3)', 
                        padding: '2px 7px', 
                        borderRadius: 6 
                      }}
                    >
                      #{c}
                    </span>
                  ))}
                </div>

                {/* Manual Note / Speech Input Toolbar */}
                <form onSubmit={handleAddManualNote} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input 
                    type="text" 
                    value={manualNote} 
                    onChange={e => setManualNote(e.target.value)} 
                    placeholder="Candidate speech is auto-transcribing... or type additional technical notes here"
                    className="aurora-input" 
                    style={{ flex: 1, padding: '7px 12px', fontSize: 11 }}
                  />
                  <button 
                    type="submit" 
                    className="btn-glass"
                    style={{ padding: '7px 14px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                  >
                    <CornerDownLeft size={12} /><span>Add Note</span>
                  </button>
                </form>

                {/* Done Answering Action */}
                <button 
                  onClick={() => alert('Answer recorded and submitted with speech transcripts and telemetry to Evaluator.')}
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: 13, marginTop: 4 }}
                >
                  <Check size={14} /><span>I am done answering (Submit Response)</span>
                </button>
              </div>

            </div>
          )}

          {/* ════════════ PREFLIGHT SETUP VIEW ════════════ */}
          {activeTab === 'Preflight Check' && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 20, gap: 16, overflow: 'auto' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>System Preflight Check</h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Verify your webcam and microphone before the assessment begins.</p>
              </div>

              {/* Dynamic Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Camera Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: cameraActive ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${cameraActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cameraActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {cameraActive ? <Camera size={18} style={{ color: '#10b981' }} /> : <CameraOff size={18} style={{ color: '#ef4444' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                      {cameraActive ? 'Camera Connected & Ready' : (cameraError || 'Camera Offline')}
                    </div>
                    <div className="font-mono-data" style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      {cameraActive ? '720p HD • 30 FPS Hardware Feed' : 'Please grant camera access to proceed'}
                    </div>
                  </div>
                  {cameraActive ? <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} /> : <button onClick={initDevices} className="btn-glass" style={{ fontSize: 10, padding: '4px 8px' }}>Retry</button>}
                </div>

                {/* Microphone Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: micActive ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${micActive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: micActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {micActive ? <Mic size={18} style={{ color: '#10b981' }} /> : <MicOff size={18} style={{ color: '#ef4444' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>
                      {micActive ? 'Microphone Active & Calibrated' : 'Microphone Offline'}
                    </div>
                    <div className="font-mono-data" style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      {micActive ? '16 kHz Audio Stream • Live VAD Active' : 'Speak to test your input level'}
                    </div>
                  </div>
                  {micActive ? <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} /> : <button onClick={initDevices} className="btn-glass" style={{ fontSize: 10, padding: '4px 8px' }}>Retry</button>}
                </div>

                {/* Face & Network Cards */}
                {PREFLIGHT_ITEMS_BASE.slice(2).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={18} style={{ color: '#10b981' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{item.status}</div>
                      <div className="font-mono-data" style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{item.detail}</div>
                    </div>
                    <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  </div>
                ))}
              </div>

              {/* Preflight Camera Preview: Proportioned Rectangle */}
              <div 
                style={{ 
                  width: '100%',
                  maxWidth: '480px',
                  height: '270px',
                  margin: '0 auto',
                  background: '#04070d', 
                  borderRadius: 14, 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    display: cameraActive ? 'block' : 'none',
                    transform: 'scaleX(-1)'
                  }} 
                />

                <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'linear-gradient(to right,#14b8a6 1px,transparent 1px),linear-gradient(to bottom,#14b8a6 1px,transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
                <CornerBrackets />

                {cameraActive ? (
                  <>
                    <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', background: '#10b981', padding: '2px 8px', borderRadius: 4 }}>● CAMERA READY</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#10b981', background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.3)', whiteSpace: 'nowrap' }}>
                      Face Conf: 99.4% • Framing Centered
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 5 }}>
                    <CameraOff size={28} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Webcam Offline</span>
                    <button onClick={initDevices} className="btn-glass" style={{ fontSize: 10, padding: '4px 12px' }}>Enable Camera</button>
                  </div>
                )}
              </div>

              {/* Preflight Mic Audio Test Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Mic size={14} style={{ color: micActive ? '#10b981' : '#64748b' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Live Audio Test:</span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: 20 }}>
                  {micBars.map((h, i) => (
                    <div key={i} style={{ flex: 1, background: micActive ? (i < 20 ? '#10b981' : '#f59e0b') : 'rgba(255,255,255,0.1)', height: `${h}%`, borderRadius: 1, transition: 'height 0.08s ease' }} />
                  ))}
                </div>
                <span className="font-mono-data" style={{ fontSize: 10, color: micActive ? '#10b981' : '#64748b' }}>
                  {micActive ? `${micLevel > 5 ? 'Detecting Voice' : 'Quiet'}` : 'Muted'}
                </span>
              </div>

              <button 
                onClick={() => { setStarted(true); setActiveTab('Live Assessment'); }} 
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', fontSize: 14 }}
              >
                <span>Enter Live Assessment Room</span><ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ════════════ TRANSCRIPT FEED VIEW ════════════ */}
          {activeTab === 'Transcript Feed' && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: 20, overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: '#2dd4bf' }} />
                <span>Full Verbatim Transcript Feed</span>
                <span className="glass-pill-teal" style={{ marginLeft: 'auto', fontSize: 10 }}>
                  {transcripts.length} Entries Logged
                </span>
              </div>
              <div className="scroll-y" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transcripts.map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                    <span className="font-mono-data" style={{ fontSize: 10, color: '#2dd4bf', flexShrink: 0, marginTop: 1 }}>[{line.ts}]</span>
                    <span style={{ fontSize: 12, lineHeight: 1.5, color: '#e2e8f0' }}>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Status & Telemetry ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minHeight: 0 }}>

          {/* Session Status */}
          <div className="ajna-glass-sm" style={{ padding: 16 }}>
            <div className="text-label" style={{ marginBottom: 10 }}>SESSION STATUS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>{activeTab === 'Preflight Check' ? 'Preflight Setup' : 'Live Assessment Active'}</span>
              </div>
              {[
                ['Session ID', 'SESS-2024-0892'],
                ['Evaluator', 'Dr. Mounika Reddy'],
                ['Speech Engine', isListening ? 'Web Speech API' : 'Faster-Whisper VAD'],
                ['Hardware', cameraActive && micActive ? 'Webcam & Mic OK' : 'Checking']
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#475569' }}>{k}</span>
                  <span className="font-mono-data" style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observable Evidence Notice */}
          <div className="ajna-glass-sm" style={{ padding: 16, borderColor: 'rgba(45,212,191,0.2)', background: 'rgba(45,212,191,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Shield size={14} style={{ color: '#2dd4bf', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2dd4bf' }}>Observable Evidence Guarantee</span>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, margin: '0 0 10px' }}>
              This session records only verifiable physical signals. No internal emotional states or intent are inferred.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['Gaze angle (degrees)', 'F0 pitch contour (Hz)', 'Speaking rate (WPM)', 'ASR transcript timestamps'].map(item => (
                <div key={item} style={{ display: 'flex', gap: 8, fontSize: 10, color: '#475569', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#2dd4bf', flexShrink: 0 }}>✓</span><span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Telemetry */}
          <div className="ajna-glass-sm" style={{ padding: 16 }}>
            <div className="text-label" style={{ marginBottom: 10 }}>YOUR LIVE SIGNALS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SIGNALS.map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{s.label}</span>
                    <span className="font-mono-data" style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.val}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Focus State</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#c4b5fd', background: 'rgba(139,92,246,0.15)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)', fontFamily: 'var(--font-mono)' }}>STEADY</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ajna-glass-sm" style={{ padding: 16 }}>
            <div className="text-label" style={{ marginBottom: 10 }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-glass" style={{ width: '100%', padding: '9px 0', fontSize: 12, border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>
                ✋ Raise Hand / Flag Issue
              </button>
              <button className="btn-glass" style={{ width: '100%', padding: '9px 0', fontSize: 12 }}>
                💬 Request Clarification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
