import React, { useEffect, useRef } from 'react';
import { Network } from 'lucide-react';

export default function FusionRadar({ fusionWeights }) {
  const canvasRef = useRef(null);

  const safeWeights = fusionWeights || {};

  const {
    vision = 0.35,
    audio = 0.30,
    speech = 0.20,
    nlp = 0.15
  } = safeWeights;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(cx, cy) - 22;

      ctx.clearRect(0, 0, width, height);

      // Grid Axes & Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      [0.33, 0.66, 1.0].forEach(scale => {
        const r = radius * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Axis Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 8.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIGLIP2', cx, cy - radius - 5);
      ctx.fillText('WHISPER', cx, cy + radius + 11);
      ctx.textAlign = 'left';
      ctx.fillText('EMO2VEC', cx + radius + 4, cy + 3);
      ctx.textAlign = 'right';
      ctx.fillText('MISTRAL', cx - radius - 4, cy + 3);

      // Radar Fill Polygon
      const vR = radius * vision;
      const aR = radius * audio;
      const sR = radius * speech;
      const nR = radius * nlp;

      ctx.beginPath();
      ctx.moveTo(cx, cy - vR);
      ctx.lineTo(cx + aR, cy);
      ctx.lineTo(cx, cy + sR);
      ctx.lineTo(cx - nR, cy);
      ctx.closePath();

      ctx.fillStyle = 'rgba(249, 115, 22, 0.28)';
      ctx.fill();
      ctx.strokeStyle = '#f97316';
      ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();
  }, [vision, audio, speech, nlp]);

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Network size={12} className="text-orange-400" /> MSCMLP 365 FUSION
      </div>
      <canvas ref={canvasRef} width={150} height={135} style={{ width: '150px', height: '135px' }} />
      <div style={{ display: 'flex', gap: '8px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#cbd5e1', marginTop: '2px' }}>
        <span>VIS: {(vision * 100).toFixed(0)}%</span>
        <span>AUD: {(audio * 100).toFixed(0)}%</span>
        <span>ASR: {(speech * 100).toFixed(0)}%</span>
        <span>NLP: {(nlp * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
