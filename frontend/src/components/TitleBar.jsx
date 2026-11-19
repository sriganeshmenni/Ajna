import React, { useEffect, useState } from 'react';
import { Minus, Square, X, Sparkles } from 'lucide-react';

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return undefined;
    window.electronAPI.isMaximized().then(setIsMaximized);
    return window.electronAPI.onMaximizedChange(setIsMaximized);
  }, []);

  if (!window.electronAPI) return null;

  return (
    <div 
      className="ajna-system-titlebar"
      style={{
        zIndex: 9999,
        height: '32px',
        minHeight: '32px',
        maxHeight: '32px',
        background: 'rgba(8, 12, 22, 0.92)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Left side: Draggable bar with Small Ajna emblem + AJNA DESKTOP v2.6 */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 12px',
          height: '100%',
          flex: 1,
          WebkitAppRegion: 'drag',
          cursor: 'grab'
        }}
      >
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '5px',
          background: 'linear-gradient(135deg, #2dd4bf 0%, #06b6d4 50%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 8px rgba(45, 212, 191, 0.4)'
        }}>
          <Sparkles size={10} color="#041219" />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: '#e2e8f0'
        }}>
          AJNA DESKTOP
        </span>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '10px',
          fontWeight: 600,
          color: '#2dd4bf',
          background: 'rgba(45, 212, 191, 0.1)',
          padding: '1px 5px',
          borderRadius: '4px',
          border: '1px solid rgba(45, 212, 191, 0.25)'
        }}>
          v2.6
        </span>
      </div>

      {/* Right side: Dedicated Non-drag Minimize (—), Maximize (□), and Close (×) */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          WebkitAppRegion: 'no-drag'
        }}
      >
        <button
          type="button"
          onClick={() => window.electronAPI.minimize()}
          aria-label="Minimize"
          style={{
            width: '42px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Minus size={13} />
        </button>

        <button
          type="button"
          onClick={() => window.electronAPI.maximize()}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          style={{
            width: '42px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <Square size={10} />
        </button>

        <button
          type="button"
          onClick={() => window.electronAPI.close()}
          aria-label="Close"
          style={{
            width: '42px',
            height: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            WebkitAppRegion: 'no-drag'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e11d48';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
