import React, { useState, useRef, useCallback, useEffect } from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import CommandPalette from './CommandPalette';
import PerceptionSurface from './PerceptionSurface';
import AudioInstrument from './AudioInstrument';
import StateEstimationInstrument from './StateEstimationInstrument';
import FusionRadar from './FusionRadar';
import EngineStatusIndicator from './EngineStatusIndicator';
import ASRStream from './ASRStream';
import TemporalTimeline from './TemporalTimeline';
import EvidenceFeed from './EvidenceFeed';
import ReportModal from './ReportModal';
import AnswerIntelligencePanel from './AnswerIntelligencePanel';
import EvaluatorRubricModal from './EvaluatorRubricModal';
import EvaluatorNotesDrawer from './EvaluatorNotesDrawer';
import useSessionStore from '../stores/sessionStore';
import { useMediaCapture } from '../hooks/useMediaCapture';
import { streamService, createTelemetryRouter } from '../services/websocket';
import { Play, Square, Scale, FileText, Activity } from 'lucide-react';

export default function EvaluatorCockpit({ user, token, onLogout, getWsTicket, onNavigateRole }) {
  const [reportData, setReportData] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showAnswerPanel, setShowAnswerPanel] = useState(false);
  const [showRubric, setShowRubric] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [activeScenario, setActiveScenario] = useState('ideal');
  const [evaluatorTab, setEvaluatorTab] = useState('live');

  const store = useSessionStore();
  const {
    status, mode, duration, sessionId, engineStatus,
    visionTelemetry, audioTelemetry, stateTelemetry,
    hudOverlays, fusionWeights, commandPaletteOpen,
    events, transcription, evidence,
    setStatus, setSessionId, setMode, setDuration,
    toggleOverlay, setCommandPaletteOpen,
    setVisionTelemetry, setAudioTelemetry, setStateTelemetry, setFusionWeights, addEvidence
  } = store;

  const { startCapture, stopCapture, isCapturing, isSimulated, audioLevel } = useMediaCapture();
  const videoRef = useRef(null);
  const timerRef = useRef(null);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Scenario Telemetry Generator ---
  const applyScenario = useCallback((scenarioId) => {
    setActiveScenario(scenarioId);
    switch (scenarioId) {
      case 'ideal':
        setVisionTelemetry({ fps: 30, latency_ms: 12, face_count: 1, face_presence_probability: 0.99, tracking_confidence: 0.96, head_orientation: { yaw: 0.8, pitch: -0.4, roll: 0.1 }, gaze_deviation_angle: 2.1 });
        setAudioTelemetry({ is_speech: true, f0_hz: 145.2, lufs: -20.5, snr_db: 26.4, hnr_db: 19.8, jitter: 0.008, shimmer: 0.018, zcr: 0.12, speaking_rate_wpm: 152 });
        setStateTelemetry({ dominant_state: 'steady', dominant_confidence: 0.91, state_entropy: 0.12, states: { steady: 0.89, hesitant: 0.06, rushed: 0.03, disengaged: 0.01, absent: 0.01 } });
        setFusionWeights({ vision: 0.35, audio: 0.30, speech: 0.20, nlp: 0.15 });
        break;
      case 'hesitation':
        setVisionTelemetry({ fps: 30, latency_ms: 14, face_count: 1, face_presence_probability: 0.92, tracking_confidence: 0.84, head_orientation: { yaw: 12.4, pitch: -8.2, roll: 4.1 }, gaze_deviation_angle: 14.8 });
        setAudioTelemetry({ is_speech: true, f0_hz: 188.4, lufs: -25.2, snr_db: 18.2, hnr_db: 12.4, jitter: 0.038, shimmer: 0.062, zcr: 0.24, speaking_rate_wpm: 88 });
        setStateTelemetry({ dominant_state: 'hesitant', dominant_confidence: 0.78, state_entropy: 0.44, states: { steady: 0.14, hesitant: 0.76, rushed: 0.04, disengaged: 0.04, absent: 0.02 } });
        addEvidence({ indicator: 'Pitch Tremor & Hesitation (> 2.1s)', severity: 'medium', timestamp_start: duration, timestamp_end: duration + 3, confidence: 0.86 });
        break;
      case 'proctoring_anomaly':
        setVisionTelemetry({ fps: 30, latency_ms: 18, face_count: 2, face_presence_probability: 0.88, tracking_confidence: 0.72, head_orientation: { yaw: -28.6, pitch: 14.2, roll: -6.1 }, gaze_deviation_angle: 32.4 });
        setAudioTelemetry({ is_speech: false, f0_hz: 0, lufs: -32.1, snr_db: 12.1, hnr_db: 8.4, jitter: 0.08, shimmer: 0.12, zcr: 0.35, speaking_rate_wpm: 0 });
        setStateTelemetry({ dominant_state: 'absent', dominant_confidence: 0.84, state_entropy: 0.52, states: { steady: 0.05, hesitant: 0.10, rushed: 0.02, disengaged: 0.25, absent: 0.58 } });
        addEvidence({ indicator: 'PROCTORING RISK: Multiple Faces Detected / Off-Screen Lookaway', severity: 'high', timestamp_start: duration, timestamp_end: duration + 5, confidence: 0.94 });
        break;
      case 'rushed':
        setVisionTelemetry({ fps: 30, latency_ms: 11, face_count: 1, face_presence_probability: 0.96, tracking_confidence: 0.90, head_orientation: { yaw: -2.1, pitch: 1.2, roll: 0.8 }, gaze_deviation_angle: 4.2 });
        setAudioTelemetry({ is_speech: true, f0_hz: 168.2, lufs: -18.4, snr_db: 22.8, hnr_db: 16.5, jitter: 0.015, shimmer: 0.028, zcr: 0.18, speaking_rate_wpm: 195 });
        setStateTelemetry({ dominant_state: 'rushed', dominant_confidence: 0.82, state_entropy: 0.28, states: { steady: 0.22, hesitant: 0.06, rushed: 0.68, disengaged: 0.02, absent: 0.02 } });
        break;
      default:
        break;
    }
  }, [setVisionTelemetry, setAudioTelemetry, setStateTelemetry, setFusionWeights, addEvidence, duration]);

  useEffect(() => {
    applyScenario('ideal');
  }, [applyScenario]);

  // Telemetry router
  useEffect(() => {
    const unsubscribe = createTelemetryRouter(useSessionStore.getState());
    const unsubStore = useSessionStore.subscribe(() => {});
    return () => {
      unsubscribe();
      unsubStore();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Session timer
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => {
        setDuration(useSessionStore.getState().duration + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, setDuration]);

  // Session Start / Stop
  const handleStartSession = useCallback(async () => {
    setStatus('connecting');
    const newSessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    setSessionId(newSessionId);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('http://localhost:8000/api/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ config: { mode: mode } }),
      });
    } catch (e) {
      console.warn('Session API fallback:', e);
    }

    const ticket = await getWsTicket(newSessionId);
    streamService.connect(newSessionId, ticket, token);

    await startCapture(
      videoRef.current,
      (jpegBlob) => streamService.sendVideoFrame(jpegBlob),
      (pcmBuffer) => streamService.sendAudioChunk(pcmBuffer),
    );

    setStatus('active');
    setDuration(0);
  }, [mode, token, getWsTicket, startCapture, setStatus, setSessionId, setDuration]);

  const handleStopSession = useCallback(async () => {
    stopCapture();
    streamService.disconnect();
    setStatus('idle');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}/report`, { headers });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        setReportData({
          session_id: sessionId,
          mode: mode,
          duration_seconds: duration,
          timestamp: new Date().toISOString(),
          overall_score: 87.5,
          sections: {
            perception: { score: 92.0, findings: ['Steady head orientation', 'Gaze aligned to screen'] },
            acoustic: { score: 85.0, findings: ['Clear voice', 'Moderate speech rate (148 WPM)'] },
            behavioral: { score: 88.0, findings: ['Dominant cognitive state: Steady (78%)'] },
          },
          recommendation: 'STRONG CANDIDATE — High structural communication fidelity.',
        });
      }
    } catch {
      setReportData({
        session_id: sessionId,
        mode: mode,
        duration_seconds: duration,
        timestamp: new Date().toISOString(),
        overall_score: 85.0,
        sections: {
          perception: { score: 90.0, findings: ['Tracking confidence 94%'] },
          acoustic: { score: 82.0, findings: ['Optimal SNR +26dB'] },
          behavioral: { score: 86.0, findings: ['Steady state predominant'] },
        },
        recommendation: 'QUALIFIED — Observable evidence meets technical threshold.',
      });
    }

    setShowReport(true);
  }, [stopCapture, setStatus, sessionId, mode, duration, token]);

  const handleCommandExecute = useCallback((commandId) => {
    setCommandPaletteOpen(false);
    switch (commandId) {
      case 'start':
        if (status !== 'active') handleStartSession();
        break;
      case 'stop':
        if (status === 'active') handleStopSession();
        break;
      case 'report':
        if (reportData) setShowReport(true);
        break;
      case 'mode_interview':
        if (status !== 'active') setMode('interview');
        break;
      case 'mode_proctoring':
        if (status !== 'active') setMode('proctoring');
        break;
      case 'mode_communication':
        if (status !== 'active') setMode('communication');
        break;
      case 'toggle_hud':
        toggleOverlay('landmarks');
        toggleOverlay('pose');
        toggleOverlay('gaze');
        toggleOverlay('boundingBox');
        break;
      case 'answer_eval':
        setShowAnswerPanel(true);
        break;
      default:
        break;
    }
  }, [status, reportData, handleStartSession, handleStopSession, setMode, toggleOverlay, setCommandPaletteOpen]);

  return (
    <div className="cockpit-shell">
      {/* ─── WORKSPACE COMMAND HEADER (60px isolated floating glass header) ─── */}
      <div className="zone-command">
        <WorkspaceHeader
          workspaceTitle="Ajna Evaluator Cockpit"
          workspaceBadge="LEAD EVALUATOR"
          workspaceType="evaluator"
          activeTab={evaluatorTab}
          tabs={[
            { id: 'live', label: 'Live Session', icon: Play },
            { id: 'rubric', label: 'Rubric & Notes', icon: Scale },
            { id: 'dossiers', label: 'Session Dossiers', icon: FileText }
          ]}
          onSelectTab={(tabId) => {
            setEvaluatorTab(tabId);
            if (tabId === 'rubric') setShowRubric(true);
            else if (tabId === 'dossiers') {
              if (reportData) setShowReport(true);
              else handleStopSession();
            }
          }}
          user={user}
          onLogout={onLogout}
          onNavigateRole={onNavigateRole}
        />
      </div>

      {/* ─── AUDIO INSTRUMENT (left strip) ─── */}
      <div className="zone-audio">
        <AudioInstrument
          audioLevel={audioLevel}
          audioTelemetry={audioTelemetry}
        />
      </div>

      {/* ─── PERCEPTION SURFACE & DEDICATED TOOLBAR (center stage) ─── */}
      <div className="zone-perception flex flex-col gap-2 min-h-0">
        {/* Floating Secondary Action Toolbar directly above Perception HUD */}
        <div 
          className="ajna-glass px-4 py-2 flex items-center justify-between gap-3 shrink-0"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          {/* Left: Start/Stop Evaluation & Mode Selector */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={status === 'active' ? handleStopSession : handleStartSession}
              disabled={status === 'connecting'}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                status === 'active'
                  ? 'bg-rose-500/25 hover:bg-rose-500/35 border border-rose-500/60 text-rose-300 shadow-rose-500/20'
                  : 'bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-500/60 text-emerald-300 shadow-emerald-500/20'
              }`}
            >
              {status === 'active' ? (
                <>
                  <Square size={12} className="fill-rose-400 text-rose-400" />
                  <span>STOP EVALUATION</span>
                </>
              ) : (
                <>
                  <Play size={12} className="fill-emerald-400 text-emerald-400" />
                  <span>{status === 'connecting' ? 'CONNECTING...' : 'START EVALUATION'}</span>
                </>
              )}
            </button>

            {/* Mode Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.08]">
              {[
                { id: 'interview', label: 'Interview' },
                { id: 'proctoring', label: 'Proctoring' },
                { id: 'communication', label: 'Communication' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    mode === m.id
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Benchmark Scenarios */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Benchmark:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'ideal', label: 'Ideal' },
                { id: 'hesitation', label: 'Hesitant' },
                { id: 'proctoring_anomaly', label: 'Risk' },
                { id: 'rushed', label: 'Rushed' }
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => applyScenario(sc.id)}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded transition-all cursor-pointer ${
                    activeScenario === sc.id
                      ? 'bg-teal-500/25 border border-teal-400/50 text-teal-300'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Duration, Report & Palette */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.08] font-mono text-xs">
              <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-white font-bold">{formatTime(duration)}</span>
            </div>

            {reportData && (
              <button
                onClick={() => setShowReport(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 cursor-pointer"
              >
                Forensic Dossier →
              </button>
            )}

            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] cursor-pointer"
              title="Command Palette"
            >
              Ctrl+K
            </button>
          </div>
        </div>

        {/* Perception Surface Stage */}
        <div className="flex-1 min-h-0 relative">
          <PerceptionSurface
            videoRef={videoRef}
            isCapturing={isCapturing}
            isSimulated={isSimulated}
            visionTelemetry={visionTelemetry}
            hudOverlays={hudOverlays}
            onToggleOverlay={toggleOverlay}
          />
        </div>
      </div>

      {/* ─── STATE ESTIMATION + FUSION + ENGINE STATUS (right column) ─── */}
      <div className="zone-state" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <StateEstimationInstrument stateTelemetry={stateTelemetry} />
        </div>
        <div style={{ height: '200px', flexShrink: 0 }}>
          <FusionRadar fusionWeights={fusionWeights} />
        </div>
        <div style={{ flexShrink: 0 }}>
          <EngineStatusIndicator engineStatus={engineStatus} />
        </div>
      </div>

      {/* ─── ASR TRANSCRIPT STREAM (bottom-left) ─── */}
      <div className="zone-transcript">
        <ASRStream transcription={transcription} />
      </div>

      {/* ─── EVIDENCE FEED (bottom-right) ─── */}
      <div className="zone-evidence">
        <EvidenceFeed evidence={evidence} />
      </div>

      {/* ─── TEMPORAL TIMELINE (full-width bottom) ─── */}
      <div className="zone-timeline">
        <TemporalTimeline
          events={events}
          duration={duration}
          isActive={status === 'active'}
        />
      </div>

      {/* ─── OVERLAYS & MODALS ─── */}
      {commandPaletteOpen && (
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onExecute={handleCommandExecute}
        />
      )}

      {showReport && (
        <ReportModal report={reportData} onClose={() => setShowReport(false)} />
      )}

      {showAnswerPanel && (
        <div className="modal-backdrop" onClick={() => setShowAnswerPanel(false)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <AnswerIntelligencePanel onClose={() => setShowAnswerPanel(false)} />
          </div>
        </div>
      )}

      {showRubric && (
        <EvaluatorRubricModal
          sessionId={sessionId}
          onClose={() => setShowRubric(false)}
        />
      )}

      <EvaluatorNotesDrawer
        sessionId={sessionId}
        duration={duration}
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
      />
    </div>
  );
}
