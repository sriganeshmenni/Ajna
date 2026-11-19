import React, { useEffect, useRef } from 'react';
import { Camera, Eye, Compass, Crosshair, Sparkles } from 'lucide-react';

const PerceptionSurface = ({
  videoRef,
  isCapturing,
  isSimulated,
  visionTelemetry,
  hudOverlays,
  onToggleOverlay
}) => {
  const canvasRef = useRef(null);

  const fps = visionTelemetry?.fps ?? (isCapturing ? 30 : '--');
  const latency = visionTelemetry?.latency_ms ?? (isCapturing ? 12 : '--');
  const faceCount = visionTelemetry?.face_count ?? (isCapturing ? 1 : 0);
  const faceProb = visionTelemetry?.face_presence_probability ?? (isCapturing ? 0.98 : 0);
  const trkConf = visionTelemetry?.tracking_confidence ?? (isCapturing ? 0.94 : 0);
  const { yaw = 1.2, pitch = -0.5, roll = 0.2 } = visionTelemetry?.head_orientation || {};
  const gazeDev = visionTelemetry?.gaze_deviation_angle ?? (isCapturing ? 3.4 : 0);

  const fmt = (val, decimals = 1) => typeof val === 'number' ? val.toFixed(decimals) : '--';

  // 3D Wireframe Gimbal & Face Mesh Canvas HUD Loop
  useEffect(() => {
    if (!isCapturing || !canvasRef.current) return;

    let animationFrameId;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameCount = 0;

    const render = () => {
      frameCount++;
      const { clientWidth, clientHeight } = canvas;
      if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
        canvas.width = clientWidth;
        canvas.height = clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      if (isCapturing) {
        const boxWidth = Math.min(width * 0.44, 340);
        const boxHeight = boxWidth * 1.34;
        const boxX = cx - boxWidth / 2 + Math.sin(frameCount / 45) * 3;
        const boxY = cy - boxHeight / 2 + Math.cos(frameCount / 35) * 3;

        // 1. Face Bounding Box with Liquid Neon Accent
        if (hudOverlays?.boundingBox !== false) {
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

          // Glowing Corner Brackets
          const cLen = 20;
          ctx.strokeStyle = '#f97316';
          ctx.shadowColor = 'rgba(249, 115, 22, 0.7)';
          ctx.shadowBlur = 8;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          // Top-Left
          ctx.moveTo(boxX, boxY + cLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + cLen, boxY);
          // Top-Right
          ctx.moveTo(boxX + boxWidth - cLen, boxY); ctx.lineTo(boxX + boxWidth, boxY); ctx.lineTo(boxX + boxWidth, boxY + cLen);
          // Bottom-Left
          ctx.moveTo(boxX, boxY + boxHeight - cLen); ctx.lineTo(boxX, boxY + boxHeight); ctx.lineTo(boxX + cLen, boxY + boxHeight);
          // Bottom-Right
          ctx.moveTo(boxX + boxWidth - cLen, boxY + boxHeight); ctx.lineTo(boxX + boxWidth, boxY + boxHeight); ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cLen);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Identity Pill
          ctx.fillStyle = '#f97316';
          ctx.font = '700 11px Inter, sans-serif';
          ctx.fillText(`CANDIDATE #01 — ${(faceProb * 100).toFixed(0)}% OBSERVED`, boxX + 4, boxY - 8);
        }

        // 2. 3D Face Wireframe Mesh with Optical Depth Dots
        if (hudOverlays?.landmarks !== false) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
          const cols = 8;
          const rows = 10;
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              const px = boxX + (boxWidth / cols) * (i + 0.5);
              const py = boxY + (boxHeight / rows) * (j + 0.5);
              const nx = (px - (boxX + boxWidth / 2)) / (boxWidth / 2);
              const ny = (py - (boxY + boxHeight / 2)) / (boxHeight / 2);
              if (nx * nx + ny * ny < 0.88) {
                const zDepth = Math.sqrt(Math.max(0, 1 - (nx * nx + ny * ny)));
                ctx.beginPath();
                ctx.arc(px + (yaw * 0.4) * zDepth, py + (pitch * 0.4) * zDepth, 1.6 * zDepth, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        // 3. 3D Head-Pose Gimbal Gizmo (Upper Right of Box)
        if (hudOverlays?.pose !== false) {
          const gx = boxX + boxWidth - 36;
          const gy = boxY + 36;
          const gLen = 28;

          // Yaw (X-axis red)
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + gLen * Math.cos(yaw * Math.PI / 180), gy + gLen * Math.sin(roll * Math.PI / 180));
          ctx.stroke();

          // Pitch (Y-axis green)
          ctx.strokeStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx, gy - gLen * Math.cos(pitch * Math.PI / 180));
          ctx.stroke();

          // Roll (Z-axis blue)
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(gx, gy, 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 4. Optical Axis Gaze Vector
        if (hudOverlays?.gaze !== false) {
          const eyeY = boxY + boxHeight * 0.35;
          ctx.strokeStyle = '#10b981';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.8)';
          ctx.shadowBlur = 6;
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, eyeY);
          ctx.lineTo(cx + (gazeDev * 2.2), eyeY - 45);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCapturing, hudOverlays, faceProb, yaw, pitch, roll, gazeDev]);

  return (
    <div className="panel-card water-bubble-panel" style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Top Floating Glass HUD Header */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '12px',
        right: '12px',
        zIndex: 20,
        padding: '8px 14px',
        borderRadius: '10px',
        background: 'rgba(18, 14, 28, 0.45)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={isCapturing ? "pulse-green-dot" : "pulse-gray-dot"}></span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
            PERCEPTION HUD
          </span>
          <span className="badge-tag badge-orange">{fps} FPS</span>
          <span className="badge-tag badge-slate">{latency}ms</span>
          {isSimulated && <span className="badge-tag badge-amber">SIMULATED</span>}
        </div>

        {/* HUD Overlay Filters */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {[
            { id: 'landmarks', label: '3D MESH' },
            { id: 'pose', label: 'GIMBAL' },
            { id: 'gaze', label: 'GAZE' },
            { id: 'boundingBox', label: 'BBOX' }
          ].map((ov) => {
            const isActive = hudOverlays?.[ov.id] !== false;
            return (
              <button
                key={ov.id}
                onClick={() => onToggleOverlay?.(ov.id)}
                style={{
                  border: `1px solid ${isActive ? 'rgba(249, 115, 22, 0.6)' : 'rgba(255, 255, 255, 0.08)'}`,
                  background: isActive ? 'rgba(249, 115, 22, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#fdba74' : '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '9px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {ov.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isCapturing ? 1 : 0.08,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Canvas HUD Mesh */}
      {isCapturing && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}

      {/* Standby State */}
      {!isCapturing && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15,
          background: 'radial-gradient(circle at center, rgba(30, 20, 48, 0.55) 0%, rgba(10, 8, 18, 0.82) 100%)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.25), rgba(234, 88, 12, 0.08))',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            boxShadow: '0 8px 30px rgba(249, 115, 22, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
            color: '#fb923c'
          }}>
            <Camera size={26} />
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
            PERCEPTION STREAM STANDBY
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '320px', textAlign: 'center', lineHeight: 1.5 }}>
            Webcam & audio capture pipeline awaiting session trigger. Click <strong style={{ color: '#fb923c' }}>START EVALUATION</strong> above.
          </div>
        </div>
      )}

      {/* Bottom Floating Telemetry Strip */}
      {isCapturing && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          right: '12px',
          zIndex: 20,
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(18, 14, 28, 0.45)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: '#cbd5e1',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={13} className="text-orange-400" />
            <span>YAW: <strong style={{ color: '#fb923c' }}>{fmt(yaw)}°</strong></span>
            <span style={{ color: '#475569' }}>|</span>
            <span>PITCH: <strong style={{ color: '#fb923c' }}>{fmt(pitch)}°</strong></span>
            <span style={{ color: '#475569' }}>|</span>
            <span>ROLL: <strong style={{ color: '#fb923c' }}>{fmt(roll)}°</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={13} className="text-emerald-400" />
            <span>GAZE: <strong style={{ color: '#34d399' }}>{fmt(gazeDev)}°</strong></span>
            <span style={{ color: '#475569' }}>|</span>
            <span>CONF: <strong style={{ color: '#34d399' }}>{fmt(faceProb, 2)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerceptionSurface;
