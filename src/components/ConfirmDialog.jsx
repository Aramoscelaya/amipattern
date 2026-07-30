import React, { useEffect } from 'react';
import { Z_INDEX } from '../lib/constants';

export default function ConfirmDialog({ visible, title, message, onConfirm, onCancel, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', confirmColor = '#EF4444' }) {
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, onConfirm, onCancel]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: Z_INDEX.confirmDialog,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 20, padding: 24,
        maxWidth: 320, width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{title}</div>
        <div style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: 12, borderRadius: 12,
            border: '2px solid #E5E7EB', background: 'transparent',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: 12, borderRadius: 12,
            background: confirmColor, border: 'none',
            color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
