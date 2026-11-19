import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Check, CheckCircle, Users, Shield,
  Activity, ShieldCheck, Radio, Cpu, Mic, Video, Database,
  ChevronRight
} from 'lucide-react';

const ENGINES = [
  { n: 'SigLIP2 Vision Embedder', lat: '12ms', fps: '30 FPS', dim: '1152-dim spatial', desc: 'Extracts dense spatial features and candidate attentiveness without speculative facial emotion inference.' },
  { n: 'Faster-Whisper Silero ASR', lat: '145ms', fps: '16 kHz', dim: 'Word-level tokens', desc: 'Ultra-low latency speech-to-text with Silero VAD segmentation and micro-timestamping.' },
  { n: 'Emotion2Vec Acoustic Engine', lat: '22ms', fps: '50 Hz', dim: '768-dim embeddings', desc: 'Measures continuous vocal pitch (F0), jitter, shimmer, harmonic-to-noise, and speech cadence.' },
  { n: 'SFR-Mistral Semantic NLP', lat: '38ms', fps: 'Real-time', dim: '4096-dim semantic', desc: 'Evaluates conceptual technical depth, key architecture terms, and structural reasoning fidelity.' },
  { n: 'MSCMLP Multimodal Fusion', lat: '4ms', fps: '30 Hz', dim: '256-dim Bottleneck', desc: 'Fuses vision, acoustic, and lexical embeddings with dynamic modality dropout.' },
  { n: '5-State Continuous HMM', lat: '2ms', fps: 'Continuous', dim: '5 Cognitive States', desc: 'Viterbi decoding across Steady, Hesitant, Rushed, Disengaged, and Absent cognitive states.' },
  { n: 'MediaPipe 468 FaceMesh', lat: '10ms', fps: '30 FPS', dim: '3D Head + Gaze', desc: 'Sub-millimeter face landmark geometry, 3D head gimbal velocity, and screen gaze deviation.' },
  { n: 'Motor Async MongoDB Ledger', lat: '3ms', fps: '5,000 w/s', dim: 'BSON Audit Ledger', desc: 'Continuous tamper-proof logging of multi-stream evaluation events and evidence tags.' },
  { n: 'Binary WebSocket Streaming', lat: '<1ms', fps: '30 FPS+16k', dim: '13-Byte Frame', desc: 'Multiplexed binary protocol with millisecond clock sync and zero event loop blocking.' },
  { n: 'Observable Evidence Ledger', lat: 'Instant', fps: 'Event-driven', dim: 'Cryptographic Chain', desc: 'Transforms raw telemetry into auditable evidence clips with non-hallucination ethics.' },
];

const BULLETS = [
  '30 FPS SigLIP2 vision & 468 landmark telemetry',
  '16 kHz Emotion2Vec vocal prosody & pitch jitter',
  'Faster-Whisper VAD real-time transcription',
  'Strict Observable Evidence Guarantee',
];

export default function ShowcaseLanding({ onSelectRole }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="showcase-page" style={{ WebkitAppRegion: 'no-drag' }}>

      {/* ── STICKY NAV ── */}
      <nav className="showcase-nav" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="showcase-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#2dd4bf,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(45,212,191,0.4)' }}>
              <Sparkles style={{ width: 16, height: 16, color: 'white' }} />
            </div>
            <div>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Ajna</span>
              <span style={{ fontSize: 11, color: '#2dd4bf', fontFamily: 'var(--font-mono)', marginLeft: 6, fontWeight: 600 }}>Intelligence</span>
            </div>
          </div>
          {/* Nav links */}
          <div style={{ display: 'flex', gap: 28, fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>
            {['Overview', '10 Engines', 'Workflows', 'Evidence Guarantee'].map((l, i) => (
              <button key={l} onClick={() => scrollTo(['hero','engines','roles','ethics'][i])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', padding: '4px 2px', WebkitAppRegion: 'no-drag' }}
                onMouseEnter={e => e.target.style.color = '#f1f5f9'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >{l}</button>
            ))}
          </div>
          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button onClick={() => onSelectRole('auth')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#94a3b8', WebkitAppRegion: 'no-drag' }}
              onMouseEnter={e => e.target.style.color = '#f1f5f9'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>Sign In</button>
            <button onClick={() => onSelectRole('auth')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: 13 }}>
              <span>Launch Suite</span><ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" className="showcase-container" style={{ paddingTop: 52, paddingBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 48 }}>

          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ flex: 1, minWidth: 0, maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>

            <span className="aurora-badge">
              <Sparkles size={12} />
              Observable Evidence AI • Non-Invasive Multimodal Telemetry
            </span>

            <h1 className="hero-h1" style={{ margin: 0 }}>
              Evaluate at the<br />
              <span className="text-aurora">speed of perception.</span>
            </h1>

            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65, maxWidth: 480, margin: 0 }}>
              Turn continuous 30 FPS computer vision, acoustic vocal prosody, and speech-to-text into unassailable human evaluation dossiers — with zero AI hallucination.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BULLETS.map(b => (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={10} style={{ color: '#2dd4bf', strokeWidth: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{b}</span>
                </div>
              ))}
            </div>

            {/* Engine proof pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex' }}>
                {[['DM','#f97316','#fb923c'],['SR','#2dd4bf','#06b6d4'],['AD','#8b5cf6','#a78bfa']].map(([init, a, b]) => (
                  <div key={init} style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${a},${b})`, border: '2px solid #07090e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', marginRight: -6 }}>{init}</div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: '#2dd4bf', fontWeight: 600, marginLeft: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', display: 'inline-block', animation: 'dot-pulse 2s infinite' }} />
                10 Real-Time Engines Synchronized · Sub-15ms Latency
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => onSelectRole('auth')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', fontSize: 14 }}>
                <span>Enter Ajna Workspace</span><ArrowRight size={15} />
              </button>
              <button onClick={() => scrollTo('engines')} className="btn-glass" style={{ padding: '11px 22px', fontSize: 14 }}>
                Explore 10 Engines
              </button>
            </div>
          </motion.div>

          {/* Right — Live HUD Card */}
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            style={{ flexShrink: 0, width: 370 }}>
            <div className="ajna-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* HUD header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live Perception HUD</span>
                </div>
                <span className="glass-pill-teal" style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '3px 8px', borderRadius: 6 }}>30 FPS • 12ms</span>
              </div>

              {/* Camera preview */}
              <div style={{ height: 200, background: 'rgba(0,0,0,0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Grid mesh */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(to right,#14b8a6 1px,transparent 1px),linear-gradient(to bottom,#14b8a6 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
                {/* Face landmark bracket */}
                <div style={{ width: 100, height: 130, border: '1px solid rgba(45,212,191,0.35)', borderRadius: 8, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderTop: '2px solid #2dd4bf', borderLeft: '2px solid #2dd4bf' }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderTop: '2px solid #2dd4bf', borderRight: '2px solid #2dd4bf' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: 10, height: 10, borderBottom: '2px solid #2dd4bf', borderLeft: '2px solid #2dd4bf' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderBottom: '2px solid #2dd4bf', borderRight: '2px solid #2dd4bf' }} />
                  <div style={{ width: '80%', height: 1, background: 'linear-gradient(to right,transparent,#2dd4bf,transparent)', boxShadow: '0 0 8px rgba(45,212,191,0.6)' }} />
                  <span style={{ fontSize: 9, color: '#5eead4', fontFamily: 'var(--font-mono)', marginTop: 6, fontWeight: 700 }}>468 FACEMESH</span>
                </div>
                {/* Overlays */}
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#94a3b8', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)' }}>Gaze: 2.1° (Centered)</span>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#2dd4bf', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.25)' }}>Face Conf: 99.4%</span>
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[['F0 Pitch','145.2 Hz','#2dd4bf'],['Cadence','152 WPM','#10b981'],['Cognitive','STEADY','#8b5cf6']].map(([label, val, c]) => (
                  <div key={label} style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{val}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => onSelectRole('auth')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 0', fontSize: 13 }}>
                <span>Access Verified Workspace</span><ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 10 ENGINES ── */}
      <section id="engines" className="showcase-container" style={{ paddingTop: 8, paddingBottom: 32 }}>
        <div className="ajna-glass" style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf', display: 'inline-block', boxShadow: '0 0 8px rgba(45,212,191,0.6)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-mono)' }}>ajna / telemetry-canvas</span>
              <span style={{ fontSize: 12, color: '#475569', fontFamily: 'var(--font-mono)' }}>· 10 computational modules active</span>
            </div>
            <span className="aurora-badge" style={{ fontSize: 10 }}>
              <Radio size={11} style={{ animation: 'spin 3s linear infinite' }} />
              30 FPS WebSocket Feed
            </span>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: '-0.03em' }}>10 Real Computational Engines</h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px', maxWidth: 600 }}>Ajna executes mathematically verified feature extraction in parallel with zero synthetic or mock data.</p>

          {/* Engine grid */}
          <div className="engines-grid">
            {ENGINES.map((eng, i) => (
              <div key={i} className="engine-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'default', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(45,212,191,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#2dd4bf', fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#5eead4', background: 'rgba(45,212,191,0.1)', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(45,212,191,0.25)' }}>{eng.lat}</span>
                  </div>
                  <h4 style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', margin: '0 0 5px', lineHeight: 1.3 }}>{eng.n}</h4>
                  <p style={{ fontSize: 10, color: '#475569', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 }}>{eng.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 9, fontFamily: 'var(--font-mono)', color: '#475569' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 4 }}>{eng.dim}</span>
                  <span style={{ color: '#2dd4bf', fontWeight: 600, flexShrink: 0 }}>{eng.fps}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="showcase-container" style={{ paddingTop: 8, paddingBottom: 32 }}>
        <div style={{ marginBottom: 20 }}>
          <span className="aurora-badge" style={{ marginBottom: 12, display: 'inline-flex' }}>
            <Users size={12} /> Operational Roles
          </span>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: '8px 0 6px', letterSpacing: '-0.03em' }}>Designed for Every Participant</h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Streamlined interfaces tailored for interviewers, candidates, and ethics auditors.</p>
        </div>
        <div className="roles-grid">
          {[
            { icon: Activity, color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.3)', role: 'evaluator', title: 'Lead Evaluator Suite', desc: 'Real-time perception HUD, acoustic prosody tracker, live ASR stream, and 5-state cognitive HMM estimation.', btnClass: 'btn-primary', label: 'Enter Evaluator Suite' },
            { icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', role: 'candidate', title: 'Candidate Room', desc: 'Camera & microphone preflight check, live face HUD mirror, session prompts, and observable evidence guarantee.', btnClass: 'btn-glass', label: 'Enter Candidate Room' },
            { icon: Shield, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', role: 'admin', title: 'Admin Governance Hub', desc: 'MongoDB inspector, real-time fusion weight calibration, threshold sliders, and forensic evidence ledger.', btnClass: 'btn-glass', label: 'Enter Admin Hub' },
          ].map(({ icon: Icon, color, bg, border, role, title, desc, btnClass, label }) => (
            <div key={role} className="ajna-glass" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>{title}</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
              <button onClick={() => onSelectRole(role)} className={btnClass} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px 0', fontSize: 13, marginTop: 'auto' }}>
                <span>{label}</span><ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── ETHICS ── */}
      <section id="ethics" className="showcase-container" style={{ paddingTop: 8, paddingBottom: 40 }}>
        <div className="ajna-glass" style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span className="aurora-badge" style={{ display: 'inline-flex' }}>
              <ShieldCheck size={12} /> Observable Evidence Principle
            </span>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.3 }}>Physical Telemetry Over Psychological Guessing</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Traditional proctoring AI guesses internal emotional states using flawed sentiment heuristics. Ajna strictly rejects emotion labels, capturing only verifiable physical signals: gaze vectors, vocal pitch jitter, phoneme latency, and speech cadence.
            </p>
          </div>
          <div style={{ padding: 20, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <CheckCircle size={16} style={{ color: '#2dd4bf' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2dd4bf', fontFamily: 'var(--font-mono)' }}>Verifiable Physical Ledger</span>
            </div>
            {['3D Head Orientation: Yaw / Pitch / Roll (deg/sec)', 'Gaze Deflection: Screen-relative deviation angle', 'Vocal Acoustic F0: 16 kHz pitch contour & jitter', 'Lexical Transcription: Faster-Whisper VAD timestamps', 'Cognitive State: 5-State Continuous HMM'].map(item => (
              <div key={item} style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', gap: 8 }}>
                <span style={{ color: '#2dd4bf', flexShrink: 0 }}>✓</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '20px 32px' }}>
        <div className="showcase-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#475569', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2dd4bf', display: 'inline-block' }} />
            Ajna Engine v2.6 • Liquid Glass Multimodal Intelligence
          </div>
          <div>PyTorch · SigLIP2 · Faster-Whisper · Emotion2Vec · MediaPipe · Motor</div>
        </div>
      </footer>
    </div>
  );
}
