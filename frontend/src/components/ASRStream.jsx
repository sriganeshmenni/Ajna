import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MessageSquare, Copy, Check, Radio } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';

const FILLER_WORDS = new Set([
  'um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of', 'i mean'
]);

const ASRStream = ({ transcription }) => {
  const storeTranscription = useSessionStore((state) => state.transcription);
  const audioTelemetry = useSessionStore((state) => state.audioTelemetry);
  const metrics = useSessionStore((state) => state.metrics);
  const scrollRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const segments = transcription?.length > 0 ? transcription : storeTranscription;
  const isSpeechActive = Boolean(audioTelemetry?.is_speech || metrics?.speechActive);
  const currentWpm = Math.round(audioTelemetry?.speaking_rate_wpm || metrics?.speakingRate || 0);

  // Auto-scroll to bottom on new segment
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments]);

  // Aggregate metrics
  const { totalWords, fillerCount, avgConfidence } = useMemo(() => {
    let words = 0;
    let fillers = 0;
    let confSum = 0;
    let confCount = 0;

    segments.forEach((seg) => {
      if (seg.words && seg.words.length > 0) {
        seg.words.forEach((w) => {
          words++;
          const wordText = (typeof w === 'string' ? w : w.word || '').toLowerCase().replace(/[.,!?;:"]/g, '');
          const isFiller = w.is_filler || FILLER_WORDS.has(wordText);
          if (isFiller) fillers++;
          if (w.confidence !== undefined) {
            confSum += w.confidence;
            confCount++;
          }
        });
      } else if (seg.text) {
        const textWords = seg.text.split(/\s+/).filter(Boolean);
        words += textWords.length;
        textWords.forEach((tw) => {
          const clean = tw.toLowerCase().replace(/[.,!?;:"]/g, '');
          if (FILLER_WORDS.has(clean)) fillers++;
        });
      }
    });

    return {
      totalWords: words,
      fillerCount: fillers,
      avgConfidence: confCount > 0 ? Math.round((confSum / confCount) * 100) : 92,
    };
  }, [segments]);

  const handleCopyTranscript = () => {
    if (!segments.length) return;
    const fullText = segments
      .map((s) => `[${s.speaker || 'CANDIDATE'}] ${s.text || ''}`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatTimestamp = (sec) => {
    if (sec === undefined || sec === null) return 'LIVE';
    if (typeof sec === 'string') return sec;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title">
          <MessageSquare size={13} className="text-orange-400" />
          <span>REAL-TIME ASR STREAM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-tag badge-slate" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
            WHISPER TINY.EN INT8
          </span>
          <span className={`badge-tag ${isSpeechActive ? 'badge-emerald' : 'badge-slate'}`}>
            {isSpeechActive ? 'SPEECH ACTIVE' : 'AWAITING SPEECH'}
          </span>
        </div>
      </div>

      {/* Cadence & Telemetry Strip */}
      <div style={{
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.025)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        fontFamily: 'var(--font-mono)',
        color: '#94a3b8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <span style={{ color: '#64748b' }}>CADENCE: </span>
            <span style={{
              fontWeight: 700,
              color: currentWpm >= 120 && currentWpm <= 165 ? '#10b981' : currentWpm > 165 ? '#3b82f6' : currentWpm > 0 ? '#f59e0b' : '#64748b'
            }}>
              {currentWpm > 0 ? `${currentWpm} WPM` : '-- WPM'}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>WORDS: </span>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{totalWords}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>SEGMENTS: </span>
            <span style={{ color: '#f8fafc', fontWeight: 600 }}>{segments.length}</span>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>FILLERS: </span>
            <span style={{ color: fillerCount > 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
              {fillerCount}
            </span>
          </div>
          {avgConfidence > 0 && segments.length > 0 && (
            <div>
              <span style={{ color: '#64748b' }}>AVG CONF: </span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{avgConfidence}%</span>
            </div>
          )}
        </div>

        {segments.length > 0 && (
          <button
            onClick={handleCopyTranscript}
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '9px',
              color: copied ? '#10b981' : '#cbd5e1',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {copied ? '✓ COPIED' : 'COPY'}
          </button>
        )}
      </div>

      {/* Transcript Stream Body */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {segments.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            textAlign: 'center',
            padding: '20px 10px',
            gap: '8px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb923c',
              fontSize: '16px'
            }}>
              🎙
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
              Awaiting candidate vocal response...
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', maxWidth: '280px', lineHeight: 1.4 }}>
              Microphone is streaming PCM audio. Spoken words will transcribe in real-time with confidence scoring and disfluency highlights.
            </div>
          </div>
        ) : (
          segments.map((seg, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                lineHeight: 1.6,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Segment Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                paddingBottom: '3px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fb923c', fontFamily: 'var(--font-mono)' }}>
                    [{seg.speaker || 'CANDIDATE'}]
                  </span>
                  {seg.start !== undefined && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748b' }}>
                      {formatTimestamp(seg.start)} {seg.end ? `→ ${formatTimestamp(seg.end)}` : ''}
                    </span>
                  )}
                </div>
                {seg.wpm > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '1px 5px',
                    borderRadius: '3px'
                  }}>
                    {Math.round(seg.wpm)} WPM
                  </span>
                )}
              </div>

              {/* Segment Text with Word-Level Confidence & Filler Tagging */}
              <div style={{ color: '#e2e8f0', wordBreak: 'break-word' }}>
                {seg.words && seg.words.length > 0 ? (
                  seg.words.map((w, wIdx) => {
                    const rawWord = typeof w === 'string' ? w : w.word || '';
                    const cleanWord = rawWord.toLowerCase().replace(/[.,!?;:"]/g, '');
                    const isFiller = w.is_filler || FILLER_WORDS.has(cleanWord);
                    const conf = w.confidence !== undefined ? w.confidence : 0.92;

                    if (isFiller) {
                      return (
                        <React.Fragment key={wIdx}>
                          <span className="word-filler" title="Disfluency: Filler Word">
                            {rawWord}
                          </span>{' '}
                        </React.Fragment>
                      );
                    }

                    let confClass = 'word-high';
                    if (conf < 0.65) {
                      confClass = 'word-low';
                    } else if (conf < 0.85) {
                      confClass = 'word-mid';
                    }

                    return (
                      <React.Fragment key={wIdx}>
                        <span
                          className={confClass}
                          title={`Confidence: ${Math.round(conf * 100)}%`}
                        >
                          {rawWord}
                        </span>{' '}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <span>{seg.text}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ASRStream;
