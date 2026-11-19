import React, { useEffect, useRef } from 'react';
import { Mic, Waves, Activity, Volume2 } from 'lucide-react';

export default function AudioInstrument({ audioLevel = 0, audioTelemetry }) {
  const waveformCanvasRef = useRef(null);
  const spectrumCanvasRef = useRef(null);
  const animRef = useRef(null);

  const safeTelemetry = audioTelemetry || {};

  const {
    is_speech = false,
    f0_hz = 142.5,
    rms_energy = 0.04,
    lufs = -21.4,
    snr_db = 24.8,
    hnr_db = 18.2,
    jitter = 0.012,
    shimmer = 0.024,
    zcr = 0.14,
    speaking_rate_wpm = 148
  } = safeTelemetry;

  useEffect(() => {
    const wCanvas = waveformCanvasRef.current;
    const sCanvas = spectrumCanvasRef.current;
    if (!wCanvas || !sCanvas) return;

    const wCtx = wCanvas.getContext('2d');
    const sCtx = sCanvas.getContext('2d');
    let phase = 0;

    const draw = () => {
      // Waveform Canvas
      const wWidth = wCanvas.width;
      const wHeight = wCanvas.height;
      wCtx.clearRect(0, 0, wWidth, wHeight);

      // Baseline
      wCtx.beginPath();
      wCtx.moveTo(0, wHeight / 2);
      wCtx.lineTo(wWidth, wHeight / 2);
      wCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      wCtx.lineWidth = 1;
      wCtx.stroke();

      const effLevel = Math.max(audioLevel, 0.1);
      const amplitude = is_speech ? (effLevel * wHeight * 0.42) + 6 : (effLevel * wHeight * 0.18) + 2;
      const frequency = is_speech ? 0.055 : 0.028;

      wCtx.beginPath();
      wCtx.moveTo(0, wHeight / 2);
      for (let x = 0; x < wWidth; x++) {
        const y = Math.sin(x * frequency + phase) * amplitude;
        wCtx.lineTo(x, wHeight / 2 + y);
      }
      wCtx.strokeStyle = is_speech ? '#10b981' : '#f97316';
      wCtx.lineWidth = 2;
      wCtx.shadowColor = is_speech ? 'rgba(16, 185, 129, 0.6)' : 'rgba(249, 115, 22, 0.4)';
      wCtx.shadowBlur = 6;
      wCtx.stroke();
      wCtx.shadowBlur = 0;

      // Spectrum Bars
      const sWidth = sCanvas.width;
      const sHeight = sCanvas.height;
      sCtx.clearRect(0, 0, sWidth, sHeight);

      const bars = 24;
      const barWidth = sWidth / bars;
      for (let i = 0; i < bars; i++) {
        const factor = Math.sin(i * 0.3 + phase) * 0.4 + 0.6;
        const h = Math.min(sHeight, effLevel * sHeight * factor * 1.5 + 4);

        const gradient = sCtx.createLinearGradient(0, sHeight, 0, 0);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#34d399');

        sCtx.fillStyle = gradient;
        sCtx.fillRect(i * barWidth + 1, sHeight - h, barWidth - 2, h);
      }

      phase += 0.08;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [audioLevel, is_speech]);

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Mic size={13} className="text-orange-400" />
          ACOUSTIC PROSODY
        </div>
        <span className={`badge-tag ${is_speech ? 'badge-emerald' : 'badge-slate'}`}>
          {is_speech ? 'SPEECH ACTIVE' : 'VAD FLOOR'}
        </span>
      </div>

      <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Waveform Box */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.035)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '8px', 
          padding: '7px 8px' 
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Waves size={10} /> PCM WAVEFORM (16kHz)
          </div>
          <canvas ref={waveformCanvasRef} width={280} height={55} style={{ width: '100%', height: '55px' }} />
        </div>

        {/* Spectrum Box */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.035)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: '8px', 
          padding: '7px 8px' 
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Volume2 size={10} /> SPECTRAL DYNAMICS & VAD
          </div>
          <canvas ref={spectrumCanvasRef} width={280} height={36} style={{ width: '100%', height: '36px' }} />
        </div>

        {/* Acoustic Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.035)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b' }}>F0 FUNDAMENTAL</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fb923c', fontFamily: 'var(--font-mono)' }}>
              {f0_hz.toFixed(1)} <span style={{ fontSize: '10px', fontWeight: 500 }}>Hz</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.035)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b' }}>LUFS LOUDNESS</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
              {lufs.toFixed(1)} <span style={{ fontSize: '10px', fontWeight: 500 }}>dB</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.035)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b' }}>HNR HARMONICS</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {hnr_db.toFixed(1)} <span style={{ fontSize: '10px', fontWeight: 500 }}>dB</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.035)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px 8px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748b' }}>SPEAKING RATE</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {speaking_rate_wpm} <span style={{ fontSize: '10px', fontWeight: 500 }}>WPM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
