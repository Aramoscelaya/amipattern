import React from 'react';
import { COLORS } from '../lib/constants';

export default function ProgressBar({ steps }) {
  if (!steps || steps.length === 0) return null;
  const done = steps.filter(s => s.hecho).length;
  const pct  = Math.round((done / steps.length) * 100);
  const color = pct === 100 ? COLORS.teal : COLORS.orange;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        height: 5, backgroundColor: '#F3F4F6',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          backgroundColor: color, borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700, marginTop: 3, display: 'block' }}>
        {pct}% completado
      </span>
    </div>
  );
}
