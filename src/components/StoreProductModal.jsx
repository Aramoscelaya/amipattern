import React, { useState, useEffect } from 'react';
import { CATEGORIAS } from '../hooks/useStore';
import { COLORS } from '../lib/constants';

const EMOJIS = ['🧸','🌸','🔑','🐣','🐧','🐸','🦊','🐰','🐻','🦄','🌻','🍄','⭐','🎀','🌈','🐙','🦋','🐝','🐠','🎃'];
const COLORES = ['#FAD2E1','#B5EAD7','#FFDAC1','#C7CEEA','#A8DADC','#F4A261','#E9C46A','#2A9D8F','#264653','#E76F51'];

export default function StoreProductModal({ visible, initial, patterns = [], onClose, onSave }) {
  const blank = {
    nombre: '', emoji: '🧸', categoria: 'amigurumi',
    descripcion: '', precio_venta: '', stock_inicial: '',
    stock_vendido: 0, patron_id: '', color_hex: '#FAD2E1',
  };

  const [form,    setForm]    = useState(blank);
  const [saving,  setSaving]  = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (visible) setForm(initial ? { ...initial } : blank);
  }, [visible, initial]);

  if (!visible) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');
    if (!form.stock_inicial && form.stock_inicial !== 0) return alert('Indica el stock inicial');
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

  const INPUT = {
    width: '100%', boxSizing: 'border-box',
    backgroundColor: '#F9FAFB', borderRadius: 10,
    border: '1.5px solid #E5E7EB',
    padding: '10px 12px', fontSize: 14, color: COLORS.textPrimary,
    outline: 'none', fontFamily: 'inherit',
  };
  const LABEL = { fontSize: 12, fontWeight: 800, color: COLORS.textSecondary, marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '92vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 40px',
        animation: 'slideUp 0.25s ease',
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
              <span style={LABEL}>Emoji</span>
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
              <span style={LABEL}>Nombre *</span>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
                placeholder="Ej: Llavero Pollito" style={INPUT} />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <span style={LABEL}>Categoría</span>
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
              <span style={LABEL}>Precio de venta ($)</span>
              <input type="number" inputMode="decimal" value={form.precio_venta}
                onChange={e => set('precio_venta', e.target.value)}
                placeholder="0.00" style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Stock inicial (piezas)</span>
              <input type="number" inputMode="numeric" value={form.stock_inicial}
                onChange={e => set('stock_inicial', e.target.value)}
                placeholder="0" style={INPUT} />
            </div>
          </div>

          {/* Color */}
          <div>
            <span style={LABEL}>Color de tarjeta</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLORES.map(c => (
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
            <span style={LABEL}>Descripción (opcional)</span>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              placeholder="Notas sobre este producto…"
              rows={2}
              style={{ ...INPUT, resize: 'none' }} />
          </div>

          {/* Patrón vinculado (opcional) */}
          {patterns.length > 0 && (
            <div>
              <span style={LABEL}>Vincular a patrón (opcional)</span>
              <select value={form.patron_id || ''} onChange={e => set('patron_id', e.target.value)}
                style={{ ...INPUT }}>
                <option value="">— Sin vincular —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.nombre}</option>
                ))}
              </select>
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
