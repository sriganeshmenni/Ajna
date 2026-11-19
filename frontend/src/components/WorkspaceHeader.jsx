import React from 'react';
import { 
  Sparkles, ShieldCheck, Database, LogOut, User, Activity, CheckCircle
} from 'lucide-react';

export default function WorkspaceHeader({
  workspaceTitle = 'Evaluator Suite',
  workspaceBadge = 'EVALUATOR COCKPIT',
  workspaceType = 'evaluator', // 'evaluator' | 'admin' | 'candidate'
  activeTab,
  tabs = [],
  onSelectTab,
  user,
  onLogout,
  onNavigateRole,
  dbLatency = 1.7
}) {
  const getInitials = (name) => {
    if (!name) return 'AJ';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.full_name || (
    workspaceType === 'candidate' ? 'Sri ram (Candidate #01)' :
    workspaceType === 'admin' ? 'Platform Administrator' :
    'Dr. Mounika (Lead Evaluator)'
  );

  const displayEmail = user?.email || (
    workspaceType === 'candidate' ? 'candidate@antigravity.ai' :
    workspaceType === 'admin' ? 'admin@antigravity.ai' :
    'evaluator@antigravity.ai'
  );

  return (
    <header 
      className="workspace-header-60 ajna-glass"
      style={{
        height: '60px',
        minHeight: '60px',
        maxHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 50,
        WebkitAppRegion: 'no-drag' // Decoupled completely from window dragging
      }}
    >
      {/* ─── LEFT ZONE: AJNA GLOWING LOGO + ACTIVE WORKSPACE PILL + LIVE STATUS ─── */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          WebkitAppRegion: 'no-drag'
        }}
      >
        {/* Ajna glowing water-droplet / iris logo */}
        <div 
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 40%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(20, 184, 166, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            flexShrink: 0
          }}
        >
          <Sparkles size={18} color="#ffffff" />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontFamily: 'var(--font-sans)', 
              fontWeight: 800, 
              fontSize: '14px', 
              letterSpacing: '0.04em',
              color: '#ffffff'
            }}>
              {workspaceTitle}
            </span>

            {/* Active Workspace Pill */}
            <span 
              style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '999px',
                background: workspaceType === 'candidate' 
                  ? 'rgba(16, 185, 129, 0.16)' 
                  : workspaceType === 'admin' 
                  ? 'rgba(245, 158, 11, 0.16)' 
                  : 'rgba(45, 212, 191, 0.16)',
                color: workspaceType === 'candidate' 
                  ? '#34d399' 
                  : workspaceType === 'admin' 
                  ? '#fbbf24' 
                  : '#2dd4bf',
                border: `1px solid ${
                  workspaceType === 'candidate' 
                    ? 'rgba(16, 185, 129, 0.35)' 
                    : workspaceType === 'admin' 
                    ? 'rgba(245, 158, 11, 0.35)' 
                    : 'rgba(45, 212, 191, 0.35)'
                }`
              }}
            >
              {workspaceBadge}
            </span>
          </div>

          {/* Live MongoDB & Engine status indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '10px', 
            fontFamily: 'var(--font-mono)', 
            color: '#94a3b8',
            marginTop: '1px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block'
            }} />
            <span style={{ color: '#34d399', fontWeight: 600 }}>DB ONLINE</span>
            <span style={{ color: '#475569' }}>•</span>
            <span>10 ENGINES READY</span>
            <span style={{ color: '#475569' }}>({dbLatency}ms)</span>
          </div>
        </div>
      </div>

      {/* ─── CENTER ZONE: CLEAN SEGMENTED GLASS PILL TABS ─── */}
      {tabs && tabs.length > 0 && (
        <nav 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '12px',
            background: 'rgba(10, 15, 25, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px)',
            WebkitAppRegion: 'no-drag'
          }}
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab && onSelectTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  fontFamily: 'var(--font-sans)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(45, 212, 191, 0.22) 0%, rgba(139, 92, 246, 0.22) 100%)' 
                    : 'transparent',
                  border: isSelected 
                    ? '1px solid rgba(45, 212, 191, 0.45)' 
                    : '1px solid transparent',
                  boxShadow: isSelected 
                    ? '0 4px 14px rgba(45, 212, 191, 0.2)' 
                    : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  WebkitAppRegion: 'no-drag'
                }}
              >
                {Icon && <Icon size={14} color={isSelected ? '#2dd4bf' : '#94a3b8'} />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#2dd4bf' : '#94a3b8'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ─── RIGHT ZONE (STRICTLY NON-DRAGGING & SPACED) ─── */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          WebkitAppRegion: 'no-drag'
        }}
      >
        {/* Role Switcher Pill (Evaluator / Candidate / Admin for quick testing) */}
        {onNavigateRole && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              padding: '3px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              WebkitAppRegion: 'no-drag'
            }}
          >
            <button
              type="button"
              onClick={() => onNavigateRole('showcase')}
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'transparent',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                WebkitAppRegion: 'no-drag'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            >
              Showcase
            </button>
            <button
              type="button"
              onClick={() => onNavigateRole('evaluator')}
              style={{
                fontSize: '10px',
                fontWeight: workspaceType === 'evaluator' ? 700 : 600,
                padding: '4px 8px',
                borderRadius: '6px',
                background: workspaceType === 'evaluator' ? 'rgba(45, 212, 191, 0.2)' : 'transparent',
                color: workspaceType === 'evaluator' ? '#2dd4bf' : '#94a3b8',
                border: workspaceType === 'evaluator' ? '1px solid rgba(45, 212, 191, 0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                WebkitAppRegion: 'no-drag'
              }}
            >
              Evaluator
            </button>
            <button
              type="button"
              onClick={() => onNavigateRole('candidate')}
              style={{
                fontSize: '10px',
                fontWeight: workspaceType === 'candidate' ? 700 : 600,
                padding: '4px 8px',
                borderRadius: '6px',
                background: workspaceType === 'candidate' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: workspaceType === 'candidate' ? '#34d399' : '#94a3b8',
                border: workspaceType === 'candidate' ? '1px solid rgba(16, 185, 129, 0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                WebkitAppRegion: 'no-drag'
              }}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => onNavigateRole('admin')}
              style={{
                fontSize: '10px',
                fontWeight: workspaceType === 'admin' ? 700 : 600,
                padding: '4px 8px',
                borderRadius: '6px',
                background: workspaceType === 'admin' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: workspaceType === 'admin' ? '#fbbf24' : '#94a3b8',
                border: workspaceType === 'admin' ? '1px solid rgba(245, 158, 11, 0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                WebkitAppRegion: 'no-drag'
              }}
            >
              Admin
            </button>
          </div>
        )}

        {/* Logged-in User Avatar & Name */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 6px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            WebkitAppRegion: 'no-drag'
          }}
        >
          <div 
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 800,
              color: '#ffffff'
            }}
          >
            {getInitials(displayName)}
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
              {displayEmail}
            </div>
          </div>
        </div>

        {/* High-contrast, clearly separated Sign Out button */}
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sign Out"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9px',
            background: 'rgba(244, 63, 94, 0.10)',
            border: '1px solid rgba(244, 63, 94, 0.40)',
            color: '#fca5a5',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 10px rgba(244, 63, 94, 0.15)',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.25)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.65)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(244, 63, 94, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.10)';
            e.currentTarget.style.color = '#fca5a5';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.40)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(244, 63, 94, 0.15)';
          }}
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
