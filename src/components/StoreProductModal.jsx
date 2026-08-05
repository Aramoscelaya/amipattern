import React, { useState, useEffect } from 'react';
import { CATEGORIAS } from '../lib/constants';
import { COLORS, Z_INDEX, ANIMATION, COLORS_PALETTE } from '../lib/constants';
import { StyledInput, StyledLabel, StyledTextarea, SelectRow } from './FormFields';
import { calcPreciosCanal } from '../lib/pricing';

const EMOJIS = ['🧸','🌸','🔑','🐣','🐧','🐸','🦊','🐰','🐻','🦄','🌻','🍄','⭐','🎀','🌈','🐙','🦋','🐝','🐠','🎃'];

const DEFAULT_CONFIG = { tarifa_hora: 60, margen_propio: 0.20, margen_boutique: 0.35, redondeo: 0 };

const ESTADOS_CATALOGO = [
  { id: 'activo',         label: '🟢 Activo' },
  { id: 'bajo_pedido',    label: '🟡 Bajo pedido' },
  { id: 'descontinuado',  label: '🔴 Descontinuado' },
];

const BLANK_PRODUCT = {
  nombre: '', emoji: '🧸', categoria: 'amigurumi',
  descripcion: '', precio_venta: '', stock_inicial: '',
  stock_vendido: 0, patron_id: '', color_hex: '#FAD2E1',
  costo_base: '', precio_boutique: '', estado_catalogo: 'activo',
  tiempo_elaboracion: '',
};

export default function StoreProductModal({ visible, initial, patterns = [], config = null, onClose, onSave }) {
  const [form,    setForm]    = useState(BLANK_PRODUCT);
  const [saving,  setSaving]  = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [precioManual, setPrecioManual] = useState(false);

  const cfg = {
    ...DEFAULT_CONFIG,
    ...(config || {}),
    margen_propio:   config?.margen_propio   ?? DEFAULT_CONFIG.margen_propio,
    margen_boutique: config?.margen_boutique ?? DEFAULT_CONFIG.margen_boutique,
    redondeo:        config?.redondeo ?? DEFAULT_CONFIG.redondeo,
  };

  useEffect(() => {
    if (visible) {
      setForm(initial ? { ...initial } : BLANK_PRODUCT);
      setPrecioManual(!!(initial && (initial.precio_boutique || initial.precio_boutique === 0)));
    }
  }, [visible, initial]);

  useEffect(() => {
    if (!visible || precioManual) return;
    const base = Number(form.costo_base);
    if (base > 0) {
      const calc = calcPreciosCanal({ costo_base: base, config: cfg });
      set('precio_venta', calc.precio_publico);
      set('precio_boutique', calc.precio_boutique);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.costo_base, cfg.margen_propio, cfg.margen_boutique, cfg.redondeo, visible, precioManual]);

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
        precio_boutique: Number(form.precio_boutique) || 0,
        costo_base:    Number(form.costo_base)    || 0,
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

          {/* Costo base + precio boutique (módulo 3) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <StyledLabel>💵 Costo base ($)</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.costo_base}
                onChange={e => { set('costo_base', e.target.value); setPrecioManual(false); }}
                placeholder="0.00" />
            </div>
            <div>
              <StyledLabel>✨ Precio boutique ($)</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.precio_boutique}
                onChange={e => { set('precio_boutique', e.target.value); setPrecioManual(true); }}
                placeholder="auto" />
            </div>
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: -8 }}>
            💡 Precio público y boutique se calculan con los márgenes globales. Edita el boutique para fijarlo manualmente.
          </div>

          {/* Estado catálogo + tiempo elaboración */}
          <div>
            <StyledLabel>📋 Estado del catálogo</StyledLabel>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ESTADOS_CATALOGO.map(c => (
                <button key={c.id} onClick={() => set('estado_catalogo', c.id)} style={{
                  padding: '7px 12px', borderRadius: 99,
                  border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12,
                  backgroundColor: form.estado_catalogo === c.id ? COLORS.header : '#F9FAFB',
                  borderColor: form.estado_catalogo === c.id ? COLORS.header : '#E5E7EB',
                  color: form.estado_catalogo === c.id ? '#fff' : COLORS.textSecondary,
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          <div>
            <StyledLabel>⏱️ Tiempo de elaboración</StyledLabel>
            <StyledInput value={form.tiempo_elaboracion} onChange={e => set('tiempo_elaboracion', e.target.value)}
              placeholder='Ej: 2 horas' />
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
