import React from 'react';
import Badge from './Badge';
import ProgressBar from './ProgressBar';
import { COLORS } from '../lib/constants';

export default function PatternCard({ pattern, onPress }) {
  return (
    <div
      onClick={onPress}
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
      }}
    >
      {pattern.imagen_url ? (
        <img
          src={pattern.imagen_url}
          alt={pattern.nombre}
          style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          height: 90, backgroundColor: pattern.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>
          {pattern.emoji}
        </div>
      )}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontWeight: 800, fontSize: 14, color: COLORS.textPrimary,
          marginBottom: 6, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {pattern.nombre}
        </div>
        <Badge text={pattern.estado} />
        <ProgressBar steps={pattern.pasos} />
      </div>
    </div>
  );
}
