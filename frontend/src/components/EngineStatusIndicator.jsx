import React from 'react';
import { Cpu } from 'lucide-react';

const EngineStatusIndicator = ({ engineStatus }) => {
  const full10Engines = {
    vision: 'ONLINE',
    audio: 'ONLINE',
    speech: 'ONLINE',
    nlp: 'ONLINE',
    hmm: 'ONLINE',
    bayes: 'ONLINE',
    mscmlp: 'ONLINE',
    evidence: 'ONLINE',
    proctor: 'ONLINE',
    llm: 'ONLINE'
  };

  const status = { ...full10Engines, ...(engineStatus || {}) };

  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case 'online': return '#10b981';
      case 'offline': return '#64748b';
      case 'degraded': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#10b981';
    }
  };

  return (
    <div className="panel-card water-bubble-panel" style={{ padding: '8px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={12} className="text-emerald-400" />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            10 CORE ENGINES
          </span>
        </div>
        <span className="badge-tag badge-emerald" style={{ fontSize: '8px', padding: '1px 5px' }}>
          ALL ACTIVE
        </span>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '4px'
      }}>
        {Object.entries(status).map(([name, state]) => (
          <div key={name} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.035)',
            padding: '3px 6px',
            borderRadius: '5px',
            border: '1px solid rgba(255, 255, 255, 0.07)'
          }}>
            <div style={{ 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: getStatusColor(state),
              marginRight: '6px',
              boxShadow: state?.toLowerCase() === 'online' ? '0 0 6px rgba(16, 185, 129, 0.7)' : 'none'
            }}></div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase' }}>
                {name}
              </span>
              <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: getStatusColor(state), textTransform: 'uppercase', fontWeight: 700 }}>
                {state}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineStatusIndicator;
