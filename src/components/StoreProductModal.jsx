import React, { useState, useEffect } from 'react';
import { CATEGORIAS } from '../hooks/useStore';
import { COLORS, Z_INDEX, ANIMATION, COLORS_PALETTE } from '../lib/constants';
import { StyledInput, StyledLabel, StyledTextarea, SelectRow } from './FormFields';

const EMOJIS = ['🧸','🌸','🔑','🐣','🐧','🐸','🦊','🐰','🐻','🦄','🌻','🍄','⭐','🎀','🌈','🐙','🦋','🐝','🐠','🎃'];


const BLANK_PRODUCT = {
  nombre: '', emoji: '🧸', categoria: 'amigurumi',
  descripcion: '', precio_venta: '', stock_inicial: '',
  stock_vendido: 0, patron_id: '', color_hex: '#FAD2E1',
};

export default function StoreProductModal({ visible, initial, patterns = [], onClose, onSave }) {
  const [form,    setForm]    = useState(BLANK_PRODUCT);
  const [saving,  setSaving]  = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (visible) setForm(initial ? { ...initial } : BLANK_PRODUCT);
  }, [visible, initial]);

  if (!visible) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    if (!form.stock_inicial && form.stock_inicial !== 0) return;
    setSaving(true);
    try {
      // Vincular nombre del patrón si se seleccionó
      const patSelected = patterns.find(p => String(p.id) === String(form.patron_id));
      await onSave({
        ...form,
        precio_venta:  Number(form.precio_venta)  || 0,
        stock_inicial: Number(form.stock_inicial) || 0,
        stock_vendido: Number(form.stock_vendido) || 0,
        patron_id:     patSelected?.id     || null,
        patron_nombre: patSelected?.nombre || null,
      });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '92vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 40px',
        animation: ANIMATION.slideUp,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>
            {initial ? '✏️ Editar producto' : '🧸 Nuevo producto'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Emoji + Nombre */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div>
              <StyledLabel>Emoji</StyledLabel>
              <button onClick={() => setEmojiOpen(e => !e)} style={{
                width: 52, height: 44, borderRadius: 10,
                border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB',
                fontSize: 24, cursor: 'pointer',
              }}>{form.emoji}</button>
              {emojiOpen && (
                <div style={{
                  position: 'absolute', zIndex: 10,
                  backgroundColor: '#fff', borderRadius: 14,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  padding: 10, display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220,
                }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => { set('emoji', e); setEmojiOpen(false); }}
                      style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 }}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <StyledLabel>Nombre *</StyledLabel>
              <StyledInput value={form.nombre} onChange={e => set('nombre', e.target.value)}
                placeholder="Ej: Llavero Pollito" />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <StyledLabel>Categoría</StyledLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIAS.map(c => (
                <button key={c.id} onClick={() => set('categoria', c.id)} style={{
                  padding: '7px 14px', borderRadius: 99,
                  border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 13,
                  backgroundColor: form.categoria === c.id ? COLORS.header : '#F9FAFB',
                  borderColor: form.categoria === c.id ? COLORS.header : '#E5E7EB',
                  color: form.categoria === c.id ? '#fff' : COLORS.textSecondary,
                }}>{c.emoji} {c.label}</button>
              ))}
            </div>
          </div>

          {/* Precio y Stock */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <StyledLabel>Precio de venta ($)</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.precio_venta}
                onChange={e => set('precio_venta', e.target.value)}
                placeholder="0.00" />
            </div>
            <div>
              <StyledLabel>Stock inicial (piezas)</StyledLabel>
              <StyledInput type="number" inputMode="numeric" value={form.stock_inicial}
                onChange={e => set('stock_inicial', e.target.value)}
                placeholder="0" />
            </div>
          </div>

          {/* Color */}
          <div>
            <StyledLabel>Color de tarjeta</StyledLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORS_PALETTE.map(c => (
                <button key={c} onClick={() => set('color_hex', c)} style={{
                  width: 30, height: 30, borderRadius: 15, backgroundColor: c,
                  border: form.color_hex === c ? '3px solid #1A1A2E' : '2px solid #E5E7EB',
                  cursor: 'pointer',
                }} />
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <StyledLabel>Descripción (opcional)</StyledLabel>
            <StyledTextarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Notas sobre este producto…"
              rows={2}
              style={{ resize: 'none' }} />
          </div>

          {/* Patrón vinculado (opcional) */}
          {patterns.length > 0 && (
            <div>
              <StyledLabel>Vincular a patrón (opcional)</StyledLabel>
              <SelectRow value={form.patron_id || ''} onChange={e => set('patron_id', e.target.value)}>
                <option value="">— Sin vincular —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.nombre}</option>
                ))}
              </SelectRow>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: '2px solid #E5E7EB', background: 'transparent',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: 14, borderRadius: 12,
              backgroundColor: '#1A1A2E', border: 'none',
              color: '#fff', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Guardando…' : initial ? 'Guardar cambios' : '+ Agregar producto'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
