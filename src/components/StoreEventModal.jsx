import React, { useState, useEffect } from 'react';
import { TIPOS_EVENTO } from '../lib/constants';
import { COLORS, Z_INDEX, ANIMATION } from '../lib/constants';
import { StyledInput, StyledLabel, StyledTextarea } from './FormFields';

const BLANK_EVENT = { nombre: '', tipo: 'bazar', fecha_inicio: '', fecha_fin: '', notas: '', activo: true };

export default function StoreEventModal({ visible, initial, onClose, onSave }) {
  const [form,   setForm]   = useState(BLANK_EVENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setForm(initial ? { ...initial } : BLANK_EVENT);
  }, [visible, initial]);

  if (!visible) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };



  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '88vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 40px',
        animation: ANIMATION.slideUp,
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
            <StyledLabel>Nombre del evento / lugar *</StyledLabel>
            <StyledInput value={form.nombre} onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Bazar Navidad 2025, Papelería Luna…" />
          </div>

          {/* Tipo */}
          <div>
            <StyledLabel>Tipo</StyledLabel>
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
              <StyledLabel>Fecha inicio</StyledLabel>
              <StyledInput type="date" value={form.fecha_inicio || ''} onChange={e => set('fecha_inicio', e.target.value)} />
            </div>
            <div>
              <StyledLabel>Fecha fin</StyledLabel>
              <StyledInput type="date" value={form.fecha_fin || ''} onChange={e => set('fecha_fin', e.target.value)} />
            </div>
          </div>

          {/* Notas */}
          <div>
            <StyledLabel>Notas (opcional)</StyledLabel>
            <StyledTextarea value={form.notas || ''} onChange={e => set('notas', e.target.value)}
              placeholder="Ubicación, contacto, horarios…"
              rows={2} style={{ resize: 'none' }} />
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
