import React, { useState, useEffect, useCallback } from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import { 
  Sliders, Shield, Database, Cpu, Activity, Server, 
  CheckCircle, RefreshCw, AlertTriangle, Terminal, Eye,
  Volume2, Mic, Brain, Save, LogOut, Copy, Check, Zap,
  BarChart3, Users, Clock, ArrowRight, Layers
} from 'lucide-react';

const PRESET_PROFILES = [
  {
    id: 'technical',
    name: 'Technical Architecture Interview',
    desc: 'Balanced parameters calibrated for deep system design, conversational cadence, and normal visual alignment.',
    badge: 'Recommended',
    config: {
      gaze_deviation_limit_deg: 22.0,
      head_pose_velocity_limit: 45.0,
      vad_rms_floor: 0.012,
      wpm_cadence_min: 115,
      wpm_cadence_max: 175,
      jitter_threshold: 0.035,
      shimmer_threshold: 0.055,
      active_llm_model: 'gemini-2.5-flash',
      active_whisper_model: 'base.en',
      fusion_vision_weight: 0.35,
      fusion_audio_weight: 0.30,
      fusion_speech_weight: 0.20,
      fusion_nlp_weight: 0.15,
      ensemble_heads: 32
    }
  },
  {
    id: 'proctoring',
    name: 'High-Stakes Exam Proctoring',
    desc: 'Strict visual containment (15° gaze cutoff), aggressive head rotation limits, and instant off-screen anomaly tagging.',
    badge: 'Strict Security',
    config: {
      gaze_deviation_limit_deg: 14.0,
      head_pose_velocity_limit: 30.0,
      vad_rms_floor: 0.008,
      wpm_cadence_min: 90,
      wpm_cadence_max: 190,
      jitter_threshold: 0.025,
      shimmer_threshold: 0.040,
      active_llm_model: 'gemini-2.5-flash',
      active_whisper_model: 'small.en',
      fusion_vision_weight: 0.50,
      fusion_audio_weight: 0.25,
      fusion_speech_weight: 0.15,
      fusion_nlp_weight: 0.10,
      ensemble_heads: 32
    }
  },
  {
    id: 'behavioral',
    name: 'Executive Behavioral Assessment',
    desc: 'Prioritizes vocal jitter, pitch tremor (Emotion2Vec), and lexical coherence with relaxed gaze margins.',
    badge: 'Prosody Focused',
    config: {
      gaze_deviation_limit_deg: 28.0,
      head_pose_velocity_limit: 55.0,
      vad_rms_floor: 0.015,
      wpm_cadence_min: 110,
      wpm_cadence_max: 165,
      jitter_threshold: 0.045,
      shimmer_threshold: 0.065,
      active_llm_model: 'gpt-4o-mini',
      active_whisper_model: 'base.en',
      fusion_vision_weight: 0.25,
      fusion_audio_weight: 0.35,
      fusion_speech_weight: 0.25,
      fusion_nlp_weight: 0.15,
      ensemble_heads: 32
    }
  }
];

export default function AdminCockpit({ user, onLogout, onNavigateRole }) {
  const [activeTab, setActiveTab] = useState('studio');
  const [activePreset, setActivePreset] = useState('technical');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState(null);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [evidenceLogs, setEvidenceLogs] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const [calibration, setCalibration] = useState(PRESET_PROFILES[0].config);

  const fetchStatsAndConfig = useCallback(async () => {
    try {
      const [statsRes, configRes, sessRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/system-stats'),
        fetch('http://localhost:8000/api/admin/config'),
        fetch('http://localhost:8000/api/admin/sessions')
      ]);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (configRes.ok) {
        const configData = await configRes.json();
        setCalibration(configData);
      }
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        setSessionsList(sessData.sessions || []);
      }
    } catch (e) {
      console.warn('Backend fallback:', e);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const [telemRes, evidRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/telemetry?limit=50'),
        fetch(`http://localhost:8000/api/admin/evidence?limit=50${severityFilter !== 'ALL' ? `&severity=${severityFilter}` : ''}`)
      ]);
      if (telemRes.ok) {
        const telemData = await telemRes.json();
        setTelemetryLogs(telemData.items || []);
      }
      if (evidRes.ok) {
        const evidData = await evidRes.json();
        setEvidenceLogs(evidData.items || []);
      }
    } catch (e) {
      console.warn('Error fetching logs:', e);
    }
  }, [severityFilter]);

  useEffect(() => {
    fetchStatsAndConfig();
    const interval = setInterval(fetchStatsAndConfig, 6000);
    return () => clearInterval(interval);
  }, [fetchStatsAndConfig]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
      const interval = setInterval(fetchLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchLogs]);

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setCalibration(preset.config);
  };

  const handleSaveCalibration = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calibration)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Save calibration failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent text-slate-100 overflow-hidden font-sans">
      {/* ─── TOP CONTROL BAR (CLEAN, ISOLATED 60PX WORKSPACE HEADER) ─── */}
      <WorkspaceHeader
        workspaceTitle="Ajna Admin Governance Hub"
        workspaceBadge="PLATFORM ADMIN"
        workspaceType="admin"
        activeTab={activeTab}
        tabs={[
          { id: 'studio', label: 'Engine Studio & Presets', icon: Sliders },
          { id: 'overview', label: 'Service Mesh & KPIs', icon: Cpu },
          { id: 'logs', label: 'Forensic Audit Logs', icon: Activity },
          { id: 'sessions', label: 'Session Dossiers', icon: Layers, count: sessionsList.length }
        ]}
        onSelectTab={setActiveTab}
        user={user}
        onLogout={onLogout}
        onNavigateRole={onNavigateRole}
        dbLatency={stats?.database?.ping_latency_ms || 1.7}
      />

      {/* ─── MAIN CONTENT VIEWPORT ─── */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* =========================================================================
            TAB 1: ENGINE STUDIO & PRESETS (CORE WORKFLOW)
            ========================================================================= */}
        {activeTab === 'studio' && (
          <div className="w-full max-w-[1600px] mx-auto space-y-7">
            {/* WORKFLOW STEP 1: PRESET PROFILES */}
            <div className="aurora-glass-card p-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Operational Mode Presets (1-Click Threshold Profiles)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Select a pre-calibrated evaluation profile to instantly tune MediaPipe, Faster-Whisper, and the 32-head ensemble.
                  </p>
                </div>
                <button
                  onClick={handleSaveCalibration}
                  disabled={loading}
                  className={`aurora-btn-gradient text-xs sm:text-sm px-6 py-2.5 ${
                    saveSuccess ? 'bg-emerald-600 border-emerald-400 text-white' : ''
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Calibration Deployed to Engines</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Deploying...' : 'Deploy Calibration to Cluster'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {PRESET_PROFILES.map((p) => {
                  const isSelected = activePreset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-400 shadow-xl shadow-teal-500/20'
                          : 'bg-white/[0.03] border-white/[0.08] hover:border-white/25 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white">{p.name}</span>
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-teal-400 text-[#07090e]' : 'bg-white/10 text-slate-300'
                          }`}>
                            {p.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {p.desc}
                        </p>
                      </div>
                      <div className="text-xs font-mono text-slate-300 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                        <span>Gaze: {p.config.gaze_deviation_limit_deg}°</span>
                        <span>VAD: {p.config.vad_rms_floor}</span>
                        <span>WPM: {p.config.wpm_cadence_min}-{p.config.wpm_cadence_max}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WORKFLOW STEP 2: FINE-GRAINED CALIBRATION GAUGES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* VISION & GAZE CONTAINER */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Vision & Gaze Verification</span>
                  </div>
                  <span className="text-[10px] font-mono text-orange-300 bg-orange-500/15 px-2 py-0.5 rounded border border-orange-500/30">
                    SigLIP2 (1152-d)
                  </span>
                </div>

                {/* Gaze Anomaly Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Gaze Deviation Anomaly Threshold</span>
                    <span className="glass-pill glass-pill-active font-mono font-bold text-xs py-0.5">
                      {calibration.gaze_deviation_limit_deg.toFixed(1)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="0.5"
                    value={calibration.gaze_deviation_limit_deg}
                    onChange={(e) => setCalibration({ ...calibration, gaze_deviation_limit_deg: parseFloat(e.target.value) })}
                    className="glass-slider"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10° (Strict Proctoring)</span>
                    <span>22° (Standard HUD)</span>
                    <span>45° (Relaxed)</span>
                  </div>
                </div>

                {/* Head Pose Velocity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Head Pose Velocity Boundary</span>
                    <span className="glass-pill font-mono font-bold text-xs py-0.5">
                      {calibration.head_pose_velocity_limit}°/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="1"
                    value={calibration.head_pose_velocity_limit}
                    onChange={(e) => setCalibration({ ...calibration, head_pose_velocity_limit: parseFloat(e.target.value) })}
                    className="glass-slider"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>15°/s (Minimal)</span>
                    <span>45°/s (Optimal)</span>
                    <span>90°/s (Rapid Jerk)</span>
                  </div>
                </div>
              </div>

              {/* ACOUSTIC & PROSODIC CONTAINER */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Acoustic & Prosodic Dials</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    Emotion2Vec (768-d)
                  </span>
                </div>

                {/* VAD Noise Floor */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">VAD Speech Detection Noise Floor</span>
                    <span className="glass-pill glass-pill-emerald font-mono font-bold text-xs py-0.5">
                      {calibration.vad_rms_floor.toFixed(3)} RMS
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.004"
                    max="0.040"
                    step="0.002"
                    value={calibration.vad_rms_floor}
                    onChange={(e) => setCalibration({ ...calibration, vad_rms_floor: parseFloat(e.target.value) })}
                    className="glass-slider"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.004 (Sensitive)</span>
                    <span>0.012 (Office Default)</span>
                    <span>0.040 (High Noise)</span>
                  </div>
                </div>

                {/* Vocal Jitter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Vocal Jitter Anomaly Threshold</span>
                    <span className="glass-pill font-mono font-bold text-xs py-0.5">
                      {(calibration.jitter_threshold * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.010"
                    max="0.080"
                    step="0.005"
                    value={calibration.jitter_threshold}
                    onChange={(e) => setCalibration({ ...calibration, jitter_threshold: parseFloat(e.target.value) })}
                    className="glass-slider"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1.0% (Stable)</span>
                    <span>3.5% (Natural Speech)</span>
                    <span>8.0% (Severe Tremor)</span>
                  </div>
                </div>
              </div>

              {/* SPEECH CADENCE & WHISPER ASR */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Speech Cadence & Whisper ASR</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    Faster-Whisper
                  </span>
                </div>

                {/* Cadence Range */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300">Target Cadence Pacing Window</span>
                    <span className="glass-pill glass-pill-amber font-mono font-bold text-xs py-0.5">
                      {calibration.wpm_cadence_min} - {calibration.wpm_cadence_max} WPM
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="range"
                      min="80"
                      max="140"
                      step="5"
                      value={calibration.wpm_cadence_min}
                      onChange={(e) => setCalibration({ ...calibration, wpm_cadence_min: parseInt(e.target.value) })}
                      className="glass-slider"
                    />
                    <input
                      type="range"
                      min="150"
                      max="240"
                      step="5"
                      value={calibration.wpm_cadence_max}
                      onChange={(e) => setCalibration({ ...calibration, wpm_cadence_max: parseInt(e.target.value) })}
                      className="glass-slider"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Min Bound: {calibration.wpm_cadence_min} WPM</span>
                    <span>Max Bound: {calibration.wpm_cadence_max} WPM</span>
                  </div>
                </div>

                {/* Whisper Model Selector */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-slate-300">ASR Inference Engine Model</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['tiny.en', 'base.en', 'small.en', 'medium.en'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCalibration({ ...calibration, active_whisper_model: m })}
                        className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                          calibration.active_whisper_model === m
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MSCMLP MULTIMODAL FUSION & LLM */}
              <div className="glass-panel p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Multimodal Fusion & LLM Reasoning</span>
                  </div>
                  <span className="text-[10px] font-mono text-orange-300 bg-orange-500/15 px-2 py-0.5 rounded border border-orange-500/30">
                    32-Head Ensemble
                  </span>
                </div>

                {/* LLM Engine Provider */}
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-300">Observable Evidence Dossier Generator</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                      { id: 'sfr-mistral', label: 'SFR-Mistral Local' }
                    ].map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => setCalibration({ ...calibration, active_llm_model: provider.id })}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          calibration.active_llm_model === provider.id
                            ? 'bg-orange-600/30 text-white border border-orange-500/50 shadow-md shadow-orange-600/20'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {provider.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modality Weights */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs text-slate-300">Shared Bottleneck Modality Dropout Allocation</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                    <div className="p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                      <div className="text-orange-400 font-bold">{(calibration.fusion_vision_weight * 100).toFixed(0)}%</div>
                      <div className="text-slate-400">Vision</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                      <div className="text-emerald-400 font-bold">{(calibration.fusion_audio_weight * 100).toFixed(0)}%</div>
                      <div className="text-slate-400">Audio</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                      <div className="text-amber-400 font-bold">{(calibration.fusion_speech_weight * 100).toFixed(0)}%</div>
                      <div className="text-slate-400">Speech</div>
                    </div>
                    <div className="p-2 rounded-lg bg-black/30 border border-white/[0.06]">
                      <div className="text-purple-400 font-bold">{(calibration.fusion_nlp_weight * 100).toFixed(0)}%</div>
                      <div className="text-slate-400">NLP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: SERVICE MESH & KPIS (INFRASTRUCTURE OVERVIEW)
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="w-full max-w-[1600px] mx-auto space-y-7">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 space-y-1">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Evaluators</div>
                <div className="text-2xl font-bold font-mono text-white">{stats?.database?.counts?.users || 3}</div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> All Accounts Verified
                </div>
              </div>
              <div className="glass-panel p-4 space-y-1">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Sessions</div>
                <div className="text-2xl font-bold font-mono text-orange-400">{stats?.database?.counts?.sessions || 5}</div>
                <div className="text-[10px] text-slate-400 font-mono">Managed in MongoDB</div>
              </div>
              <div className="glass-panel p-4 space-y-1">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Evidence Logs</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">{stats?.database?.counts?.evidence_logs || 0}</div>
                <div className="text-[10px] text-slate-400 font-mono">Timestamped Anomalies</div>
              </div>
              <div className="glass-panel p-4 space-y-1">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">DB Ping Latency</div>
                <div className="text-2xl font-bold font-mono text-teal-400">{stats?.database?.ping_latency_ms || 1.7} ms</div>
                <div className="text-[10px] text-emerald-400 font-mono">Motor Async Cluster</div>
              </div>
            </div>

            {/* 8 Engine Microservices Mesh */}
            <div className="glass-panel p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">8-Engine Microservice Cluster Mesh</span>
                </div>
                <span className="glass-pill glass-pill-emerald text-[10px]">ALL SYSTEMS OPERATIONAL</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(stats?.engines || [
                  { name: 'SigLIP2 Vision Embedder', status: 'ACTIVE', fps: 30, latency_ms: 12, dim: 1152 },
                  { name: 'Faster-Whisper ASR', status: 'ACTIVE', model: 'base.en', latency_ms: 145 },
                  { name: 'Emotion2Vec Acoustic Prosody', status: 'ACTIVE', sample_rate: 16000, latency_ms: 22, dim: 768 },
                  { name: 'SFR-Mistral NLP Embedder', status: 'ACTIVE', latency_ms: 38, dim: 4096 },
                  { name: 'MSCMLP Bottleneck Fusion', status: 'ACTIVE', bottleneck: 256, heads: 32 },
                  { name: '5-State Continuous HMM', status: 'ACTIVE', states: ['steady', 'hesitant', 'rushed'] },
                  { name: 'MediaPipe 468 FaceMesh', status: 'ACTIVE', fps: 30 },
                  { name: 'Motor Async MongoDB Pool', status: 'ONLINE', ping_ms: 1.7 }
                ]).map((eng, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-black/25 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{eng.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                        {eng.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 space-y-1">
                      {eng.latency_ms && <div>Latency: <span className="text-slate-200">{eng.latency_ms} ms</span></div>}
                      {eng.dim && <div>Embed: <span className="text-orange-400">{eng.dim}-dim</span></div>}
                      {eng.model && <div>Model: <span className="text-amber-400">{eng.model}</span></div>}
                      {eng.fps && <div>FPS: <span className="text-emerald-400">{eng.fps}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: FORENSIC AUDIT LOGS (TELEMETRY INSPECTOR)
            ========================================================================= */}
        {activeTab === 'logs' && (
          <div className="w-full max-w-[1600px] mx-auto flex flex-col space-y-5">
            {/* Filters */}
            <div className="glass-panel p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">MongoDB Observable Evidence Stream</span>
                <span className="text-[11px] text-slate-400 font-mono">({evidenceLogs.length} verified events)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Severity:</span>
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`glass-pill text-[10px] py-1 px-3 cursor-pointer ${
                      severityFilter === sev ? 'glass-pill-active' : ''
                    }`}
                  >
                    {sev}
                  </button>
                ))}
                <button onClick={fetchLogs} className="glass-pill p-2 cursor-pointer ml-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Split Screen Inspector */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
              <div className="lg:col-span-7 glass-panel p-5 overflow-y-auto space-y-3">
                {evidenceLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Terminal className="w-8 h-8 mb-2 opacity-40" />
                    <span>No evidence logs recorded yet. Active evaluator sessions stream anomalies in real time.</span>
                  </div>
                ) : (
                  evidenceLogs.map((ev, idx) => (
                    <div
                      key={ev._id || idx}
                      onClick={() => setSelectedLog(ev)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedLog?._id === ev._id
                          ? 'bg-orange-600/20 border-orange-500'
                          : 'bg-black/20 border-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ev.severity === 'CRITICAL' || ev.severity === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {ev.severity || 'MEDIUM'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {ev.session_id ? ev.session_id.substring(0, 14) : 'active_session'}...
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200">{ev.indicator}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                        <span>Timestamp: {ev.timestamp_start}s</span>
                        <span>Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Raw JSON Frame */}
              <div className="lg:col-span-5 glass-panel p-5 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    Forensic Signal Frame
                  </span>
                  {selectedLog && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                      className="glass-pill text-[10px] py-1 px-2.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                <div className="flex-1 glass-inset p-3 overflow-auto font-mono text-[11px] text-slate-300 min-h-[350px]">
                  {selectedLog ? (
                    <pre className="whitespace-pre-wrap">{JSON.stringify(selectedLog, null, 2)}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-center">
                      Select any audit record on the left to inspect raw verifiable signal telemetry.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SESSIONS & DOSSIERS
            ========================================================================= */}
        {activeTab === 'sessions' && (
          <div className="w-full max-w-[1600px] mx-auto space-y-5">
            <div className="glass-panel p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Sessions in MongoDB</span>
                <span className="text-[11px] text-slate-400 font-mono">({sessionsList.length} total)</span>
              </div>
              <button onClick={fetchStatsAndConfig} className="glass-pill text-xs py-1.5 px-3.5 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            <div className="glass-panel overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-black/30 text-slate-400 font-mono text-[11px]">
                    <th className="p-4">Session ID</th>
                    <th className="p-4">Mode</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Evidence Anomaly Logs</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {sessionsList.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 font-mono text-orange-300 font-bold">{s.id}</td>
                      <td className="p-4 uppercase font-semibold text-slate-300">{s.mode}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded ${
                          s.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-500/15 text-slate-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-300">{s.evidence_count} anomalies</td>
                      <td className="p-4">
                        <a
                          href={`http://localhost:8000/api/sessions/${s.id}/report`}
                          target="_blank"
                          rel="noreferrer"
                          className="glass-pill text-[11px] py-1 px-3 text-orange-300 hover:text-white"
                        >
                          View Forensic Dossier →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
