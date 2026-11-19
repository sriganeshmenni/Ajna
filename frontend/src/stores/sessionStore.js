import { create } from 'zustand';

const defaultMetrics = {
  facePresent: false,
  faceProbability: 0,
  faceCount: 0,
  headPose: { yaw: 0, pitch: 0, roll: 0 },
  gazeDeviation: 0,
  speechActive: false,
  speechProbability: 0,
  speakingRate: 0,
  currentState: 'steady',
  stateProbs: { steady: 0, hesitant: 0, rushed: 0, disengaged: 0, absent: 0 },
  candidateVoiceProb: 0,
  noiseProb: 0,
};

const defaultEngineStatus = {
  vision: 'offline',
  audio: 'offline',
  asr: 'offline',
  nlp: 'offline',
  fusion: 'offline',
  llm: 'offline',
};

const defaultHudOverlays = {
  landmarks: true,
  pose: true,
  gaze: true,
  boundingBox: true,
};

const defaultFusionWeights = {
  vision: 0.30,
  audio: 0.28,
  speech: 0.22,
  nlp: 0.20,
};

const useSessionStore = create((set, get) => ({
  // Session state
  sessionId: null,
  status: 'idle', // idle | connecting | active | paused | completed | error
  mode: 'interview', // interview | proctoring | communication
  startedAt: null,
  duration: 0,
  
  // Real-time metrics
  metrics: { ...defaultMetrics },
  
  // Vision telemetry (raw from backend)
  visionTelemetry: null,
  
  // Audio telemetry (raw from backend)
  audioTelemetry: null,
  
  // State telemetry (raw from backend)
  stateTelemetry: null,

  // Engine status
  engineStatus: { ...defaultEngineStatus },
  
  // Fusion weights (from multimodal fusion engine)
  fusionWeights: { ...defaultFusionWeights },
  
  // HUD overlay toggles
  hudOverlays: { ...defaultHudOverlays },
  
  // Command palette state
  commandPaletteOpen: false,
  
  // Events timeline
  events: [],
  
  // Transcription
  transcription: [],
  
  // Evidence
  evidence: [],
  
  // F0 pitch history for sparkline (last 50 values)
  f0History: [],
  
  // State history for sparkline (last 50 entries)
  stateHistory: [],
  
  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setDuration: (duration) => set({ duration }),
  
  // Telemetry setters
  setVisionTelemetry: (data) => set({ visionTelemetry: data }),
  setAudioTelemetry: (data) => set({ audioTelemetry: data }),
  setStateTelemetry: (data) => set((state) => ({
    stateTelemetry: data,
    stateHistory: [...state.stateHistory.slice(-49), {
      timestamp: Date.now(),
      dominant: data.dominant_state,
      entropy: data.state_entropy,
    }],
  })),
  
  // Engine status
  setEngineStatus: (status) => set((state) => ({
    engineStatus: { ...state.engineStatus, ...status },
  })),
  
  // Fusion weights
  setFusionWeights: (weights) => set({ fusionWeights: weights }),
  
  // HUD overlays
  toggleOverlay: (name) => set((state) => ({
    hudOverlays: { ...state.hudOverlays, [name]: !state.hudOverlays[name] },
  })),
  
  // Command palette
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  
  // Metrics
  updateMetrics: (metrics) => set((state) => ({
    metrics: { ...state.metrics, ...metrics },
  })),
  
  // Events
  addEvent: (event) => set((state) => ({
    events: [...state.events.slice(-499), event],
  })),
  
  // Transcription
  addTranscription: (segment) => set((state) => ({
    transcription: [...state.transcription, segment],
  })),
  
  // Evidence
  addEvidence: (item) => set((state) => ({
    evidence: [...state.evidence, item],
  })),
  
  // F0 history
  addF0: (value) => set((state) => ({
    f0History: [...state.f0History.slice(-49), value],
  })),
  
  // Reset session
  reset: () => set({
    sessionId: null,
    status: 'idle',
    startedAt: null,
    duration: 0,
    events: [],
    transcription: [],
    evidence: [],
    metrics: { ...defaultMetrics },
    visionTelemetry: null,
    audioTelemetry: null,
    stateTelemetry: null,
    engineStatus: { ...defaultEngineStatus },
    fusionWeights: { ...defaultFusionWeights },
    f0History: [],
    stateHistory: [],
  }),
}));

export default useSessionStore;
