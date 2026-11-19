import React, { useState, useEffect, useRef } from 'react';

const commandsList = [
  { id: 'start', label: 'Start Live Session', icon: '▸', shortcut: '' },
  { id: 'stop', label: 'Stop Session', icon: '■', shortcut: '' },
  { id: 'report', label: 'View Evaluation Report', icon: '◆', shortcut: '' },
  { id: 'mode_interview', label: 'Switch to Interview Mode', icon: '●', shortcut: '' },
  { id: 'mode_proctoring', label: 'Switch to Proctoring Mode', icon: '●', shortcut: '' },
  { id: 'mode_communication', label: 'Switch to Communication Mode', icon: '●', shortcut: '' },
  { id: 'toggle_hud', label: 'Toggle HUD Overlays', icon: '◇', shortcut: '' },
  { id: 'toggle_landmarks', label: 'Toggle Face Landmarks', icon: '◇', shortcut: '' },
  { id: 'toggle_pose', label: 'Toggle Head Pose Vectors', icon: '◇', shortcut: '' },
  { id: 'toggle_gaze', label: 'Toggle Gaze Tracking', icon: '◇', shortcut: '' },
  { id: 'answer_eval', label: 'Open Answer Intelligence Panel', icon: '◆', shortcut: '' },
  { id: 'health', label: 'Open System Health Details', icon: '◆', shortcut: '' },
];

const CommandPalette = ({ isOpen, onClose, onExecute }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  const filteredCommands = commandsList.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.id.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        onExecute(filteredCommands[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop command-palette-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15vh',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div 
        className="modal-content command-palette water-bubble-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '520px',
          maxWidth: '92%',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '12px', borderBottom: '1px solid #1e293b' }}>
          <input
            ref={inputRef}
            className="command-palette-input"
            type="text"
            placeholder="Type a command or search action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              backgroundColor: '#090d16',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              color: '#f8fafc',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              padding: '10px 14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div 
          className="command-palette-list"
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '6px 0'
          }}
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  className={`command-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onExecute(cmd.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.14)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #f97316' : '3px solid transparent',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fb923c', fontFamily: 'var(--font-mono)' }}>{cmd.icon}</span>
                    <span>{cmd.label}</span>
                  </div>
                  {cmd.shortcut && (
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#94a3b8', 
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: '#090d16',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid #1e293b'
                    }}>
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
              No commands found.
            </div>
          )}
        </div>
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #1e293b',
          fontSize: '11px',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <span><kbd style={{ background: '#090d16', padding: '1px 5px', borderRadius: '3px', border: '1px solid #1e293b' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ background: '#090d16', padding: '1px 5px', borderRadius: '3px', border: '1px solid #1e293b' }}>↵</kbd> select</span>
          <span><kbd style={{ background: '#090d16', padding: '1px 5px', borderRadius: '3px', border: '1px solid #1e293b' }}>ESC</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
