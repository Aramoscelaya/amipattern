import React, { useState, useEffect } from 'react';
import { COLORS } from '../lib/constants';
import { calcPrecioBoutique } from '../hooks/usePriceList';

const BLANK = {
  nombre: '', emoji: '🧸', size: '',
  costo_material: '', horas: '', costo_empaque: '',
  nota: '', patron_id: '',
};

const EMOJIS = ['🧸','🌸','🔑','🐣','🐧','🐸','🦊','🐰','🐻','🦄','🌻','🍄','⭐','🎀','🌈','🐙','🦋','🐝','🐠','🎃','🐱','🐶','🦁','🐯','🐼'];

export default function PriceListItemModal({ visible, item, config, patterns, onSave, onClose }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(item
        ? { ...BLANK, ...item, costo_material: item.costo_material ?? '', horas: item.horas ?? '', costo_empaque: item.costo_empaque ?? '' }
        : BLANK
      );
      setEmojiOpen(false);
    }
  }, [visible, item]);

  if (!visible) return null;

  const calc = calcPrecioBoutique({
    costo_material: form.costo_material,
    horas: form.horas,
    costo_empaque: form.costo_empaque,
    pago_por_hora:  config?.pago_por_hora,
    margen_propio:  config?.margen_propio,
    margen_boutique: config?.margen_boutique,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');
    setSaving(true);
    try {
      await onSave({
        ...form,
        costo_material: Number(form.costo_material) || 0,
        horas:          Number(form.horas)          || 0,
        costo_empaque:  Number(form.costo_empaque)  || 0,
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '94vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 48px',
        animation: 'slideUp 0.25s ease',
      }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>
            {item ? '✏️ Editar producto' : '💰 Nuevo producto'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Nombre + emoji */}
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
                  position: 'absolute', zIndex: 10, backgroundColor: '#fff', borderRadius: 14,
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
                placeholder="Ej: Llavero mini" style={INPUT} />
            </div>
          </div>

          {/* Tamaño */}
          <div>
            <span style={LABEL}>Tamaño</span>
            <input value={form.size} onChange={e => set('size', e.target.value)}
              placeholder="Ej: 4 - 6 cm" style={INPUT} />
          </div>

          {/* Costos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <span style={LABEL}>Material ($)</span>
              <input type="number" inputMode="decimal" value={form.costo_material}
                onChange={e => set('costo_material', e.target.value)}
                placeholder="0" style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Horas</span>
              <input type="number" inputMode="decimal" value={form.horas}
                onChange={e => set('horas', e.target.value)}
                placeholder="0" style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Empaque ($)</span>
              <input type="number" inputMode="decimal" value={form.costo_empaque}
                onChange={e => set('costo_empaque', e.target.value)}
                placeholder="0" style={INPUT} />
            </div>
          </div>

          {/* Patrón vinculado (opcional) */}
          {patterns?.length > 0 && (
            <div>
              <span style={LABEL}>Vincular a patrón (opcional)</span>
              <select value={form.patron_id || ''} onChange={e => set('patron_id', e.target.value || null)} style={INPUT}>
                <option value="">— Sin vincular —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji || '🧶'} {p.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Nota */}
          <div>
            <span style={LABEL}>Nota / inventario</span>
            <input value={form.nota} onChange={e => set('nota', e.target.value)}
              placeholder="Ej: Lleva 1, Sobre pedido" style={INPUT} />
          </div>

          {/* Desglose calculado */}
          <div style={{ backgroundColor: '#F5F0EB', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              Precios calculados
            </div>
            {[
              { label: 'Costo total',       val: calc.costo_total,     color: COLORS.textPrimary },
              { label: '→ Precio boutique', val: calc.precio_boutique, color: '#059669', bold: true },
              { label: '→ Precio público',  val: calc.precio_publico,  color: '#1D4ED8', bold: true },
              { label: 'Utilidad tuya',     val: calc.utilidad_tuya,   color: '#92400E' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: COLORS.textSecondary }}>{r.label}</span>
                <span style={{ fontWeight: r.bold ? 900 : 700, color: r.color }}>${r.val.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: '2px solid #E5E7EB', background: 'transparent',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: 14, borderRadius: 12,
              backgroundColor: '#1A1A2E', border: 'none',
              color: '#FAD2E1', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Guardando…' : '💾 Guardar'}</button>
          </div>

        </div>
      </div>
    </div>
  );
}
