import React, { useEffect, useRef } from 'react';
import { Clock, Sliders } from 'lucide-react';
import useSessionStore from '../stores/sessionStore';

const TemporalTimeline = ({ events, duration, isActive }) => {
  const storeEvents = useSessionStore((state) => state.events);
  const dataEvents = events?.length > 0 ? events : storeEvents;
  const sessionDuration = duration || 300;
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 20);
        ctx.stroke();
      }

      // Time axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, height - 20);
      ctx.lineTo(width, height - 20);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px var(--font-mono)';
      ctx.textAlign = 'center';
      const step = sessionDuration / 6;
      for (let s = 0; s <= sessionDuration; s += step) {
        const x = (s / sessionDuration) * width;
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        ctx.fillText(`${m}:${sec.toString().padStart(2, '0')}`, x, height - 4);
      }

      // Progress Wave Line with glowing depth
      ctx.beginPath();
      ctx.moveTo(0, height / 2 - 10);
      for (let x = 0; x < width; x += 5) {
        const y = height / 2 - 10 + Math.sin(x * 0.05) * 8;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#f97316';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.5)';
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    render();
  }, [dataEvents, sessionDuration, isActive]);

  const fmtMin = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <div className="panel-title">
          <Clock size={13} className="text-orange-400" />
          TEMPORAL FUSION SCRUBBER
        </div>
        <span className="badge-tag badge-slate" style={{ fontFamily: 'var(--font-mono)' }}>
          {fmtMin(sessionDuration)} DURATION
        </span>
      </div>
      <div style={{ flex: 1, padding: '4px 12px' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '55px', display: 'block' }} />
      </div>
    </div>
  );
};

export default TemporalTimeline;
