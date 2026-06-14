import React, { useState, useEffect, useCallback } from 'react';
import { CATEGORIAS } from '../hooks/useStore';
import { calcPrecio } from '../hooks/useOrders';
import { COLORS } from '../lib/constants';

const BLANK = {
  nombre: '', emoji: '🧸', categoria: 'amigurumi',
  patron_id: '', patron_nombre: '', color_hex: '#FAD2E1',
  materiales: [], horas: '', costo_hora: '40',
  precio_sugerido: 0, precio_final: '', precio_manual: false,
  notas: '', stock_inicial: '1',
};

const COLORES = ['#FAD2E1','#B5EAD7','#FFDAC1','#C7CEEA','#A8DADC','#F4A261','#E9C46A','#2A9D8F','#264653','#E76F51'];
const EMOJIS  = ['🧸','🌸','🔑','🐣','🐧','🐸','🦊','🐰','🐻','🦄','🌻','🍄','⭐','🎀','🌈','🐙','🦋','🐝','🐠','🎃'];

// ── Fila de material ───────────────────────────────────────────
function MatRow({ mat, onChange, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        value={mat.nombre} onChange={e => onChange({ ...mat, nombre: e.target.value })}
        placeholder="Material"
        style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', backgroundColor: '#F9FAFB' }}
      />
      <input
        type="number" inputMode="decimal" value={mat.cantidad}
        onChange={e => onChange({ ...mat, cantidad: e.target.value })}
        placeholder="Cant"
        style={{ width: 52, padding: '8px 6px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center', backgroundColor: '#F9FAFB' }}
      />
      <input
        type="number" inputMode="decimal" value={mat.costo_unit}
        onChange={e => onChange({ ...mat, costo_unit: e.target.value })}
        placeholder="$/u"
        style={{ width: 60, padding: '8px 6px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'right', backgroundColor: '#F9FAFB' }}
      />
      <button onClick={onDelete} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#EF4444', padding: '4px 2px', flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function CostingModal({ visible, initial, patterns = [], onClose, onSave }) {
  const [form,      setForm]      = useState(BLANK);
  const [saving,    setSaving]    = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [newMat,    setNewMat]    = useState({ nombre: '', cantidad: '', costo_unit: '' });

  useEffect(() => {
    if (visible) {
      setForm(initial
        ? { ...BLANK, ...initial, materiales: initial.materiales || [] }
        : BLANK
      );
      setNewMat({ nombre: '', cantidad: '', costo_unit: '' });
    }
  }, [visible, initial]);

  // ── Recalcula precio automático ────────────────────────────
  const recalc = useCallback((mats, horas, costo_hora, precio_manual, precio_final_override) => {
    const materialesNum = mats.map(m => ({
      ...m,
      cantidad:   Number(m.cantidad)   || 0,
      costo_unit: Number(m.costo_unit) || 0,
    }));
    const calc = calcPrecio({
      materiales: materialesNum,
      horas:      Number(horas)      || 0,
      costo_hora: Number(costo_hora) || 40,
    });
    return {
      costo_total:     calc.costoTotal,
      precio_sugerido: calc.precioFinal,
      precio_final:    precio_manual
        ? (precio_final_override !== undefined ? precio_final_override : calc.precioFinal)
        : String(calc.precioFinal),
    };
  }, []);

  // Early return AFTER all hooks
  if (!visible) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleMatChange = (idx, updated) => {
    const mats = form.materiales.map((m, i) => i === idx ? updated : m);
    const r = recalc(mats, form.horas, form.costo_hora, form.precio_manual, form.precio_final);
    setForm(f => ({ ...f, materiales: mats, ...r }));
  };

  const handleMatDelete = (idx) => {
    const mats = form.materiales.filter((_, i) => i !== idx);
    const r = recalc(mats, form.horas, form.costo_hora, form.precio_manual, form.precio_final);
    setForm(f => ({ ...f, materiales: mats, ...r }));
  };

  const handleAddMat = () => {
    if (!newMat.nombre.trim()) return;
    const mats = [...form.materiales, { ...newMat, id: Date.now() }];
    const r = recalc(mats, form.horas, form.costo_hora, form.precio_manual, form.precio_final);
    setForm(f => ({ ...f, materiales: mats, ...r }));
    setNewMat({ nombre: '', cantidad: '', costo_unit: '' });
  };

  const handleHorasChange = (val) => {
    const r = recalc(form.materiales, val, form.costo_hora, form.precio_manual, form.precio_final);
    setForm(f => ({ ...f, horas: val, ...r }));
  };

  const handleCostoHoraChange = (val) => {
    const r = recalc(form.materiales, form.horas, val, form.precio_manual, form.precio_final);
    setForm(f => ({ ...f, costo_hora: val, ...r }));
  };

  const handlePrecioFinal = (val) => {
    setForm(f => ({ ...f, precio_final: val, precio_manual: true }));
  };

  const handleResetPrecio = () => {
    const r = recalc(form.materiales, form.horas, form.costo_hora, false, null);
    setForm(f => ({ ...f, ...r, precio_manual: false }));
  };

  const handlePatron = (e) => {
    const pat = patterns.find(p => String(p.id) === e.target.value);
    setForm(f => ({
      ...f,
      patron_id:    pat?.id     || '',
      patron_nombre: pat?.nombre || '',
      nombre:       f.nombre || pat?.nombre || '',
    }));
  };

  const costoMat = form.materiales.reduce((s, m) => s + ((Number(m.cantidad) || 0) * (Number(m.costo_unit) || 0)), 0);
  const costoMO  = (Number(form.horas) || 0) * (Number(form.costo_hora) || 40);

  const handleSave = async () => {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');
    setSaving(true);
    try {
      const materialesNum = form.materiales.map(m => ({
        ...m,
        cantidad:   Number(m.cantidad)   || 0,
        costo_unit: Number(m.costo_unit) || 0,
      }));
      await onSave({
        ...form,
        materiales:      materialesNum,
        horas:           Number(form.horas)          || 0,
        costo_hora:      Number(form.costo_hora)     || 40,
        costo_total:     Number(form.costo_total)    || 0,
        precio_sugerido: Number(form.precio_sugerido)|| 0,
        precio_final:    Number(form.precio_final)   || 0,
        stock_inicial:   Number(form.stock_inicial)  || 1,
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
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>
            🧮 {initial ? 'Editar desglose' : 'Calcular costo'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

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
              <span style={LABEL}>Nombre del producto *</span>
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
                  fontWeight: 700, fontSize: 12,
                  backgroundColor: form.categoria === c.id ? COLORS.header : '#F9FAFB',
                  borderColor:     form.categoria === c.id ? COLORS.header : '#E5E7EB',
                  color:           form.categoria === c.id ? '#fff' : COLORS.textSecondary,
                }}>{c.emoji} {c.label}</button>
              ))}
            </div>
          </div>

          {/* Patrón vinculado */}
          {patterns.length > 0 && (
            <div>
              <span style={LABEL}>Vincular a patrón (opcional)</span>
              <select value={form.patron_id || ''} onChange={handlePatron} style={INPUT}>
                <option value="">— Sin vincular —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji || '🧶'} {p.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* ── Materiales ── */}
          <div>
            <span style={LABEL}>Materiales utilizados</span>

            {/* Encabezado columnas */}
            {form.materiales.length > 0 && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, paddingRight: 24 }}>
                <span style={{ flex: 2, fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase' }}>Material</span>
                <span style={{ width: 52, fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', textAlign: 'center' }}>Cant</span>
                <span style={{ width: 60, fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', textAlign: 'right' }}>$/u</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {form.materiales.map((mat, idx) => (
                <MatRow key={mat.id || idx} mat={mat}
                  onChange={updated => handleMatChange(idx, updated)}
                  onDelete={() => handleMatDelete(idx)}
                />
              ))}
            </div>

            {/* Fila nueva */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
              <input
                value={newMat.nombre} onChange={e => setNewMat(m => ({ ...m, nombre: e.target.value }))}
                placeholder="+ Material"
                onKeyDown={e => e.key === 'Enter' && handleAddMat()}
                style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', backgroundColor: '#FAFAFA' }}
              />
              <input
                type="number" inputMode="decimal" value={newMat.cantidad}
                onChange={e => setNewMat(m => ({ ...m, cantidad: e.target.value }))}
                placeholder="Cant"
                style={{ width: 52, padding: '8px 6px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center', backgroundColor: '#FAFAFA' }}
              />
              <input
                type="number" inputMode="decimal" value={newMat.costo_unit}
                onChange={e => setNewMat(m => ({ ...m, costo_unit: e.target.value }))}
                placeholder="$/u"
                style={{ width: 60, padding: '8px 6px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'right', backgroundColor: '#FAFAFA' }}
              />
              <button onClick={handleAddMat} style={{
                width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                backgroundColor: COLORS.header, border: 'none',
                color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          </div>

          {/* ── Horas ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={LABEL}>Horas trabajadas</span>
              <input type="number" inputMode="decimal" value={form.horas}
                onChange={e => handleHorasChange(e.target.value)}
                placeholder="0" style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Costo por hora ($)</span>
              <input type="number" inputMode="decimal" value={form.costo_hora}
                onChange={e => handleCostoHoraChange(e.target.value)}
                placeholder="40" style={INPUT} />
            </div>
          </div>

          {/* ── Desglose de costos ── */}
          <div style={{ backgroundColor: '#F5F0EB', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Desglose</div>
            {[
              { label: 'Materiales',          val: costoMat,                                      color: COLORS.textPrimary },
              { label: `M. de obra (${form.horas || 0}h × $${form.costo_hora || 40})`, val: costoMO, color: COLORS.textPrimary },
              { label: 'Costo total',         val: costoMat + costoMO,                            color: COLORS.textPrimary, bold: true },
              { label: '+ Overhead (10%)',    val: (costoMat + costoMO) * 0.10,                   color: '#92400E' },
              { label: '+ Ganancia (30%)',    val: (costoMat + costoMO) * 1.10 * 0.30,            color: '#065F46' },
              { label: 'Precio sugerido',     val: Number(form.precio_sugerido) || 0,             color: '#1D4ED8', bold: true },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: COLORS.textSecondary }}>{r.label}</span>
                <span style={{ fontWeight: r.bold ? 900 : 700, color: r.color }}>${r.val.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* ── Precio final ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={LABEL}>Precio final que quieres cobrar</span>
              {form.precio_manual && (
                <button onClick={handleResetPrecio} style={{
                  background: 'none', border: 'none', fontSize: 11, fontWeight: 800,
                  color: COLORS.header, cursor: 'pointer', fontFamily: 'inherit', padding: '0 0 4px',
                }}>↩ Usar sugerido</button>
              )}
            </div>
            <input
              type="number" inputMode="decimal"
              value={form.precio_final}
              onChange={e => handlePrecioFinal(e.target.value)}
              placeholder={String(form.precio_sugerido || '0')}
              style={{
                ...INPUT,
                fontSize: 20, fontWeight: 900,
                borderColor: form.precio_manual ? COLORS.header : '#E5E7EB',
                color: form.precio_manual ? COLORS.header : '#059669',
              }}
            />
            {form.precio_manual && (
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                ✏️ Precio personalizado · sugerido: ${Number(form.precio_sugerido).toFixed(2)}
              </div>
            )}
          </div>

          {/* Stock inicial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={LABEL}>Piezas en stock</span>
              <input type="number" inputMode="numeric" value={form.stock_inicial}
                onChange={e => set('stock_inicial', e.target.value)}
                placeholder="1" style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Color de tarjeta</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 6 }}>
                {COLORES.map(c => (
                  <button key={c} onClick={() => set('color_hex', c)} style={{
                    width: 26, height: 26, borderRadius: 13, backgroundColor: c,
                    border: form.color_hex === c ? '3px solid #1A1A2E' : '2px solid #E5E7EB',
                    cursor: 'pointer',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <span style={LABEL}>Notas (opcional)</span>
            <textarea value={form.notas || ''} onChange={e => set('notas', e.target.value)}
              placeholder="Observaciones del patrón, variantes…"
              rows={2} style={{ ...INPUT, resize: 'none' }} />
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
            }}>{saving ? 'Guardando…' : '✅ Guardar y crear producto'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
