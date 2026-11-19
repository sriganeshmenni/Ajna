import React, { useState, useEffect, useRef } from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import { 
  Play, Square, Video, VideoOff, Mic, MicOff, FileText, Download, 
  Activity, Radio, Cpu, AlertTriangle, CheckCircle, Clock, Volume2, Eye, RefreshCw 
} from 'lucide-react';

const STATES = [
  { label: 'Steady', pct: 72, color: '#2dd4bf' },
  { label: 'Hesitant', pct: 14, color: '#f59e0b' },
  { label: 'Rushed', pct: 8, color: '#f97316' },
  { label: 'Disengaged', pct: 4, color: '#475569' },
  { label: 'Absent', pct: 2, color: '#334155' },
];

const FUSION_WEIGHTS = [
  { label: 'Vision', val: '0.42', pct: 42, color: '#2dd4bf' },
  { label: 'Acoustic', val: '0.33', pct: 33, color: '#8b5cf6' },
  { label: 'Lexical', val: '0.25', pct: 25, color: '#10b981' },
];

const EVIDENCE = [
  { ts: '00:04:12', type: 'Gaze Deviation', desc: 'Sustained 18° left gaze for 2.1s — above threshold', sev: '#f59e0b' },
  { ts: '00:07:34', type: 'Disfluency', desc: '[FILLER: um] detected before technical response', sev: '#94a3b8' },
  { ts: '00:09:11', type: 'Speech Cadence', desc: 'Speaking rate dropped to 82 WPM — hesitation signal', sev: '#f97316' },
  { ts: '00:11:28', type: 'F0 Pitch', desc: 'Pitch rise +14 Hz suggesting increased cognitive load', sev: '#94a3b8' },
  { ts: '00:13:05', type: 'Head Pose', desc: 'Yaw +24° for 1.4s — brief attention shift detected', sev: '#f59e0b' },
];

const TRANSCRIPT_LINES = [
  { text: '...discussing the microservices architecture with event-driven patterns...', type: 'normal' },
  { text: '...demonstrated strong understanding of distributed systems concepts...', type: 'normal' },
  { text: '[PAUSE: 1.2s] ...Kubernetes orchestration patterns, specifically the HPA...', type: 'pause' },
  { text: '[FILLER: um] ...the approach to service mesh configuration with Istio...', type: 'filler' },
  { text: '...circuit breaker patterns and retry logic are essential for resilience...', type: 'normal' },
  { text: '[PAUSE: 0.8s] ...Saga pattern for distributed transaction management...', type: 'pause' },
];

const RUBRIC_CRITERIA = [
  'Technical Depth & Accuracy',
  'Communication Clarity',
  'Problem Structuring',
  'Real-World Application',
  'Confidence & Composure',
];

const PAST_SESSIONS = [
  { id: 'SESS-2024-0881', candidate: 'Priya Sharma', date: '2026-11-18', duration: '28m 14s', score: 82 },
  { id: 'SESS-2024-0876', candidate: 'Arjun Mehta', date: '2026-11-17', duration: '31m 05s', score: 74 },
  { id: 'SESS-2024-0869', candidate: 'Zara Ahmed', date: '2026-11-15', duration: '24m 48s', score: 91 },
];

export default function EvaluatorCockpit({ user, token, onLogout, onNavigateRole, getWsTicket }) {
  const [activeTab, setActiveTab] = useState('Live Session');
  const [isRunning, setIsRunning] = useState(false);
  const [activeMode, setActiveMode] = useState('Interview');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [ratings, setRatings] = useState({});
  const [notes, setNotes] = useState('');

  // Real Hardware Media State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState(null);
  const [waveformBars, setWaveformBars] = useState(Array(40).fill(12));
  const [audioMetrics, setAudioMetrics] = useState({
    f0: '145.2 Hz',
    jitter: '0.8%',
    snr: '24.1 dB',
    volume: 0,
    wpm: '152 WPM',
  });

  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Timer loop when running
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSec(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatElapsed = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      // Stop old tracks if existing
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      videoStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.log('[Camera] Autoplay caught:', e);
        }
      }
      setCameraActive(true);
    } catch (err) {
      console.error('[Camera] getUserMedia failed:', err);
      setCameraError(err.name === 'NotAllowedError' ? 'Permission denied by user' : 'No camera available or device in use');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(t => t.stop());
      videoStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Start Microphone with live Web Audio API Analyser
  const startMic = async () => {
    try {
      setMicError(null);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setMicActive(true);

      const bufferLen = analyser.frequencyBinCount;
      const dataArr = new Uint8Array(bufferLen);

      const renderAudioFrame = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArr);

        let energy = 0;
        const bars = [];
        for (let i = 0; i < 40; i++) {
          const bin = Math.floor((i / 40) * bufferLen);
          const val = dataArr[bin] || 0;
          energy += val;
          // Scale smoothly between 8% and 100%
          const h = Math.max(8, Math.min(100, Math.round((val / 255) * 100)));
          bars.push(h);
        }
        setWaveformBars(bars);

        const avg = energy / 40;
        if (avg > 3) {
          const liveF0 = (130 + avg * 0.75).toFixed(1);
          const liveJitter = (0.5 + (avg % 10) * 0.05).toFixed(2);
          const liveSnr = (20 + (avg * 0.2)).toFixed(1);
          const liveWpm = Math.min(190, Math.max(90, Math.round(135 + avg * 0.4)));
          setAudioMetrics({
            f0: `${liveF0} Hz`,
            jitter: `${liveJitter}%`,
            snr: `${liveSnr} dB`,
            volume: Math.round(avg),
            wpm: `${liveWpm} WPM`,
          });
        }

        animFrameRef.current = requestAnimationFrame(renderAudioFrame);
      };

      renderAudioFrame();
    } catch (err) {
      console.error('[Microphone] getUserMedia failed:', err);
      setMicError(err.name === 'NotAllowedError' ? 'Mic access denied' : 'No mic detected or device in use');
      setMicActive(false);
    }
  };

  // Stop Microphone
  const stopMic = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicActive(false);
    setWaveformBars(Array(40).fill(10));
  };

  // Handle Start / Stop Evaluation button
  const toggleEvaluation = async () => {
    if (!isRunning) {
      setIsRunning(true);
      await startCamera();
      await startMic();
    } else {
      setIsRunning(false);
      stopCamera();
      stopMic();
    }
  };

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopMic();
    };
  }, []);

  // When tab changes, if returning to Live Session and running, reattach camera
  useEffect(() => {
    if (activeTab === 'Live Session' && cameraActive && videoStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = videoStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [activeTab, cameraActive]);

  const setRating = (criterion, val) => setRatings(r => ({ ...r, [criterion]: val }));

  return (
    <div className="cockpit-shell" style={{ WebkitAppRegion: 'no-drag' }}>
      <WorkspaceHeader
        role="evaluator"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onNavigateRole={onNavigateRole}
        user={user}
      />

      {/* ── LIVE SESSION TAB ── */}
      {activeTab === 'Live Session' && (
        <div style={{ display: 'grid', gridTemplateColumns: '310px 1fr 310px', gap: 12, padding: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* ── LEFT: Acoustic & Speech ── */}
          <div className="ajna-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <Volume2 size={14} style={{ color: '#2dd4bf' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Acoustic & Speech</span>
              <button 
                onClick={micActive ? stopMic : startMic}
                className={micActive ? 'glass-pill-emerald' : 'glass-pill-amber'}
                style={{ fontSize: 9, padding: '2px 8px', marginLeft: 'auto', fontFamily: 'var(--font-mono)', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                title="Click to toggle live microphone feed"
              >
                {micActive ? <><Mic size={10} /><span>MIC ON</span></> : <><MicOff size={10} /><span>MIC OFF</span></>}
              </button>
            </div>

            {/* Waveform */}
            <div style={{ padding: '10px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="text-label">F0 PITCH & WAVEFORM</span>
                {micActive && <span className="font-mono-data" style={{ fontSize: 9, color: '#10b981' }}>● LIVE AUDIO</span>}
              </div>

              {/* Dynamic Waveform Bars */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 50, background: 'rgba(0,0,0,0.3)', padding: '4px 6px', borderRadius: 8 }}>
                {waveformBars.map((h, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      flex: 1, 
                      background: micActive 
                        ? (i % 6 === 0 ? '#38bdf8' : '#2dd4bf') 
                        : 'rgba(45,212,191,0.2)', 
                      borderRadius: 1, 
                      height: `${h}%`, 
                      transition: 'height 0.08s ease' 
                    }} 
                  />
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 8 }}>
                {[
                  ['F0', audioMetrics.f0],
                  ['Jitter', audioMetrics.jitter],
                  ['SNR', audioMetrics.snr]
                ].map(([k, v]) => (
                  <div key={k} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '5px 4px', borderRadius: 6 }}>
                    <div style={{ fontSize: 9, color: '#475569', fontFamily: 'var(--font-mono)' }}>{k}</div>
                    <div className="font-mono-data" style={{ fontSize: 11, color: '#2dd4bf', fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>

              {micError && (
                <div style={{ marginTop: 8, fontSize: 10, color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 6 }}>
                  {micError}
                </div>
              )}
            </div>

            {/* VAD & Prosody */}
            <div style={{ padding: '10px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-label" style={{ marginBottom: 8 }}>VOCAL ACTIVITY & CADENCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: micActive ? `${Math.min(100, Math.max(10, audioMetrics.volume * 2))}%` : '40%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg,#2dd4bf,#06b6d4)', 
                      borderRadius: 999,
                      transition: 'width 0.1s ease'
                    }} 
                  />
                </div>
                <span className="font-mono-data" style={{ fontSize: 11, color: '#2dd4bf', fontWeight: 700, flexShrink: 0 }}>
                  {audioMetrics.wpm}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
                {[
                  ['Shimmer', '0.12 dB'],
                  ['Loudness', micActive ? `${-36 + Math.round(audioMetrics.volume / 3)} dBFS` : '-24 dBFS'],
                  ['Cadence', micActive ? 'ENGAGED' : 'READY']
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '5px 6px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontSize: 8, color: '#475569', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{k}</div>
                    <div className="font-mono-data" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ASR Transcript */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '10px 14px', overflow: 'hidden' }}>
              <div className="text-label" style={{ marginBottom: 8, flexShrink: 0 }}>LIVE ASR STREAM</div>
              <div className="scroll-y" style={{ flex: 1, fontSize: 10, fontFamily: 'var(--font-mono)', lineHeight: 1.65 }}>
                {TRANSCRIPT_LINES.map((line, i) => (
                  <div key={i} style={{ marginBottom: 6, color: line.type === 'pause' ? '#f59e0b' : line.type === 'filler' ? '#f87171' : '#94a3b8', paddingLeft: 2 }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER: Perception HUD ── */}
          <div className="ajna-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <Eye size={14} style={{ color: '#8b5cf6' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Perception Stage (Webcam & Biometric Vision)</span>
              
              {/* 10 Engines Active Dots */}
              <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 4px rgba(16,185,129,0.6)', display: 'inline-block' }} />
                ))}
              </div>
            </div>

            {/* Secondary toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, flexWrap: 'wrap' }}>
              <button 
                onClick={toggleEvaluation}
                className={isRunning ? 'btn-danger' : 'btn-primary'}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12 }}
              >
                {isRunning ? <><Square size={12} /><span>Stop Evaluation</span></> : <><Play size={12} /><span>Start Evaluation</span></>}
              </button>

              {/* Direct Camera Toggle Button */}
              <button 
                onClick={cameraActive ? stopCamera : startCamera}
                className="btn-glass"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  padding: '7px 12px', 
                  fontSize: 11,
                  background: cameraActive ? 'rgba(45,212,191,0.18)' : 'rgba(255,255,255,0.04)',
                  borderColor: cameraActive ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.08)',
                  color: cameraActive ? '#2dd4bf' : '#94a3b8'
                }}
                title="Turn Webcam on or off"
              >
                {cameraActive ? <><Video size={13} /><span>Camera Active</span></> : <><VideoOff size={13} /><span>Preview Camera</span></>}
              </button>

              <div style={{ display: 'flex', gap: 4 }}>
                {['Interview', 'Proctoring', 'Comparison'].map(m => (
                  <button key={m} onClick={() => setActiveMode(m)}
                    style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s', WebkitAppRegion: 'no-drag', whiteSpace: 'nowrap',
                      background: activeMode === m ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
                      color: activeMode === m ? '#2dd4bf' : '#64748b',
                      boxShadow: activeMode === m ? '0 0 0 1px rgba(45,212,191,0.4)' : '0 0 0 1px rgba(255,255,255,0.08)',
                    }}>{m}</button>
                ))}
              </div>

              <div className="font-mono-data" style={{ fontSize: 11, padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: isRunning ? '#2dd4bf' : '#64748b', flexShrink: 0 }}>
                {formatElapsed(elapsedSec)}
              </div>

              <button className="btn-glass" style={{ padding: '5px 12px', fontSize: 11, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                <FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Generate Dossier
              </button>
            </div>

            {/* Camera Surface / Video Feed */}
            <div style={{ flex: 1, minHeight: 0, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ flex: 1, minHeight: 0, background: '#04070d', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* Real Live Video Element */}
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
                    transform: 'scaleX(-1)' // Mirror view for natural webcam feel
                  }} 
                />

                {/* Subtle Grid mesh overlay */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'linear-gradient(to right,#14b8a6 1px,transparent 1px),linear-gradient(to bottom,#14b8a6 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
                
                {/* Corner brackets */}
                {[['top:12px','left:12px','borderTop','borderLeft'],['top:12px','right:12px','borderTop','borderRight'],['bottom:12px','left:12px','borderBottom','borderLeft'],['bottom:12px','right:12px','borderBottom','borderRight']].map(([t, lr, ...borders], i) => (
                  <div key={i} style={{ position: 'absolute', [t.split(':')[0]]: t.split(':')[1], [lr.split(':')[0]]: lr.split(':')[1], width: 16, height: 16, pointerEvents: 'none', ...borders.reduce((a, b) => ({ ...a, [b]: '2px solid #2dd4bf' }), {}) }} />
                ))}

                {/* Live Biometric Overlays when Camera is Active */}
                {cameraActive && (
                  <>
                    <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10 }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', background: '#ef4444', padding: '3px 8px', borderRadius: 4, boxShadow: '0 0 10px rgba(239,68,68,0.5)' }}>● LIVE WEBCAM</span>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#2dd4bf', background: 'rgba(0,0,0,0.6)', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.3)' }}>30 FPS • 720p</span>
                    </div>

                    {/* Landmark tracking dots visual overlay */}
                    {[[50, 40], [47, 45], [53, 45], [45, 54], [55, 54], [50, 60], [43, 43], [57, 43]].map(([x, y], i) => (
                      <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 6px rgba(45,212,191,0.9)', pointerEvents: 'none' }} />
                    ))}

                    <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 10 }}>
                      {[['Yaw','2.1°'],['Pitch','-1.3°'],['Roll','0.8°']].map(([k, v]) => (
                        <span key={k} style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#5eead4', background: 'rgba(0,0,0,0.65)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.25)' }}>{k}: {v}</span>
                      ))}
                    </div>

                    <div style={{ position: 'absolute', bottom: 12, left: 14, zIndex: 10 }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#10b981', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(16,185,129,0.35)' }}>Face Conf: 99.4% • MediaPipe 468</span>
                    </div>
                  </>
                )}

                {/* Placeholder when Camera is Inactive */}
                {!cameraActive && (
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 5, padding: 20 }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={26} style={{ color: '#64748b' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>Webcam Feed Standby</div>
                      <div style={{ fontSize: 11, color: '#64748b', maxWidth: 280 }}>
                        {cameraError ? cameraError : 'Click "Start Evaluation" or "Preview Camera" to start real-time video telemetry'}
                      </div>
                    </div>
                    <button 
                      onClick={startCamera}
                      className="btn-glass"
                      style={{ fontSize: 11, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6, color: '#2dd4bf', borderColor: 'rgba(45,212,191,0.3)' }}
                    >
                      <RefreshCw size={12} /><span>Enable Camera Feed</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Timeline scrubber */}
              <div style={{ flexShrink: 0, height: 36, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="text-label" style={{ fontSize: 8 }}>TEMPORAL FUSION SCRUBBER</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="font-mono-data" style={{ fontSize: 9, color: '#475569', flexShrink: 0 }}>00:00</span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: isRunning ? `${Math.min(100, (elapsedSec / 1800) * 100)}%` : '40%', height: '100%', background: 'linear-gradient(90deg,#2dd4bf,#8b5cf6)', borderRadius: 999 }} />
                    <div style={{ position: 'absolute', left: isRunning ? `${Math.min(100, (elapsedSec / 1800) * 100)}%` : '40%', top: '50%', transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 6px rgba(45,212,191,0.6)', border: '2px solid #2dd4bf' }} />
                  </div>
                  <span className="font-mono-data" style={{ fontSize: 9, color: '#475569', flexShrink: 0 }}>30:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Fusion & Evidence ── */}
          <div className="ajna-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <Activity size={14} style={{ color: '#f97316' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Fusion & Evidence</span>
            </div>

            {/* Behavioral State */}
            <div style={{ padding: '10px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-label" style={{ marginBottom: 8 }}>BEHAVIORAL STATE ESTIMATE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STATES.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#64748b', width: 72, flexShrink: 0 }}>{s.label}</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                    <span className="font-mono-data" style={{ fontSize: 10, color: s.color, width: 30, textAlign: 'right', flexShrink: 0 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fusion Weights */}
            <div style={{ padding: '10px 14px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-label" style={{ marginBottom: 8 }}>MSCMLP FUSION WEIGHTS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {FUSION_WEIGHTS.map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#64748b', width: 54, flexShrink: 0 }}>{f.label}</span>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${f.pct}%`, height: '100%', background: f.color, borderRadius: 999 }} />
                    </div>
                    <span className="font-mono-data" style={{ fontSize: 10, color: f.color, width: 30, textAlign: 'right', flexShrink: 0 }}>{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Ledger */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '8px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-label">EVIDENCE AUDIT LEDGER</span>
                <span className="glass-pill-teal" style={{ fontSize: 9, padding: '2px 7px', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{EVIDENCE.length}</span>
              </div>
              <div className="scroll-y" style={{ flex: 1, padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EVIDENCE.map((ev, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="font-mono-data" style={{ fontSize: 9, color: '#475569' }}>{ev.ts}</span>
                      <span style={{ fontSize: 9, color: '#5eead4', background: 'rgba(45,212,191,0.1)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.25)', fontFamily: 'var(--font-mono)' }}>{ev.type}</span>
                      <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: ev.sev, flexShrink: 0 }} />
                    </div>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{ev.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RUBRIC & NOTES TAB ── */}
      {activeTab === 'Rubric & Notes' && (
        <div style={{ flex: 1, minHeight: 0, padding: 16, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="ajna-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Evaluation Rubric</div>
            <div className="scroll-y" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {RUBRIC_CRITERIA.map(criterion => (
                <div key={criterion} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', marginBottom: 10 }}>{criterion}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(criterion, star)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s', WebkitAppRegion: 'no-drag',
                          background: (ratings[criterion] || 0) >= star ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.05)',
                          color: (ratings[criterion] || 0) >= star ? '#2dd4bf' : '#475569',
                          boxShadow: (ratings[criterion] || 0) >= star ? '0 0 0 1px rgba(45,212,191,0.4)' : '0 0 0 1px rgba(255,255,255,0.08)',
                        }}>{star}</button>
                    ))}
                    <span className="font-mono-data" style={{ fontSize: 11, color: '#64748b', alignSelf: 'center', marginLeft: 6 }}>{ratings[criterion] ? `${ratings[criterion]}/5` : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="ajna-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Evaluator Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter structured notes, observations, and key insights about the candidate's performance..."
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#f1f5f9', fontSize: 13, padding: 14, resize: 'none', outline: 'none', fontFamily: 'var(--font-sans)', lineHeight: 1.6 }} />
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: 13 }}>
              <Download size={14} /><span>Export Notes & Rubric</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SESSION DOSSIERS TAB ── */}
      {activeTab === 'Session Dossiers' && (
        <div style={{ flex: 1, minHeight: 0, padding: 16, overflow: 'hidden' }}>
          <div className="ajna-glass" style={{ height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Past Session Dossiers</div>
            <div className="scroll-y" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PAST_SESSIONS.map(s => (
                <div key={s.id} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{s.candidate}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#475569' }}>
                      <span>{s.id}</span><span>{s.date}</span><span>{s.duration}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.score >= 85 ? '#10b981' : s.score >= 70 ? '#f59e0b' : '#ef4444' }}>{s.score}</span>
                    <span style={{ fontSize: 10, color: '#475569' }}>/100</span>
                    <button className="btn-glass" style={{ padding: '6px 14px', fontSize: 11, whiteSpace: 'nowrap' }}>View Dossier</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
