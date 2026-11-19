import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Square, FileText, Search, LogOut, 
  Activity, Shield, User, Minus, Square as WindowMax, X, Scale, MessageSquare 
} from 'lucide-react';

const CommandBar = ({
  onStart,
  onStop,
  onOpenPalette,
  onViewReport,
  hasReport,
  mode,
  setMode,
  status,
  duration,
  sessionId,
  activeScenario,
  onSelectScenario,
  user,
  onLogout,
  onNavigateRole,
  onOpenRubric,
  onToggleNotes
}) => {
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      window.electronAPI.isMaximized().then(setIsMaximized);
      const unsub = window.electronAPI.onMaximizedChange(setIsMaximized);
      return () => unsub?.();
    }
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLive = status === 'active';

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'candidate': return 'badge-emerald';
      case 'admin': return 'badge-amber';
      default: return 'badge-orange';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AJ';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="glass-panel workspace-header" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 14px',
      gap: '10px',
      borderRadius: '12px'
    }}>
      {/* Brand Identity & Refraction Indicator */}
      <div className="window-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <motion.div 
          whileHover={{ scale: 1.08, rotate: 3 }}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, rgba(255, 94, 58, 0.95) 0%, rgba(249, 115, 22, 0.95) 50%, rgba(234, 88, 12, 1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(249, 115, 22, 0.6), inset 0 1px 1.5px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle glossy sheen */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: '50%',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)',
            borderRadius: '10px 10px 0 0'
          }} />
          {/* Isometric Cube / Diamond Glyph */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round"/>
            <path d="M12 12L21 7.2" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M12 12V22" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M12 12L3 7.2" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
          </svg>
        </motion.div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: '15px', 
              fontWeight: 900, 
              letterSpacing: '0.12em',
              background: 'linear-gradient(135deg, #ffffff 20%, #fdba74 65%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 8px rgba(249, 115, 22, 0.35))'
            }}>
              AJNA
            </span>
            <span className="glass-pill glass-pill-active" style={{ fontSize: '9px', padding: '2px 7px', fontWeight: 700, letterSpacing: '0.04em' }}>
              <span className="pulse-emerald-dot" style={{ width: '5px', height: '5px', marginRight: '3px' }} />
              MULTIMODAL INTELLIGENCE
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            SID: {sessionId ? sessionId.substring(0, 18) : 'AWAITING_INITIALIZATION'}
          </div>
        </div>
      </div>

      {/* Scenario Benchmark Controller */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px', 
        background: 'rgba(255, 255, 255, 0.04)', 
        backdropFilter: 'blur(16px)',
        padding: '3px 6px', 
        borderRadius: '8px', 
        border: '1px solid rgba(255, 255, 255, 0.09)' 
      }}>
        <span style={{ fontSize: '9px', fontWeight: 700, color: '#fb923c', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <Activity size={12} /> BENCHMARK:
        </span>
        {[
          { id: 'ideal', label: 'IDEAL' },
          { id: 'hesitation', label: 'HESITANT' },
          { id: 'proctoring_anomaly', label: 'PROCTORING RISK' },
          { id: 'rushed', label: 'RUSHED' }
        ].map((sc) => (
          <button
            key={sc.id}
            onClick={() => onSelectScenario?.(sc.id)}
            style={{
              border: activeScenario === sc.id ? '1px solid rgba(249, 115, 22, 0.6)' : '1px solid transparent',
              background: activeScenario === sc.id ? 'rgba(249, 115, 22, 0.25)' : 'transparent',
              color: activeScenario === sc.id ? '#ffffff' : '#94a3b8',
              padding: '2px 8px',
              borderRadius: '5px',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Mode Selector & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.04)', 
          backdropFilter: 'blur(16px)',
          padding: '2px', 
          borderRadius: '7px', 
          border: '1px solid rgba(255, 255, 255, 0.09)' 
        }}>
          {[
            { id: 'interview', label: 'INTERVIEW' },
            { id: 'proctoring', label: 'PROCTORING' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              disabled={isLive}
              style={{
                border: 'none',
                background: mode === m.id ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'transparent',
                color: mode === m.id ? '#ffffff' : '#94a3b8',
                padding: '4px 9px',
                borderRadius: '5px',
                fontSize: '10px',
                fontWeight: 700,
                cursor: isLive ? 'not-allowed' : 'pointer',
                boxShadow: mode === m.id ? '0 2px 8px rgba(249, 115, 22, 0.3)' : 'none'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Live Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${isLive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
          padding: '4px 10px',
          borderRadius: '7px'
        }}>
          <span className={isLive ? "pulse-green-dot" : "pulse-gray-dot"}></span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: isLive ? '#34d399' : '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            {isLive ? `LIVE ${formatTime(duration)}` : 'READY'}
          </span>
        </div>

        {/* Start / Stop Button */}
        {!isLive ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-antigravity btn-primary" 
            onClick={onStart}
          >
            <Play size={12} fill="white" /> START EVALUATION
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-antigravity btn-danger" 
            onClick={onStop}
          >
            <Square size={12} fill="white" /> TERMINATE
          </motion.button>
        )}

        {onOpenRubric && (
          <button className="btn-antigravity btn-secondary" onClick={onOpenRubric} title="32-Head Rubric Consensus">
            <Scale size={12} /> RUBRIC
          </button>
        )}

        {onToggleNotes && (
          <button className="btn-antigravity btn-secondary" onClick={onToggleNotes} title="Dossier Notes">
            <MessageSquare size={12} /> NOTES
          </button>
        )}

        {hasReport && (
          <button className="btn-antigravity btn-secondary" onClick={onViewReport}>
            <FileText size={12} /> REPORT
          </button>
        )}

        {/* Authenticated User Capsule */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '2px 8px 2px 5px',
            borderRadius: '7px'
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#f97316',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700
            }}>
              {getInitials(user.full_name)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.full_name?.split(' ')[0]}
              </span>
              <span className={`badge-tag ${getRoleBadge(user.role)}`} style={{ fontSize: '8px', padding: '1px 3px', width: 'fit-content' }}>
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <LogOut size={13} />
            </button>
          </div>
        )}

        {/* Role Quick Switcher */}
        {onNavigateRole && (
          <div className="window-no-drag" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 4px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => onNavigateRole('showcase')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 6px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              title="Return to Platform Showcase"
            >
              Showcase
            </button>
            <button
              onClick={() => onNavigateRole('candidate')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#34d399',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 6px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Switch to Candidate Room"
            >
              Candidate
            </button>
            <button
              onClick={() => onNavigateRole('admin')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fbbf24',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 6px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Switch to Admin Hub"
            >
              Admin
            </button>
          </div>
        )}

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenPalette}
          className="window-no-drag"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '5px 8px',
            borderRadius: '7px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <Search size={12} /> Ctrl+K
        </button>

        {/* Electron Window Controls (if inside desktop shell) */}
        {isElectron && (
          <div className="window-no-drag" style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
            <button 
              onClick={() => window.electronAPI.minimize()} 
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title="Minimize"
            >
              <Minus size={13} />
            </button>
            <button 
              onClick={() => window.electronAPI.maximize()} 
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <WindowMax size={11} />
            </button>
            <button 
              onClick={() => window.electronAPI.close()} 
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              title="Close"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandBar;
