import React, { useState, useEffect } from 'react';
import { TIPOS_EVENTO } from '../hooks/useStore';
import { COLORS } from '../lib/constants';

export default function StoreEventModal({ visible, initial, onClose, onSave }) {
  const blank = { nombre: '', tipo: 'bazar', fecha_inicio: '', fecha_fin: '', notas: '', activo: true };
  const [form,   setForm]   = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setForm(initial ? { ...initial } : blank);
  }, [visible, initial]);

  if (!visible) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 650, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '88vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 40px',
        animation: 'slideUp 0.25s ease',
      }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>
            {initial ? '✏️ Editar evento' : '🏪 Nuevo lugar / evento'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Nombre */}
          <div>
            <span style={LABEL}>Nombre del evento / lugar *</span>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Bazar Navidad 2025, Papelería Luna…" style={INPUT} />
          </div>

          {/* Tipo */}
          <div>
            <span style={LABEL}>Tipo</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TIPOS_EVENTO.map(t => (
                <button key={t.id} onClick={() => set('tipo', t.id)} style={{
                  padding: '7px 12px', borderRadius: 99,
                  border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: 700, fontSize: 12,
                  backgroundColor: form.tipo === t.id ? '#1A1A2E' : '#F9FAFB',
                  borderColor: form.tipo === t.id ? '#1A1A2E' : '#E5E7EB',
                  color: form.tipo === t.id ? '#fff' : COLORS.textSecondary,
                }}>{t.emoji} {t.label}</button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={LABEL}>Fecha inicio</span>
              <input type="date" value={form.fecha_inicio || ''} onChange={e => set('fecha_inicio', e.target.value)} style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Fecha fin</span>
              <input type="date" value={form.fecha_fin || ''} onChange={e => set('fecha_fin', e.target.value)} style={INPUT} />
            </div>
          </div>

          {/* Notas */}
          <div>
            <span style={LABEL}>Notas (opcional)</span>
            <textarea value={form.notas || ''} onChange={e => set('notas', e.target.value)}
              placeholder="Ubicación, contacto, horarios…"
              rows={2} style={{ ...INPUT, resize: 'none' }} />
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
              color: '#fff', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Guardando…' : initial ? 'Guardar cambios' : '+ Crear evento'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
