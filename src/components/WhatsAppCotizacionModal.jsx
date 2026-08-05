import React, { useState, useEffect } from 'react';
import { COLORS, Z_INDEX, ANIMATION } from '../lib/constants';
import { buildWhatsAppLink, mensajeCotizacion } from '../lib/whatsapp';
import { StyledInput, StyledLabel, StyledTextarea } from './FormFields';

export default function WhatsAppCotizacionModal({ visible, initial = {}, telefono = '', onClose }) {
  const [f, setF] = useState({ nombre: '', emoji: '🧶', precio: '', tiempoEntrega: '', mensajeExtra: '', telefono: '' });
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (visible) {
      setF({
        nombre: initial.nombre || '',
        emoji: initial.emoji || '🧶',
        precio: initial.precio ?? '',
        tiempoEntrega: initial.tiempoEntrega || '',
        mensajeExtra: '',
        telefono: telefono || '',
      });
      setErr(false);
    }
  }, [visible, initial, telefono]);

  if (!visible) return null;

  const upd = (k, v) => setF(x => ({ ...x, [k]: v }));
  const telManual = !telefono;

  const handleOpen = () => {
    if (!f.tiempoEntrega.trim()) { setErr(true); return; }
    if (telManual && f.telefono.replace(/\D/g, '').length < 10) { setErr(true); return; }
    const mensaje = mensajeCotizacion({
      nombre: f.nombre,
      emoji: f.emoji,
      precio: f.precio,
      tiempoEntrega: f.tiempoEntrega.trim(),
      mensajeExtra: f.mensajeExtra.trim(),
    });
    window.open(buildWhatsAppLink(f.telefono, mensaje), '_blank');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: Z_INDEX.modal,
      backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        backgroundColor: '#fff', borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 640, maxHeight: '95vh',
        display: 'flex', flexDirection: 'column',
        animation: ANIMATION.slideUp,
      }}>

        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%)',
          padding: '18px 20px 14px', borderRadius: '24px 24px 0 0',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 26 }}>💬</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#fff' }}>Cotización por WhatsApp</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Ajusta los datos antes de enviar</div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
            width: 34, height: 34, cursor: 'pointer', fontSize: 18, color: '#fff',
          }}>×</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 24px' }}>
          <StyledLabel>📱 Teléfono</StyledLabel>
          {telManual ? (
            <StyledInput value={f.telefono} onChange={e => { upd('telefono', e.target.value); setErr(false); }}
              placeholder="Ej: 55 1234 5678" type="tel" inputMode="tel"
              style={{ marginBottom: 12, borderColor: err && f.telefono.replace(/\D/g, '').length < 10 ? '#EF4444' : undefined }} />
          ) : (
            <div style={{
              marginBottom: 12, padding: '10px 12px', borderRadius: 10,
              backgroundColor: '#F3F4F6', fontSize: 14, fontWeight: 700,
              color: COLORS.textPrimary, border: '1.5px solid #E5E7EB',
            }}>📱 {f.telefono} <span style={{ color: '#9CA3AF', fontWeight: 600, fontSize: 11 }}>(del pedido)</span></div>
          )}

          <StyledLabel>🧶 Nombre del producto</StyledLabel>
          <StyledInput value={f.nombre} onChange={e => upd('nombre', e.target.value)}
            placeholder="Nombre del amigurumi" style={{ marginBottom: 12, fontWeight: 700 }} />

          <StyledLabel>✨ Emoji</StyledLabel>
          <StyledInput value={f.emoji} onChange={e => upd('emoji', e.target.value)}
            placeholder="🧶" style={{ marginBottom: 12 }} />

          <StyledLabel>💰 Precio (MXN)</StyledLabel>
          <StyledInput value={f.precio} onChange={e => upd('precio', e.target.value)}
            placeholder="ej: 450" inputMode="decimal" style={{ marginBottom: 12 }} />

          <StyledLabel>⏱️ Tiempo de entrega</StyledLabel>
          <StyledInput value={f.tiempoEntrega} onChange={e => { upd('tiempoEntrega', e.target.value); setErr(false); }}
            placeholder="Ej: 7 días" style={{ marginBottom: 12, borderColor: err ? '#EF4444' : undefined }} />
          {err && (
            <div style={{ fontSize: 12, color: '#EF4444', fontWeight: 700, marginBottom: 12 }}>
              {!f.tiempoEntrega.trim()
                ? '⚠️ Agrega un tiempo de entrega para continuar'
                : '⚠️ Ingresa un teléfono válido (10 dígitos)'}
            </div>
          )}

          <StyledLabel>📝 Mensaje adicional (opcional)</StyledLabel>
          <StyledTextarea value={f.mensajeExtra} onChange={e => upd('mensajeExtra', e.target.value)}
            placeholder="Notas, personalización, condiciones…" style={{ minHeight: 72 }} />

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: '2px solid #E5E7EB', backgroundColor: 'transparent',
              fontWeight: 800, fontSize: 14, color: '#6B7280',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancelar</button>
            <button onClick={handleOpen} style={{
              flex: 2, padding: 14, borderRadius: 12,
              backgroundColor: '#25D366', border: 'none',
              color: '#fff', fontWeight: 900, fontSize: 14,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>💬 Abrir WhatsApp</button>
          </div>
          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}