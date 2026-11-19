import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, EyeOff, ArrowLeft, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const DEMO_PROFILES = [
  { label: 'Dr. Mounika Reddy', role: 'evaluator', email: 'evaluator@ajna.ai', password: 'password123', color: '#f97316', initials: 'DM' },
  { label: 'Sri Ram Kumar', role: 'candidate', email: 'candidate@ajna.ai', password: 'password123', color: '#2dd4bf', initials: 'SR' },
  { label: 'Platform Admin', role: 'admin', email: 'admin@ajna.ai', password: 'password123', color: '#8b5cf6', initials: 'PA' },
];

export default function AuthPortal({ onLoginSuccess, onBack }) {
  const { login, register } = useAuthStore();
  const [tab, setTab] = useState('signin');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Sign-in fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regRole, setRegRole] = useState('evaluator');

  const handleDemoProfile = (p) => {
    onLoginSuccess(p.role);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      onLoginSuccess(user?.role || 'evaluator');
    } catch (err) {
      setError(err?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName.trim() || !regEmail.trim() || !regPw.trim()) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      const user = await register(regName, regEmail, regPw, regRole);
      onLoginSuccess(user?.role || regRole);
    } catch (err) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-portal-view w-full h-full"
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'relative', 
        padding: '32px 16px',
        overflowY: 'auto',
        WebkitAppRegion: 'no-drag' 
      }}
    >
      {/* Back button */}
      <button onClick={onBack} className="btn-glass"
        style={{ position: 'absolute', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '7px 14px', zIndex: 20, WebkitAppRegion: 'no-drag' }}>
        <ArrowLeft size={13} /><span>Back to Overview</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.98 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.3 }}
        className="ajna-glass shadow-2xl" 
        style={{ 
          width: 440, 
          maxWidth: '92vw', 
          padding: '32px 28px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 18, 
          margin: 'auto',
          position: 'relative',
          zIndex: 10,
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(45, 212, 191, 0.08)'
        }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#2dd4bf,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(45,212,191,0.4)' }}>
            <Sparkles style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>Ajna</div>
            <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'var(--font-mono)' }}>Observable Evidence Intelligence</div>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 4 }}>
          {[['signin','Sign In'],['register','Create Account']].map(([v, l]) => (
            <button key={v} onClick={() => { setTab(v); setError(''); }}
              style={{ flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s', WebkitAppRegion: 'no-drag',
                background: tab === v ? 'rgba(45,212,191,0.15)' : 'transparent',
                color: tab === v ? '#2dd4bf' : '#64748b',
                boxShadow: tab === v ? '0 0 0 1px rgba(45,212,191,0.35)' : 'none',
              }}>{l}</button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12, color: '#fca5a5' }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {tab === 'signin' ? (
            <motion.form key="signin" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
                <input className="aurora-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@ajna.ai" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="aurora-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', WebkitAppRegion: 'no-drag', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px 0', fontSize: 14, marginTop: 4, opacity: loading ? 0.6 : 1 }}>
                <LogIn size={15} /><span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </motion.form>
          ) : (
            <motion.form key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Full Name</label>
                <input className="aurora-input" type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Dr. Mounika Reddy" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
                <input className="aurora-input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@ajna.ai" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="aurora-input" type={showPw ? 'text' : 'password'} value={regPw} onChange={e => setRegPw(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', WebkitAppRegion: 'no-drag', display: 'flex', alignItems: 'center' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Role</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['evaluator','candidate','admin'].map(r => (
                    <button key={r} type="button" onClick={() => setRegRole(r)}
                      style={{ flex: 1, padding: '7px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s', WebkitAppRegion: 'no-drag', textTransform: 'capitalize',
                        background: regRole === r ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
                        color: regRole === r ? '#2dd4bf' : '#64748b',
                        boxShadow: regRole === r ? '0 0 0 1px rgba(45,212,191,0.4)' : '0 0 0 1px rgba(255,255,255,0.08)',
                      }}>{r}</button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px 0', fontSize: 14, marginTop: 4, opacity: loading ? 0.6 : 1 }}>
                <UserPlus size={15} /><span>{loading ? 'Creating...' : 'Create Account'}</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: '#475569' }}>or quick access</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Demo profiles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Demo Profiles</div>
          {DEMO_PROFILES.map(p => (
            <button key={p.role} onClick={() => handleDemoProfile(p)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s', WebkitAppRegion: 'no-drag', textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = `${p.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${p.color}22`, border: `1px solid ${p.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: p.color, flexShrink: 0 }}>{p.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'capitalize', fontFamily: 'var(--font-mono)' }}>{p.role}</div>
              </div>
              <ArrowRight size={13} style={{ color: '#475569', flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 10, color: '#374151', fontFamily: 'var(--font-mono)', paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          Observable Evidence AI • Ajna v2.6
        </div>
      </motion.div>
    </div>
  );
}
