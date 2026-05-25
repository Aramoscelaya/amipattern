import React from 'react';
import { BADGE_COLORS } from '../lib/constants';

export default function Badge({ text }) {
  const c = BADGE_COLORS[text] || { bg: '#F3F4F6', fg: '#374151' };
  return (
    <span style={{
      backgroundColor: c.bg,
      color: c.fg,
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
