import React from 'react';
import { BrainCircuit, Activity } from 'lucide-react';

export default function StateEstimationInstrument({ stateTelemetry }) {
  const safeTelemetry = stateTelemetry || {};

  const {
    dominant_state = 'steady',
    dominant_confidence = 0.92,
    state_entropy = 0.142,
    states = { steady: 0.88, hesitant: 0.08, rushed: 0.02, disengaged: 0.01, absent: 0.01 }
  } = safeTelemetry;

  const stateColors = {
    steady: '#10b981',
    hesitant: '#f59e0b',
    rushed: '#3b82f6',
    disengaged: '#64748b',
    absent: '#ef4444'
  };

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <BrainCircuit size={13} className="text-orange-400" />
          BEHAVIORAL HMM
        </div>
        <span className="badge-tag badge-emerald" style={{ border: `1px solid ${stateColors[dominant_state]}` }}>
          {dominant_state.toUpperCase()}
        </span>
      </div>

      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> POSTERIOR PROBABILITY
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc', fontWeight: 800 }}>
            {(dominant_confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* State Probability Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {['steady', 'hesitant', 'rushed', 'disengaged', 'absent'].map((st) => {
            const val = states[st] || 0;
            const isDominant = st === dominant_state;
            return (
              <div key={st} style={{
                background: isDominant ? 'rgba(249, 115, 22, 0.16)' : 'rgba(255, 255, 255, 0.035)',
                border: `1px solid ${isDominant ? 'rgba(249, 115, 22, 0.45)' : 'rgba(255, 255, 255, 0.07)'}`,
                padding: '5px 8px',
                borderRadius: '7px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, color: isDominant ? '#f8fafc' : '#94a3b8', textTransform: 'uppercase' }}>
                    {st}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: stateColors[st], fontWeight: 800 }}>
                    {(val * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${val * 100}%`,
                    height: '100%',
                    backgroundColor: stateColors[st],
                    boxShadow: isDominant ? `0 0 8px ${stateColors[st]}` : 'none',
                    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 'auto',
          padding: '6px 8px',
          background: 'rgba(255, 255, 255, 0.035)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '7px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          color: '#94a3b8'
        }}>
          <span>SHANNON ENTROPY H(S)</span>
          <span style={{ color: '#fb923c', fontWeight: 700 }}>{state_entropy.toFixed(3)} bits</span>
        </div>
      </div>
    </div>
  );
}
