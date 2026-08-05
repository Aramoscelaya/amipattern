import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { calcPrecio } from '../lib/pricing';
import { CATEGORIAS } from '../lib/constants';
import { COLORS, PRICING_DEFAULTS, Z_INDEX, ANIMATION, COLORS_PALETTE } from '../lib/constants';
import { StyledInput, StyledLabel, StyledTextarea, SelectRow } from './FormFields';


const EMOJIS = ['🧸','🌸','🔑','🐣','🐧','🐸','🦊','🐰','🐻','🦄','🌻','🍄','⭐','🎀','🌈','🐙','🦋','🐝','🐠','🎃'];

const BLANK = {
  nombre: '', emoji: '🧸', categoria: 'amigurumi',
  patron_id: '', patron_nombre: '',
  materiales: [],
  horas: '', costo_hora: String(PRICING_DEFAULTS.costo_hora),
  overhead_pct: String(PRICING_DEFAULTS.overhead_pct),
  margen_pct: String(PRICING_DEFAULTS.margen_pct),
  precio_sugerido: 0, precio_final: '', precio_manual: false,
  notas: '',
  stock_inicial: '1', color_hex: '#FAD2E1', descripcion: '',
  size: '', costo_empaque: '', nota: '',
  saveToStore: true,
  saveToPriceList: false,
};

function MatRow({ mat, onChange, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input value={mat.nombre} onChange={e => onChange({ ...mat, nombre: e.target.value })}
        placeholder="Material"
        style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', backgroundColor: '#F9FAFB' }}
      />
      <input type="number" inputMode="decimal" value={mat.cantidad}
        onChange={e => onChange({ ...mat, cantidad: e.target.value })}
        placeholder="Cant"
        style={{ width: 52, padding: '8px 6px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center', backgroundColor: '#F9FAFB' }}
      />
      <input type="number" inputMode="decimal" value={mat.costo_unit}
        onChange={e => onChange({ ...mat, costo_unit: e.target.value })}
        placeholder="$/u"
        style={{ width: 60, padding: '8px 6px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'right', backgroundColor: '#F9FAFB' }}
      />
      <button onClick={onDelete} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#EF4444', padding: '4px 2px', flexShrink: 0 }}>✕</button>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: 12, border: '1.5px solid #E5E7EB' }}>
      <span style={{ fontWeight: 700, fontSize: 13, color: COLORS.textPrimary }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', position: 'relative',
        backgroundColor: value ? '#1A1A2E' : '#D1D5DB', transition: 'background 0.2s',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', position: 'absolute', top: 3,
          left: value ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

export default function ProductModal({ visible, initial, patterns = [], priceConfig, onClose, onSave }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [newMat, setNewMat] = useState({ nombre: '', cantidad: '', costo_unit: '' });

  useEffect(() => {
    if (!visible) return;
    if (!initial) {
      setForm({
        ...BLANK,
        saveToStore: !priceConfig,
        saveToPriceList: !!priceConfig,
      });
      setNewMat({ nombre: '', cantidad: '', costo_unit: '' });
      setEmojiOpen(false);
      return;
    }
    const hasMateriales = Array.isArray(initial.materiales);
    if (hasMateriales) {
      setForm({
        ...BLANK,
        nombre: initial.nombre || '',
        emoji: initial.emoji || '🧸',
        categoria: initial.categoria || 'amigurumi',
        patron_id: initial.patron_id || '',
        patron_nombre: initial.patron_nombre || '',
        materiales: initial.materiales || [],
        horas: String(initial.horas ?? ''),
        costo_hora: String(initial.costo_hora ?? PRICING_DEFAULTS.costo_hora),
        overhead_pct: String(initial.overhead_pct ?? PRICING_DEFAULTS.overhead_pct),
        margen_pct: String(initial.margen_pct ?? PRICING_DEFAULTS.margen_pct),
        precio_sugerido: initial.precio_sugerido || 0,
        precio_final: String(initial.precio_final ?? ''),
        precio_manual: initial.precio_manual || false,
        notas: initial.notas || '',
        stock_inicial: String(initial.stock_inicial ?? '1'),
        color_hex: initial.color_hex || '#FAD2E1',
        descripcion: initial.descripcion || '',
        size: initial.size || '',
        costo_empaque: String(initial.costo_empaque ?? ''),
        nota: initial.nota || '',
        saveToStore: true,
        saveToPriceList: false,
      });
    } else {
      setForm({
        ...BLANK,
        nombre: initial.nombre || '',
        emoji: initial.emoji || '🧸',
        categoria: initial.categoria || 'amigurumi',
        patron_id: initial.patron_id || '',
        patron_nombre: initial.patron_nombre || '',
        horas: String(initial.horas ?? ''),
        size: initial.size || '',
        costo_empaque: String(initial.costo_empaque ?? ''),
        nota: initial.nota || '',
        saveToStore: false,
        saveToPriceList: true,
      });
    }
    setNewMat({ nombre: '', cantidad: '', costo_unit: '' });
    setEmojiOpen(false);
  }, [visible, initial, priceConfig]);

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const updMat = useCallback((idx, updated) => {
    setForm(f => ({ ...f, materiales: f.materiales.map((m, i) => i === idx ? updated : m) }));
  }, []);

  const delMat = useCallback((idx) => {
    setForm(f => ({ ...f, materiales: f.materiales.filter((_, i) => i !== idx) }));
  }, []);

  const addMat = useCallback(() => {
    if (!newMat.nombre.trim()) return;
    setForm(f => ({ ...f, materiales: [...f.materiales, { ...newMat, id: Date.now() }] }));
    setNewMat({ nombre: '', cantidad: '', costo_unit: '' });
  }, [newMat]);

  const costoMatTotal = useMemo(() =>
    form.materiales.reduce((s, m) => s + (Number(m.cantidad) || 0) * (Number(m.costo_unit) || 0), 0),
    [form.materiales]
  );

  const costingCalc = useMemo(() => calcPrecio({
    mode: 'costing',
    materiales: form.materiales.map(m => ({ cantidad: Number(m.cantidad) || 0, costo_unit: Number(m.costo_unit) || 0 })),
    horas: Number(form.horas) || 0,
    costo_hora: Number(form.costo_hora) || PRICING_DEFAULTS.costo_hora,
    overhead_pct: Number(form.overhead_pct) || PRICING_DEFAULTS.overhead_pct,
    margen_pct: Number(form.margen_pct) || PRICING_DEFAULTS.margen_pct,
  }), [form.materiales, form.horas, form.costo_hora, form.overhead_pct, form.margen_pct]);

  const suggestedPrice = costingCalc.precioFinal;

  useEffect(() => {
    if (!form.precio_manual) {
      setForm(f => ({ ...f, precio_sugerido: suggestedPrice, precio_final: String(suggestedPrice) }));
    } else {
      setForm(f => ({ ...f, precio_sugerido: suggestedPrice }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedPrice]);

  const costoMO = (Number(form.horas) || 0) * (Number(form.costo_hora) || PRICING_DEFAULTS.costo_hora);

  const boutiqueCalc = useMemo(() => {
    if (!form.saveToPriceList) return null;
    return calcPrecio({
      mode: 'boutique',
      costo_material: costoMatTotal,
      horas: Number(form.horas) || 0,
      costo_empaque: Number(form.costo_empaque) || 0,
      pago_por_hora: priceConfig?.pago_por_hora || PRICING_DEFAULTS.pago_por_hora,
      margen_propio: priceConfig?.margen_propio || PRICING_DEFAULTS.margen_propio,
      margen_boutique: priceConfig?.margen_boutique || PRICING_DEFAULTS.margen_boutique,
    });
  }, [form.saveToPriceList, costoMatTotal, form.horas, form.costo_empaque, priceConfig]);

  const handleSave = async () => {
    if (!form.nombre.trim()) { return; }
    setSaving(true);
    try {
      const materialesNum = form.materiales.map(m => ({
        ...m, cantidad: Number(m.cantidad) || 0, costo_unit: Number(m.costo_unit) || 0,
      }));
      const isCostingEdit = initial && Array.isArray(initial.materiales);
      const isPriceListEdit = initial && !Array.isArray(initial.materiales) && initial.id;

      const payload = {
        costing: null,
        storeProduct: null,
        priceListItem: null,
      };

      if (form.saveToStore || form.saveToPriceList) {
        payload.costing = {
          ...(isCostingEdit ? { id: initial.id, product_id: initial.product_id } : {}),
          nombre: form.nombre.trim(),
          emoji: form.emoji,
          categoria: form.categoria,
          color_hex: form.color_hex,
          descripcion: form.descripcion || null,
          patron_id: form.patron_id || null,
          patron_nombre: form.patron_nombre || null,
          materiales: materialesNum,
          horas: Number(form.horas) || 0,
          costo_hora: Number(form.costo_hora) || PRICING_DEFAULTS.costo_hora,
          overhead_pct: Number(form.overhead_pct) || PRICING_DEFAULTS.overhead_pct,
          margen_pct: Number(form.margen_pct) || PRICING_DEFAULTS.margen_pct,
          costo_total: costingCalc.costoTotal,
          precio_sugerido: suggestedPrice,
          precio_final: Number(form.precio_final) || suggestedPrice,
          precio_manual: form.precio_manual,
          notas: form.notas || null,
        };
      }

      if (form.saveToStore) {
        payload.storeProduct = {
          stock_inicial: Number(form.stock_inicial) || 0,
        };
      }

      if (form.saveToPriceList) {
        payload.priceListItem = {
          ...(isPriceListEdit ? { id: initial.id } : {}),
          size: form.size || null,
          costo_material: costoMatTotal,
          horas: Number(form.horas) || 0,
          costo_empaque: Number(form.costo_empaque) || 0,
          nota: form.nota || null,
          emoji: form.emoji,
          nombre: form.nombre.trim(),
          patron_id: form.patron_id || null,
        };
      }

      await onSave(payload);
    } finally { setSaving(false); }
  };

  if (!visible) return null;

  const overAmt = costingCalc.conOverhead - costingCalc.subtotal;
  const gainAmt = costingCalc.precioFinal - costingCalc.conOverhead;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '94vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 48px',
        animation: ANIMATION.slideUp,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>
            🧮 {initial ? 'Editar' : 'Nuevo producto'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ══════════════════════════════════════════════════════
              SECCIÓN 1 — Identidad + Costos
             ══════════════════════════════════════════════════════ */}
          <div style={{ fontWeight: 800, fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📋 Datos del producto
          </div>

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
                  fontWeight: 700, fontSize: 12,
                  backgroundColor: form.categoria === c.id ? COLORS.header : '#F9FAFB',
                  borderColor: form.categoria === c.id ? COLORS.header : '#E5E7EB',
                  color: form.categoria === c.id ? '#fff' : COLORS.textSecondary,
                }}>{c.emoji} {c.label}</button>
              ))}
            </div>
          </div>

          {/* Patrón vinculado */}
          {patterns.length > 0 && (
            <div>
              <StyledLabel>Vincular a patrón (opcional)</StyledLabel>
              <SelectRow value={form.patron_id || ''} onChange={e => {
                const pat = patterns.find(p => String(p.id) === e.target.value);
                set('patron_id', pat?.id || '');
                set('patron_nombre', pat?.nombre || '');
              }}>
                <option value="">— Sin vincular —</option>
                {patterns.map(p => (
                  <option key={p.id} value={p.id}>{p.emoji || '🧶'} {p.nombre}</option>
                ))}
              </SelectRow>
            </div>
          )}

          {/* Materiales */}
          <div>
            <StyledLabel>Materiales utilizados</StyledLabel>
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
                  onChange={updated => updMat(idx, updated)}
                  onDelete={() => delMat(idx)} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 }}>
              <input value={newMat.nombre} onChange={e => setNewMat(m => ({ ...m, nombre: e.target.value }))}
                placeholder="+ Material" onKeyDown={e => e.key === 'Enter' && addMat()}
                style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', backgroundColor: '#FAFAFA' }} />
              <input type="number" inputMode="decimal" value={newMat.cantidad}
                onChange={e => setNewMat(m => ({ ...m, cantidad: e.target.value }))}
                placeholder="Cant"
                style={{ width: 52, padding: '8px 6px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center', backgroundColor: '#FAFAFA' }} />
              <input type="number" inputMode="decimal" value={newMat.costo_unit}
                onChange={e => setNewMat(m => ({ ...m, costo_unit: e.target.value }))}
                placeholder="$/u"
                style={{ width: 60, padding: '8px 6px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'right', backgroundColor: '#FAFAFA' }} />
              <button onClick={addMat} style={{
                width: 30, height: 30, borderRadius: 15, flexShrink: 0,
                backgroundColor: COLORS.header, border: 'none',
                color: '#fff', fontSize: 18, cursor: 'pointer', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            </div>
          </div>

          {/* Horas + Costo hora */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <StyledLabel>Horas trabajadas</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.horas}
                onChange={e => set('horas', e.target.value)} placeholder="0" />
            </div>
            <div>
              <StyledLabel>Costo por hora ($)</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.costo_hora}
                onChange={e => set('costo_hora', e.target.value)} placeholder="60" />
            </div>
          </div>

          {/* Overhead + Margen */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <StyledLabel>Overhead (%)</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.overhead_pct}
                onChange={e => set('overhead_pct', e.target.value)} placeholder="10" />
            </div>
            <div>
              <StyledLabel>Margen de ganancia (%)</StyledLabel>
              <StyledInput type="number" inputMode="decimal" value={form.margen_pct}
                onChange={e => set('margen_pct', e.target.value)} placeholder="30" />
            </div>
          </div>

          {/* Desglose costing */}
          <div style={{ backgroundColor: '#F5F0EB', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
              🧮 Desglose de costos
            </div>
            {[
              { label: `Materiales (${form.materiales.length} items)`,  val: costingCalc.costoMateriales, color: COLORS.textPrimary },
              { label: `Mano de obra (${form.horas || 0}h × $${form.costo_hora || 60})`, val: costoMO, color: COLORS.textPrimary },
              { label: 'Subtotal',                                        val: costingCalc.subtotal,   color: COLORS.textPrimary, border: true },
              { label: `Overhead (${form.overhead_pct || 10}%)`,         val: overAmt,                  color: '#92400E' },
              { label: `Ganancia (${form.margen_pct || 30}%)`,           val: gainAmt,                  color: '#065F46' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderTop: r.border ? '1px solid #D1D5DB' : 'none', paddingTop: r.border ? 6 : 0, marginTop: r.border ? 2 : 0 }}>
                <span style={{ color: COLORS.textSecondary }}>{r.label}</span>
                <span style={{ fontWeight: r.bold ? 900 : 700, color: r.color }}>${r.val.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1A1A2E', paddingTop: 8, marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>Precio sugerido</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E' }}>${suggestedPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Precio final */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <StyledLabel>💰 Precio final</StyledLabel>
              {form.precio_manual && (
                <button onClick={() => set('precio_manual', false)} style={{
                  background: 'none', border: 'none', fontSize: 11, fontWeight: 800,
                  color: COLORS.header, cursor: 'pointer', fontFamily: 'inherit',
                }}>↩ Usar sugerido</button>
              )}
            </div>
            <StyledInput type="number" inputMode="decimal" value={form.precio_final}
              onChange={e => { set('precio_final', e.target.value); set('precio_manual', true); }}
              placeholder={String(suggestedPrice)}
              style={{
                fontSize: 20, fontWeight: 900,
                borderColor: form.precio_manual ? COLORS.header : '#E5E7EB',
                color: form.precio_manual ? COLORS.header : '#059669',
              }} />
            {form.precio_manual && (
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                ✏️ Precio personalizado · sugerido: ${suggestedPrice.toFixed(2)}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════
              SECCIÓN 2 — Tienda
             ══════════════════════════════════════════════════════ */}
          <Toggle label="🏪 Crear en Tienda" value={form.saveToStore} onChange={v => set('saveToStore', v)} />

          {form.saveToStore && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <StyledLabel>Piezas en stock</StyledLabel>
                  <StyledInput type="number" inputMode="numeric" value={form.stock_inicial}
                    onChange={e => set('stock_inicial', e.target.value)} placeholder="1" />
                </div>
                <div>
                  <StyledLabel>Color de tarjeta</StyledLabel>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 6 }}>
                    {COLORS_PALETTE.map(c => (
                      <button key={c} onClick={() => set('color_hex', c)} style={{
                        width: 26, height: 26, borderRadius: 13, backgroundColor: c,
                        border: form.color_hex === c ? '3px solid #1A1A2E' : '2px solid #E5E7EB',
                        cursor: 'pointer',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <StyledLabel>Descripción (opcional)</StyledLabel>
                <StyledTextarea value={form.descripcion || ''} onChange={e => set('descripcion', e.target.value)}
                  placeholder="Notas sobre este producto…" rows={2} style={{ resize: 'none' }} />
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════
              SECCIÓN 3 — Lista de Precios
             ══════════════════════════════════════════════════════ */}
          <Toggle label="💰 Agregar a Lista de Precios" value={form.saveToPriceList} onChange={v => set('saveToPriceList', v)} />

          {form.saveToPriceList && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <StyledLabel>Tamaño</StyledLabel>
                  <StyledInput value={form.size} onChange={e => set('size', e.target.value)}
                    placeholder="Ej: 4 - 6 cm" />
                </div>
                <div>
                  <StyledLabel>Costo empaque ($)</StyledLabel>
                  <StyledInput type="number" inputMode="decimal" value={form.costo_empaque}
                    onChange={e => set('costo_empaque', e.target.value)} placeholder="0" />
                </div>
              </div>
              <div>
                <StyledLabel>Nota / inventario</StyledLabel>
                <StyledInput value={form.nota} onChange={e => set('nota', e.target.value)}
                  placeholder="Ej: Lleva 1, Sobre pedido" />
              </div>

              {/* Desglose boutique */}
              {boutiqueCalc && (
                <div style={{ backgroundColor: '#F5F0EB', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                    Precios calculados (boutique)
                  </div>
                  {[
                    { label: 'Costo total',       val: boutiqueCalc.costo_total,     color: COLORS.textPrimary },
                    { label: '→ Precio boutique', val: boutiqueCalc.precio_boutique, color: '#059669', bold: true },
                    { label: '→ Precio público',  val: boutiqueCalc.precio_publico,  color: '#1D4ED8', bold: true },
                    { label: 'Tu utilidad',       val: boutiqueCalc.utilidad_tuya,   color: '#92400E' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: COLORS.textSecondary }}>{r.label}</span>
                      <span style={{ fontWeight: r.bold ? 900 : 700, color: r.color }}>${r.val.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Notas (generales) */}
          <div>
            <StyledLabel>📝 Notas (opcional)</StyledLabel>
            <StyledTextarea value={form.notas || ''} onChange={e => set('notas', e.target.value)}
              placeholder="Observaciones del desglose…" rows={2} style={{ resize: 'none' }} />
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
