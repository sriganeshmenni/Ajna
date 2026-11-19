import React from 'react';

export default function AjnaAmbientBackground() {
  return (
    <div className="ajna-ambient-bg" aria-hidden="true">
      {/* 1. Slow-Drifting Radial Aurora Glow Orbs */}
      <div className="ajna-aurora-orb ajna-aurora-teal" />
      <div className="ajna-aurora-orb ajna-aurora-violet" />
      <div className="ajna-aurora-orb ajna-aurora-center" />

      {/* 2. Giant Watermark Background Typography (Behind Cards) */}
      <div className="ajna-watermark-wrapper">
        <div className="ajna-watermark-title">AJNA</div>
      </div>

      {/* 3. Floating 3D Liquid Water Bubble Spheres (Refracting Watermark) */}
      <div className="ajna-water-bubble ajna-bubble-1" />
      <div className="ajna-water-bubble ajna-bubble-2" />
      <div className="ajna-water-bubble ajna-bubble-3" />
      <div className="ajna-water-bubble ajna-bubble-4" />
    </div>
  );
}
