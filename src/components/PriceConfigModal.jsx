import React, { useState, useEffect } from 'react';
import { COLORS, Z_INDEX, ANIMATION } from '../lib/constants';
import { StyledInput, StyledLabel } from './FormFields';
import { calcPreciosCanal } from '../lib/pricing';

const DEFAULTS = { tarifa_hora: 60, margen_propio: 0.20, margen_boutique: 0.35, redondeo: 0 };

const REDONDEOS = [
  { id: 0,  label: 'Sin redondeo' },
  { id: 5,  label: '$5' },
  { id: 10, label: '$10' },
];

export default function PriceConfigModal({ visible, config, onSave, onClose }) {
  const [form, setForm] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && config) {
      setForm({
        tarifa_hora:     config.tarifa_hora     || config.pago_por_hora || DEFAULTS.tarifa_hora,
        margen_propio:   config.margen_propio   ?? DEFAULTS.margen_propio,
        margen_boutique: config.margen_boutique ?? DEFAULTS.margen_boutique,
        redondeo:        config.redondeo ?? DEFAULTS.redondeo,
      });
    } else if (visible) {
      setForm(DEFAULTS);
    }
  }, [visible, config]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const preview = calcPreciosCanal({
    costo_base: 100,
    config: {
      margen_propio:   Number(form.margen_propio)   || DEFAULTS.margen_propio,
      margen_boutique: Number(form.margen_boutique) || DEFAULTS.margen_boutique,
      redondeo:        Number(form.redondeo) || 0,
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        tarifa_hora:     Number(form.tarifa_hora)     || DEFAULTS.tarifa_hora,
        margen_propio:   Number(form.margen_propio)   || DEFAULTS.margen_propio,
        margen_boutique: Number(form.margen_boutique) || DEFAULTS.margen_boutique,
        redondeo:        Number(form.redondeo)        || 0,
        // alias para compatibilidad con usePriceConfig
        pago_por_hora:   Number(form.tarifa_hora)     || DEFAULTS.tarifa_hora,
      });
    } finally { setSaving(false); }
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '92vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 48px',
        animation: ANIMATION.slideUp,
      }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>⚙️ Configurar precios</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <StyledLabel>💰 Tarifa por hora ($)</StyledLabel>
            <StyledInput type="number" inputMode="decimal" value={form.tarifa_hora}
              onChange={e => set('tarifa_hora', e.target.value)}
              placeholder="60" style={{ textAlign: 'center', fontWeight: 700, padding: '11px 14px', fontSize: 16 }} />
          </div>

          <div>
            <StyledLabel>📊 Margen propio (%)</StyledLabel>
            <StyledInput type="number" inputMode="decimal" value={(Number(form.margen_propio) * 100).toFixed(0)}
              onChange={e => set('margen_propio', (Number(e.target.value) || 0) / 100)}
              placeholder="20" style={{ textAlign: 'center', fontWeight: 700, padding: '11px 14px', fontSize: 16 }} />
          </div>

          <div>
            <StyledLabel>📈 Margen boutique (%)</StyledLabel>
            <StyledInput type="number" inputMode="decimal" value={(Number(form.margen_boutique) * 100).toFixed(0)}
              onChange={e => set('margen_boutique', (Number(e.target.value) || 0) / 100)}
              placeholder="35" style={{ textAlign: 'center', fontWeight: 700, padding: '11px 14px', fontSize: 16 }} />
          </div>

          <div>
            <StyledLabel>🔢 Redondeo de precios</StyledLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {REDONDEOS.map(r => (
                <button key={r.id} onClick={() => set('redondeo', r.id)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 13,
                  backgroundColor: Number(form.redondeo) === r.id ? '#1A1A2E' : '#F9FAFB',
                  borderColor:     Number(form.redondeo) === r.id ? '#1A1A2E' : '#E5E7EB',
                  color:           Number(form.redondeo) === r.id ? '#FAD2E1' : COLORS.textSecondary,
                }}>{r.label}</button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ backgroundColor: '#F5F0EB', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 11, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, textAlign: 'center' }}>
              Vista previa · producto ejemplo (costo $100)
            </div>
            {[
              { label: 'Costo base',       val: 100, color: COLORS.textPrimary },
              { label: '→ Precio público', val: preview.precio_publico,  color: '#1D4ED8', bold: true },
              { label: '→ Precio boutique', val: preview.precio_boutique, color: '#059669', bold: true },
              { label: 'Utilidad propia',  val: preview.precio_publico - 100, color: '#92400E' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: COLORS.textSecondary }}>{r.label}</span>
                <span style={{ fontWeight: r.bold ? 900 : 700, color: r.color }}>${r.val.toFixed(2)}</span>
              </div>
            ))}
          </div>

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
              color: '#FAD2E1', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Guardando…' : '💾 Guardar configuración'}</button>
          </div>

        </div>
      </div>
    </div>
  );
}