import React from 'react';
import { BADGE_COLORS, COLORS } from '../lib/constants';

export default function Badge({ text }) {
  const c = BADGE_COLORS[text] || { bg: COLORS.surface2, fg: COLORS.textSecondary, border: COLORS.border };
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.fg,
      border: c.border ? `1px solid ${c.border}` : 'none',
      borderRadius: 99,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 700,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
}
