import React from 'react';
import { TIPOS_EVENTO } from '../lib/constants';
import { COLORS, Z_INDEX, ANIMATION } from '../lib/constants';

export default function CanalSelectorModal({ visible, channels, activeChannel, onSelect, onNew, onClose }) {
  if (!visible) return null;

  const tipoIcon = (c) => TIPOS_EVENTO.find(t => t.id === c.tipo || t.id === c.tipo_canal)?.emoji || '🏪';
  const tipoLabel = (c) => TIPOS_EVENTO.find(t => t.id === c.tipo || t.id === c.tipo_canal)?.label || c.tipo || 'Canal';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%', maxHeight: '85vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 32px',
        animation: ANIMATION.slideUp,
      }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>🏪 Seleccionar canal</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>Elige dónde vendes hoy</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {channels.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: COLORS.textMuted }}>
              <div style={{ fontSize: 40 }}>🏪</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8 }}>Aún no hay canales de venta</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Crea el primero con el botón de abajo</div>
            </div>
          )}
          {channels.map(c => {
            const isActive = activeChannel?.id === c.id;
            return (
              <button key={c.id} onClick={() => onSelect(c)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 14,
                border: `1.5px solid ${isActive ? '#1A1A2E' : '#E5E7EB'}`,
                backgroundColor: isActive ? '#1A1A2E' : '#fff',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%',
              }}>
                <span style={{ fontSize: 24 }}>{tipoIcon(c)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: 14, color: isActive ? '#FAD2E1' : COLORS.textPrimary }}>
                    {c.nombre}
                  </span>
                  <span style={{ display: 'block', fontSize: 11, color: isActive ? '#9CA3AF' : COLORS.textMuted }}>
                    {tipoLabel(c)}
                  </span>
                </span>
                {isActive && <span style={{ fontSize: 13, color: '#25D366', fontWeight: 900 }}>✓ Activo</span>}
              </button>
            );
          })}

          <button onClick={onNew} style={{
            width: '100%', padding: '13px 0', borderRadius: 14,
            backgroundColor: '#F9FAFB', border: '1.5px dashed #9CA3AF',
            fontWeight: 800, fontSize: 14, color: COLORS.textSecondary,
            cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
          }}>+ Nuevo canal</button>
        </div>
      </div>
    </div>
  );
}