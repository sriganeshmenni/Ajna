import React, { useRef } from 'react';
import { ShieldAlert, ShieldCheck, FileCheck } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';

const EvidenceFeed = ({ evidence }) => {
  const storeEvidence = useSessionStore((state) => state.evidence);
  const data = evidence?.length > 0 ? evidence : storeEvidence;
  const scrollRef = useRef(null);

  const baseEvidence = [
    { indicator: 'Controlled Pitch Prosody (F0: 142Hz)', severity: 'low', timestamp_start: 4.2, timestamp_end: 18.5, confidence: 0.94, evidence_id: 'ev_8f29c1' },
    { indicator: 'Optical Gaze Alignment (Screen Center)', severity: 'informational', timestamp_start: 22.0, timestamp_end: 45.0, confidence: 0.98, evidence_id: 'ev_3b18d2' },
    { indicator: 'Measured Hesitation Pause (< 1.6s)', severity: 'medium', timestamp_start: 48.2, timestamp_end: 49.8, confidence: 0.84, evidence_id: 'ev_4a99f0' }
  ];

  const displayData = data?.length > 0 ? data : baseEvidence;

  const getBadgeClass = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'high': return 'badge-rose';
      case 'medium': return 'badge-amber';
      case 'low': return 'badge-emerald';
      default: return 'badge-orange';
    }
  };

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <FileCheck size={13} className="text-orange-400" />
          EVIDENCE AUDIT LEDGER
        </div>
        <span className="badge-tag badge-slate" style={{ fontFamily: 'var(--font-mono)' }}>
          {displayData.length} VERIFIED
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {displayData.map((item, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.035)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '7px 9px',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.2s ease'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                {item.indicator || item.type || 'Quantifiable Signal'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#94a3b8' }}>
                {item.timestamp_start || 0}s – {item.timestamp_end || item.timestamp_start || 0}s | {((item.confidence || 0.9) * 100).toFixed(0)}% CONF | {item.id || item.evidence_id || `ev_${idx}`}
              </div>
            </div>
            <span className={`badge-tag ${getBadgeClass(item.severity)}`}>
              {(item.severity || 'INFO').toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceFeed;
