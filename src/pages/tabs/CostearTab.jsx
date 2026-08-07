import React, { useState, useMemo } from 'react';
import WhatsAppCotizacionModal from '../../components/WhatsAppCotizacionModal';
import { CATEGORIAS } from '../../lib/constants';
import { useToast } from '../../components/Toast';
import { COLORS, Z_INDEX, PRICING_DEFAULTS } from '../../lib/constants';
import { calcPreciosCanal } from '../../lib/pricing';
import { StyledInput, StyledLabel, SelectRow } from '../../components/FormFields';

const MODOS = [
  { id: 'nueva',       label: '✨ Nueva pieza' },
  { id: 'actualizar',  label: '✏️ Actualizar existente' },
  { id: 'prueba',      label: '🧪 Prueba (no guardar)' },
];

const BLANK = {
  nombre: '', emoji: '🧸', categoria: 'amigurumi',
  patron_id: '', patron_nombre: '',
  materiales: [],
  horas: '', costo_hora: String(PRICING_DEFAULTS.costo_hora),
  empaque: '', tiempoEntrega: '',
};

function MatRow({ mat, onChange, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input value={mat.nombre} onChange={e => onChange({ ...mat, nombre: e.target.value })}
        placeholder="Material"
        style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', backgroundColor: '#F9FAFB' }} />
      <input type="number" inputMode="decimal" value={mat.cantidad}
        onChange={e => onChange({ ...mat, cantidad: e.target.value })}
        placeholder="Cant"
        style={{ width: 52, padding: '8px 6px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center', backgroundColor: '#F9FAFB' }} />
      <input type="number" inputMode="decimal" value={mat.costo_unit}
        onChange={e => onChange({ ...mat, costo_unit: e.target.value })}
        placeholder="$/u"
        style={{ width: 60, padding: '8px 6px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'right', backgroundColor: '#F9FAFB' }} />
      <button onClick={onDelete} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#EF4444', padding: '4px 2px', flexShrink: 0 }}>✕</button>
    </div>
  );
}

export default function CostearTab({ products, config, patterns = [], saveCosting, onOpenWhatsApp, onClose, isOnline = true, pendingCount = 0 }) {
  const { showToast } = useToast();

  const [modo,       setModo]       = useState('nueva');
  const [form,       setForm]       = useState(BLANK);
  const [updId,      setUpdId]      = useState('');
  const [newMat,     setNewMat]     = useState({ nombre: '', cantidad: '', costo_unit: '' });
  const [saving,     setSaving]     = useState(false);
  const [waModal,    setWaModal]    = useState(false);

  const cfg = useMemo(() => ({
    margen_propio:   config?.margen_propio   ?? 0.20,
    margen_boutique: config?.margen_boutique ?? 0.35,
    redondeo:        config?.redondeo ?? 0,
  }), [config?.margen_propio, config?.margen_boutique, config?.redondeo]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectUpd = (id) => {
    setUpdId(id);
    const p = products.find(x => String(x.id) === String(id));
    if (p) {
      setForm(f => ({
        ...f,
        nombre: p.nombre, emoji: p.emoji || '🧸', categoria: p.categoria || 'amigurumi',
        costo_hora: String(config?.tarifa_hora || PRICING_DEFAULTS.costo_hora),
        horas: '', empaque: '',
      }));
    }
  };

  const addMat = () => {
    if (!newMat.nombre.trim()) return;
    setForm(f => ({ ...f, materiales: [...f.materiales, { ...newMat, id: Date.now() }] }));
    setNewMat({ nombre: '', cantidad: '', costo_unit: '' });
  };
  const updMat = (idx, updated) => setForm(f => ({ ...f, materiales: f.materiales.map((m, i) => i === idx ? updated : m) }));
  const delMat = (idx) => setForm(f => ({ ...f, materiales: f.materiales.filter((_, i) => i !== idx) }));

  const coste = useMemo(() => {
    const materiales = form.materiales.reduce((s, m) => s + (Number(m.cantidad) || 0) * (Number(m.costo_unit) || 0), 0);
    const manoObra   = (Number(form.horas)    || 0) * (Number(form.costo_hora) || PRICING_DEFAULTS.costo_hora);
    const empaque    = Number(form.empaque)   || 0;
    const costoTotal = materiales + manoObra + empaque;
    const precios    = costoTotal > 0 ? calcPreciosCanal({ costo_base: costoTotal, config: cfg }) : { precio_publico: 0, precio_boutique: 0 };
    return {
      materiales, manoObra, empaque, costoTotal,
      precio_publico:  precios.precio_publico,
      precio_boutique: precios.precio_boutique,
      util_publica:  precios.precio_publico  - costoTotal,
      util_boutique: precios.precio_boutique - costoTotal,
    };
  }, [form.materiales, form.horas, form.costo_hora, form.empaque, cfg]);

  const handleWhatsApp = () => {
    setWaModal(true);
    if (onOpenWhatsApp) onOpenWhatsApp({ visible: true });
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) { showToast('Agrega un nombre'); return; }
    if (modo === 'prueba') { showToast('🧪 Modo prueba — nada se guardó'); return; }
    if (modo === 'actualizar' && !updId) { showToast('Selecciona un producto'); return; }

    const payload = {
      nombre: form.nombre.trim(),
      emoji: form.emoji,
      categoria: form.categoria,
      patron_id: form.patron_id || null,
      patron_nombre: form.patron_nombre || null,
      materiales: form.materiales.map(m => ({
        nombre: m.nombre, cantidad: Number(m.cantidad) || 0, costo_unit: Number(m.costo_unit) || 0,
      })),
      horas: Number(form.horas) || 0,
      costo_hora: Number(form.costo_hora) || PRICING_DEFAULTS.costo_hora,
      costo_total: coste.costoTotal,
      costo_empaque: Number(form.empaque) || 0,
      precio_final: coste.precio_publico,
      precio_boutique: coste.precio_boutique,
      tiempo_entrega: form.tiempoEntrega.trim() || null,
      overhead_pct: 0,
      margen_pct: 0,
    };

    setSaving(true);
    try {
      if (modo === 'nueva') {
        await saveCosting(payload, { createProduct: true });
        showToast('✨ Producto creado en catálogo');
      } else if (modo === 'actualizar') {
        await saveCosting(payload, { updateProduct: updId });
        showToast('✏️ Producto actualizado');
      }
    } catch (e) {
      showToast('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'inherit', paddingBottom: 120 }}>

      {/* Header */}
      <div style={{
        backgroundColor: COLORS.header,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: Z_INDEX.header,
      }}>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#4B5563', padding: '4px 4px 4px 0', fontFamily: 'inherit' }}>←</button>
        )}
        <div style={{ color: '#FAD2E1', fontSize: 18, fontWeight: 900, flex: 1 }}>🧮 Costear</div>
      </div>

      <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {!isOnline && (
          <div style={{
            backgroundColor: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            borderRadius: 12,
            padding: '10px 16px',
            marginBottom: 12,
            fontSize: 13,
            color: '#92400E',
            fontWeight: 700,
          }}>
            Sin conexion — el calculo funciona normalmente.
            Al guardar, se sincroniza cuando vuelvas a tener internet.
          </div>
        )}

        {/* Selector de modo */}
        <div style={{ display: 'flex', gap: 8 }}>
          {MODOS.map(m => (
            <button key={m.id} onClick={() => setModo(m.id)} style={{
              flex: 1, padding: '10px 4px', borderRadius: 10,
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 800, fontSize: 12, textAlign: 'center',
              backgroundColor: modo === m.id ? '#1A1A2E' : '#fff',
              borderColor:     modo === m.id ? '#1A1A2E' : '#E5E7EB',
              color:           modo === m.id ? '#FAD2E1' : COLORS.textSecondary,
            }}>{m.label}</button>
          ))}
        </div>

        {modo === 'actualizar' && (
          <div>
            <StyledLabel>Producto a actualizar</StyledLabel>
            <SelectRow value={updId} onChange={e => selectUpd(e.target.value)}>
              <option value="">— Selecciona un producto —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.emoji} {p.nombre}</option>
              ))}
            </SelectRow>
          </div>
        )}

        {/* Identidad */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div>
            <StyledLabel>Emoji</StyledLabel>
            <StyledInput value={form.emoji} onChange={e => set('emoji', e.target.value)}
              style={{ width: 52, textAlign: 'center', fontWeight: 800 }} />
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
                padding: '7px 12px', borderRadius: 99,
                border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 700, fontSize: 12,
                backgroundColor: form.categoria === c.id ? COLORS.header : '#F9FAFB',
                borderColor:     form.categoria === c.id ? COLORS.header : '#E5E7EB',
                color:           form.categoria === c.id ? '#fff' : COLORS.textSecondary,
              }}>{c.emoji} {c.label}</button>
            ))}
          </div>
        </div>

        {/* Patrón */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              {form.materiales.map((mat, idx) => (
                <MatRow key={mat.id || idx} mat={mat}
                  onChange={u => updMat(idx, u)}
                  onDelete={() => delMat(idx)} />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input value={newMat.nombre} onChange={e => setNewMat(m => ({ ...m, nombre: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addMat()} placeholder="+ Material"
              style={{ flex: 2, padding: '8px 10px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', backgroundColor: '#FAFAFA' }} />
            <input type="number" value={newMat.cantidad} onChange={e => setNewMat(m => ({ ...m, cantidad: e.target.value }))}
              placeholder="Cant" style={{ width: 52, padding: '8px 6px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'center', backgroundColor: '#FAFAFA' }} />
            <input type="number" value={newMat.costo_unit} onChange={e => setNewMat(m => ({ ...m, costo_unit: e.target.value }))}
              placeholder="$/u" style={{ width: 60, padding: '8px 6px', borderRadius: 8, border: '1.5px dashed #D1D5DB', fontSize: 13, fontFamily: 'inherit', outline: 'none', textAlign: 'right', backgroundColor: '#FAFAFA' }} />
            <button onClick={addMat} style={{
              width: 30, height: 30, borderRadius: 15, flexShrink: 0,
              backgroundColor: COLORS.header, border: 'none', color: '#fff',
              fontSize: 18, cursor: 'pointer', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          </div>
        </div>

        {/* Horas + tarifa + empaque */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <StyledLabel>Horas trabajadas</StyledLabel>
            <StyledInput type="number" value={form.horas} onChange={e => set('horas', e.target.value)} placeholder="0" />
          </div>
          <div>
            <StyledLabel>Tarifa hora ($)</StyledLabel>
            <StyledInput type="number" value={form.costo_hora} onChange={e => set('costo_hora', e.target.value)} placeholder="60" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <StyledLabel>📦 Empaque y otros ($)</StyledLabel>
            <StyledInput type="number" value={form.empaque} onChange={e => set('empaque', e.target.value)} placeholder="0" />
          </div>
          <div>
            <StyledLabel>⏱️ Tiempo de entrega</StyledLabel>
            <StyledInput value={form.tiempoEntrega} onChange={e => set('tiempoEntrega', e.target.value)} placeholder="Ej: 7 días" />
          </div>
        </div>

        {/* Desglose en vivo */}
        <div style={{ backgroundColor: '#F5F0EB', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            🧮 Desglose en tiempo real
          </div>
          {[
            { label: 'Materiales',            val: coste.materiales,    color: COLORS.textPrimary },
            { label: `Mano de obra (${form.horas || 0}h × $${form.costo_hora || 60})`, val: coste.manoObra, color: COLORS.textPrimary },
            { label: 'Empaque / otros',       val: coste.empaque,       color: COLORS.textPrimary },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: COLORS.textSecondary }}>{r.label}</span>
              <span style={{ fontWeight: 700, color: r.color }}>${r.val.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D1D5DB', paddingTop: 6, fontSize: 14 }}>
            <span style={{ fontWeight: 800, color: COLORS.textPrimary }}>Costo total</span>
            <span style={{ fontWeight: 900, color: COLORS.textPrimary }}>${coste.costoTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: COLORS.textSecondary }}>→ Precio público</span>
            <span style={{ fontWeight: 900, color: '#1D4ED8' }}>${coste.precio_publico.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: COLORS.textSecondary }}>→ Precio boutique</span>
            <span style={{ fontWeight: 900, color: '#059669' }}>${coste.precio_boutique.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #D1D5DB', paddingTop: 6, fontSize: 13 }}>
            <span style={{ color: COLORS.textSecondary }}>Utilidad pública</span>
            <span style={{ fontWeight: 700, color: Math.max(0, coste.util_publica) === coste.util_publica ? '#16A34A' : '#EF4444' }}>${coste.util_publica.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: COLORS.textSecondary }}>Utilidad boutique</span>
            <span style={{ fontWeight: 700, color: Math.max(0, coste.util_boutique) === coste.util_boutique ? '#16A34A' : '#EF4444' }}>${coste.util_boutique.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones */}
        <button onClick={handleWhatsApp} style={{
          width: '100%', padding: 14, borderRadius: 12,
          backgroundColor: '#25D366', border: 'none', color: '#fff',
          fontWeight: 900, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
        }}>💬 Enviar cotización WhatsApp</button>

        <button onClick={handleSave} disabled={saving} style={{
          width: '100%', padding: 14, borderRadius: 12,
          backgroundColor: modo === 'prueba' ? '#6B7280' : '#1A1A2E', border: 'none', color: '#FAD2E1',
          fontWeight: 900, fontSize: 15, cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? '⏳ Guardando…' : !isOnline ? 'Guardar (pendiente de sync)' : modo === 'prueba' ? '🎯 Solo calcular' : modo === 'actualizar' ? '💾 Guardar cambios' : '✨ Crear en catálogo'}
        </button>

        {modo === 'prueba' && (
          <div style={{ textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: -8 }}>
            🧪 En modo prueba no se guarda nada
          </div>
        )}
      </div>

      <WhatsAppCotizacionModal
        visible={waModal}
        initial={{
          nombre: form.nombre,
          emoji: form.emoji,
          precio: coste.precio_publico.toFixed(2),
          tiempoEntrega: form.tiempoEntrega,
        }}
        onClose={() => setWaModal(false)}
      />
    </div>
  );
}