import React, { useState } from 'react';
import WorkspaceHeader from './WorkspaceHeader';
import { Settings, Database, Cpu, Radio, Server, Key, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle, Download } from 'lucide-react';

const ENGINES_STATUS = [
  { name: 'SigLIP2 Vision', lat: '12ms', fps: '30 FPS', load: 24 },
  { name: 'Faster-Whisper ASR', lat: '145ms', fps: '16 kHz', load: 38 },
  { name: 'Emotion2Vec Acoustic', lat: '22ms', fps: '50 Hz', load: 19 },
  { name: 'SFR-Mistral NLP', lat: '38ms', fps: 'Real-time', load: 45 },
  { name: 'MSCMLP Fusion', lat: '4ms', fps: '30 Hz', load: 12 },
  { name: '5-State HMM', lat: '2ms', fps: 'Continuous', load: 8 },
  { name: 'MediaPipe FaceMesh', lat: '10ms', fps: '30 FPS', load: 22 },
  { name: 'Motor MongoDB', lat: '3ms', fps: '5k w/s', load: 15 },
  { name: 'Binary WebSocket', lat: '<1ms', fps: '30 FPS+16k', load: 6 },
  { name: 'Evidence Ledger', lat: 'Instant', fps: 'Event-driven', load: 4 },
];

const AUDIT_SESSIONS = [
  { id: 'SESS-2024-0892', candidate: 'Sri Ram Kumar', evaluator: 'Dr. Mounika', duration: '24m 12s', evidence: 14, ts: '10:04:12' },
  { id: 'SESS-2024-0881', candidate: 'Priya Sharma', evaluator: 'Dr. Mounika', duration: '28m 44s', evidence: 22, ts: '09:14:08' },
  { id: 'SESS-2024-0876', candidate: 'Arjun Mehta', evaluator: 'Dr. Mounika', duration: '31m 05s', evidence: 18, ts: '08:32:55' },
];

const EVIDENCE_EVENTS = [
  { ts: '10:09:11', type: 'gaze', val: '18.2°', sev: 'medium' },
  { ts: '10:07:34', type: 'disfluency', val: '[FILLER: um]', sev: 'low' },
  { ts: '10:04:12', type: 'cadence', val: '82 WPM', sev: 'medium' },
  { ts: '10:02:28', type: 'pitch', val: '+14 Hz rise', sev: 'low' },
  { ts: '09:58:05', type: 'head_pose', val: 'Yaw +24°', sev: 'medium' },
];

const SEV_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

export default function AdminCockpit({ user, onLogout, onNavigateRole }) {
  const [activeTab, setActiveTab] = useState('Engine Studio');
  const [activePreset, setActivePreset] = useState('Technical Architecture Interview');
  const [llmKey, setLlmKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [llmProvider, setLlmProvider] = useState('OpenAI');
  const [keyStatus, setKeyStatus] = useState(null);
  const [whisperModel, setWhisperModel] = useState('base');
  const [fillerDetect, setFillerDetect] = useState(true);

  // Slider states
  const [faceConf, setFaceConf] = useState(85);
  const [gazeLimit, setGazeLimit] = useState(15);
  const [mediapipeCmplx, setMediapipeCmplx] = useState(1);
  const [vadSens, setVadSens] = useState(70);
  const [minWpm, setMinWpm] = useState(60);
  const [maxWpm, setMaxWpm] = useState(220);
  const [jitterThresh, setJitterThresh] = useState(2);
  const [visWeight, setVisWeight] = useState(42);
  const [acWeight, setAcWeight] = useState(33);
  const [lexWeight, setLexWeight] = useState(25);

  const testConnection = async () => {
    setKeyStatus('testing');
    setTimeout(() => setKeyStatus(llmKey.startsWith('sk-') || llmKey.length > 10 ? 'ok' : 'error'), 1200);
  };

  const SliderRow = ({ label, value, min = 0, max = 100, step = 1, unit = '', onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
        <span className="font-mono-data" style={{ fontSize: 11, color: '#2dd4bf', fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="glass-slider" style={{ width: '100%' }} />
    </div>
  );

  const SectionHeader = ({ label }) => (
    <div className="text-label" style={{ marginTop: 4, marginBottom: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>{label}</div>
  );

  return (
    <div className="cockpit-shell" style={{ WebkitAppRegion: 'no-drag' }}>
      <WorkspaceHeader
        role="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onNavigateRole={onNavigateRole}
        user={user}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12, padding: 12, flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── LEFT MAIN ── */}
        <div className="ajna-glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>

          {/* ENGINE STUDIO */}
          {activeTab === 'Engine Studio' && (
            <>
              {/* Presets */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <div className="text-label" style={{ marginBottom: 8 }}>QUICK PRESETS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Technical Architecture Interview', 'High-Stakes Exam Proctoring', 'Executive Behavioral Assessment'].map((p, i) => (
                    <button key={p} onClick={() => setActivePreset(p)}
                      style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s', WebkitAppRegion: 'no-drag', whiteSpace: 'nowrap',
                        background: activePreset === p ? ['rgba(45,212,191,0.15)', 'rgba(139,92,246,0.15)', 'rgba(245,158,11,0.15)'][i] : 'rgba(255,255,255,0.04)',
                        color: activePreset === p ? ['#2dd4bf', '#c4b5fd', '#fcd34d'][i] : '#64748b',
                        boxShadow: activePreset === p ? `0 0 0 1px ${['rgba(45,212,191,0.4)', 'rgba(139,92,246,0.4)', 'rgba(245,158,11,0.4)'][i]}` : '0 0 0 1px rgba(255,255,255,0.08)',
                      }}>{p}</button>
                  ))}
                </div>
              </div>
              {/* Sliders */}
              <div className="scroll-y" style={{ flex: 1, padding: '0 16px 16px' }}>
                <SectionHeader label="VISION & GAZE DETECTION" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SliderRow label="Face Confidence Threshold" value={faceConf} unit="%" onChange={setFaceConf} />
                  <SliderRow label="Gaze Deviation Limit" value={gazeLimit} max={45} unit="°" onChange={setGazeLimit} />
                  <SliderRow label="MediaPipe Model Complexity" value={mediapipeCmplx} max={2} step={1} unit="" onChange={setMediapipeCmplx} />
                </div>
                <SectionHeader label="ACOUSTIC & PROSODIC ANALYSIS" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SliderRow label="VAD Sensitivity" value={vadSens} unit="%" onChange={setVadSens} />
                  <SliderRow label="Min Speaking Rate Alert" value={minWpm} max={120} unit=" WPM" onChange={setMinWpm} />
                  <SliderRow label="Max Speaking Rate Alert" value={maxWpm} min={120} max={350} unit=" WPM" onChange={setMaxWpm} />
                  <SliderRow label="Jitter Alert Threshold" value={jitterThresh} max={10} step={0.1} unit="%" onChange={setJitterThresh} />
                </div>
                <SectionHeader label="SPEECH & ASR CONFIGURATION" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 7 }}>Whisper Model Size</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['tiny', 'base', 'small', 'medium'].map(m => (
                        <button key={m} onClick={() => setWhisperModel(m)}
                          style={{ flex: 1, padding: '6px 4px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s', WebkitAppRegion: 'no-drag', textTransform: 'capitalize',
                            background: whisperModel === m ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
                            color: whisperModel === m ? '#2dd4bf' : '#64748b',
                            boxShadow: whisperModel === m ? '0 0 0 1px rgba(45,212,191,0.4)' : '0 0 0 1px rgba(255,255,255,0.08)',
                          }}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>Filler Word Detection</span>
                    <button onClick={() => setFillerDetect(!fillerDetect)}
                      style={{ width: 42, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', WebkitAppRegion: 'no-drag',
                        background: fillerDetect ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.08)' }}>
                      <div style={{ position: 'absolute', top: 2, left: fillerDetect ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: fillerDetect ? '#2dd4bf' : '#475569', transition: 'left 0.2s, background 0.2s' }} />
                    </button>
                  </div>
                </div>
                <SectionHeader label="MULTIMODAL FUSION WEIGHTS" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SliderRow label="Vision Weight" value={visWeight} unit="" onChange={setVisWeight} />
                  <SliderRow label="Acoustic Weight" value={acWeight} unit="" onChange={setAcWeight} />
                  <SliderRow label="Lexical Weight" value={lexWeight} unit="" onChange={setLexWeight} />
                  <div style={{ fontSize: 10, color: '#475569', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                    Sum: {((visWeight + acWeight + lexWeight) / 100).toFixed(2)} (auto-normalised)
                  </div>
                </div>
                <SectionHeader label="LLM API CONFIGURATION" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                    {['OpenAI', 'Anthropic', 'Google'].map(p => (
                      <button key={p} onClick={() => setLlmProvider(p)}
                        style={{ flex: 1, padding: '6px 4px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s', WebkitAppRegion: 'no-drag',
                          background: llmProvider === p ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                          color: llmProvider === p ? '#c4b5fd' : '#64748b',
                          boxShadow: llmProvider === p ? '0 0 0 1px rgba(139,92,246,0.4)' : '0 0 0 1px rgba(255,255,255,0.08)',
                        }}>{p}</button>
                    ))}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input className="aurora-input" type={showKey ? 'text' : 'password'} value={llmKey} onChange={e => setLlmKey(e.target.value)}
                      placeholder={`${llmProvider === 'OpenAI' ? 'sk-...' : llmProvider === 'Anthropic' ? 'sk-ant-...' : 'AIza...'}`}
                      style={{ paddingRight: 42, fontFamily: 'var(--font-mono)', fontSize: 12 }} />
                    <button type="button" onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', WebkitAppRegion: 'no-drag', display: 'flex', alignItems: 'center' }}>
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={testConnection} className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 12 }}>
                      <RefreshCw size={12} style={{ animation: keyStatus === 'testing' ? 'spin 1s linear infinite' : 'none' }} />
                      Test Connection
                    </button>
                    {keyStatus === 'ok' && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✓ Connected</span>}
                    {keyStatus === 'error' && <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>✗ Invalid Key</span>}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SERVICE MESH */}
          {activeTab === 'Service Mesh' && (
            <div style={{ flex: 1, minHeight: 0, padding: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14, flexShrink: 0 }}>10 Engine Service Health</div>
              <div className="scroll-y" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, alignContent: 'start' }}>
                {ENGINES_STATUS.map(eng => (
                  <div key={eng.name} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.5)', display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eng.name}</span>
                      <span style={{ fontSize: 9, color: '#6ee7b7', background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(16,185,129,0.25)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>ONLINE</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
                      {[['Latency', eng.lat], ['Rate', eng.fps], ['Load', `${eng.load}%`]].map(([k, v]) => (
                        <div key={k} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: '#475569', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{k}</div>
                          <div className="font-mono-data" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${eng.load}%`, height: '100%', background: eng.load > 60 ? '#f59e0b' : '#2dd4bf', borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FORENSIC AUDIT */}
          {activeTab === 'Forensic Audit' && (
            <div className="scroll-y" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Sessions */}
              <div>
                <div className="text-label" style={{ marginBottom: 10 }}>RECENT USER SESSIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 60px 50px 70px', gap: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', fontSize: 9, color: '#475569', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span>Session ID</span><span>Candidate</span><span>Evaluator</span><span>Duration</span><span>Evid.</span><span>Time</span>
                  </div>
                  {AUDIT_SESSIONS.map(s => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 60px 50px 70px', gap: 8, padding: '9px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, fontFamily: 'var(--font-mono)', color: '#94a3b8', alignItems: 'center' }}>
                      <span style={{ color: '#5eead4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.id}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.candidate}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.evaluator}</span>
                      <span>{s.duration}</span>
                      <span style={{ color: '#f59e0b' }}>{s.evidence}</span>
                      <span>{s.ts}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Evidence events */}
              <div>
                <div className="text-label" style={{ marginBottom: 10 }}>RECENT EVIDENCE EVENTS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {EVIDENCE_EVENTS.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
                      <span className="font-mono-data" style={{ fontSize: 10, color: '#475569', flexShrink: 0 }}>{ev.ts}</span>
                      <span style={{ fontSize: 10, color: '#5eead4', background: 'rgba(45,212,191,0.08)', padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.2)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{ev.type}</span>
                      <span className="font-mono-data" style={{ fontSize: 10, color: '#94a3b8', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.val}</span>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_COLORS[ev.sev], flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* Export controls */}
              <div>
                <div className="text-label" style={{ marginBottom: 10 }}>EXPORT & ACTIONS</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 12 }}>
                    <Download size={13} />Export Audit CSV
                  </button>
                  <button className="btn-glass" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', fontSize: 12 }}>
                    <Download size={13} />Generate Full Dossier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Live System Status ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minHeight: 0 }}>

          {/* MongoDB */}
          <div className="ajna-glass-sm" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Database size={13} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', flex: 1 }}>MongoDB Atlas</span>
              <span style={{ fontSize: 9, color: '#6ee7b7', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(16,185,129,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>CONNECTED</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
              {[['Collections','6'],['Documents','14,382'],['Avg Write','3ms'],['Evidence','5,241']].map(([k, v]) => (
                <div key={k} style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{k}</div>
                  <div className="font-mono-data" style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* WebSocket */}
          <div className="ajna-glass-sm" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Radio size={13} style={{ color: '#2dd4bf' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9', flex: 1 }}>WebSocket Hub</span>
              <span className="font-mono-data" style={{ fontSize: 9, color: '#5eead4', background: 'rgba(45,212,191,0.08)', padding: '2px 7px', borderRadius: 5, border: '1px solid rgba(45,212,191,0.25)' }}>&lt;1ms</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
              {[['Connections','3'],['Msg/sec','847'],['Frame','13 B'],['Uptime','99.98%']].map(([k, v]) => (
                <div key={k} style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.25)', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, color: '#475569', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{k}</div>
                  <div className="font-mono-data" style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Health Dots */}
          <div className="ajna-glass-sm" style={{ padding: 14 }}>
            <div className="text-label" style={{ marginBottom: 10 }}>ENGINE HEALTH GRID</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
              {ENGINES_STATUS.map(eng => (
                <div key={eng.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.5)', display: 'inline-block' }} />
                  <span style={{ fontSize: 7, color: '#475569', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{eng.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Resources */}
          <div className="ajna-glass-sm" style={{ padding: 14 }}>
            <div className="text-label" style={{ marginBottom: 10 }}>SYSTEM RESOURCES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['CPU','24%',24,'#2dd4bf'],['RAM','1.8 / 8 GB',22,'#8b5cf6'],['GPU','Idle',5,'#10b981']].map(([k, v, pct, c]) => (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{k}</span>
                    <span className="font-mono-data" style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="ajna-glass-sm" style={{ padding: 14 }}>
            <div className="text-label" style={{ marginBottom: 10 }}>QUICK ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {['Flush Session Cache', 'Re-Index Evidence Ledger', 'Export System Diagnostic'].map(a => (
                <button key={a} className="btn-glass" style={{ width: '100%', padding: '8px 0', fontSize: 11, textAlign: 'center' }}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
