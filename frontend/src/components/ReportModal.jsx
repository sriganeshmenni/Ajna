import React, { useState } from 'react';

const ReportModal = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!report) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content water-bubble-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: '#111827',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff'
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                AJNA EVALUATION DOSSIER — {report.session_id || 'sess_demo'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                MODE: {(report.mode || 'interview').toUpperCase()} | DURATION: {report.duration_seconds || 300}s
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderBottom: '1px solid #1e293b', background: '#090d16' }}>
          {['summary', 'technical', 'integrity'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: activeTab === t ? '#f97316' : 'transparent',
                color: activeTab === t ? '#ffffff' : '#94a3b8',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Overall Score Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            padding: '16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase' }}>
                OVERALL EVALUATION SCORE
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                {Math.round((report.overall_score || 0.89) * 100)} / 100
              </div>
            </div>
            <span className="badge-tag badge-emerald" style={{ fontSize: '12px', padding: '6px 12px' }}>
              RECOMMENDED / HIGH CONFIDENCE
            </span>
          </div>

          {/* Feedback Section */}
          <div style={{ background: '#090d16', border: '1px solid #1e293b', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              AJNA MULTIMODAL EVALUATION SUMMARY
            </div>
            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
              {report.llm_feedback?.summary || 'Demonstrated strong architectural understanding, steady gaze stability, and articulate verbal pacing throughout the evaluation.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
