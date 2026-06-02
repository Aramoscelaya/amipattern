import React, { useState, useEffect } from 'react';
import { COLORS } from '../lib/constants';

export default function SaleModal({ visible, product, events, onClose, onSave }) {
  const [cantidad,   setCantidad]   = useState('1');
  const [precioUnit, setPrecioUnit] = useState('');
  const [eventId,    setEventId]    = useState('');
  const [fecha,      setFecha]      = useState('');
  const [notas,      setNotas]      = useState('');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (visible && product) {
      setCantidad('1');
      setPrecioUnit(String(product.precio_venta || ''));
      setEventId('');
      setFecha(new Date().toISOString().slice(0, 10));
      setNotas('');
    }
  }, [visible, product]);

  if (!visible || !product) return null;

  const disponible = (product.stock_inicial || 0) - (product.stock_vendido || 0);
  const cant       = Number(cantidad)   || 0;
  const precio     = Number(precioUnit) || 0;
  const total      = cant * precio;

  const handleSave = async () => {
    if (cant <= 0)         return alert('La cantidad debe ser mayor a 0');
    if (cant > disponible) return alert(`Solo tienes ${disponible} piezas disponibles`);
    const event = events.find(e => String(e.id) === String(eventId)) || null;
    setSaving(true);
    try {
      await onSave({ product, event, cantidad: cant, precio_unit: precio, fecha, notas });
    } finally { setSaving(false); }
  };

  const INPUT = {
    width: '100%', boxSizing: 'border-box',
    backgroundColor: '#F9FAFB', borderRadius: 10,
    border: '1.5px solid #E5E7EB',
    padding: '10px 12px', fontSize: 14, color: COLORS.textPrimary,
    outline: 'none', fontFamily: 'inherit',
  };
  const LABEL = {
    fontSize: 12, fontWeight: 800, color: COLORS.textSecondary,
    marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 40px',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>💸 Registrar venta</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
              {product.emoji} {product.nombre} · {disponible} disponibles
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Cantidad + Precio */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <span style={LABEL}>Cantidad</span>
              <input type="number" inputMode="numeric" value={cantidad}
                onChange={e => setCantidad(e.target.value)}
                min={1} max={disponible} style={INPUT} />
            </div>
            <div>
              <span style={LABEL}>Precio unitario ($)</span>
              <input type="number" inputMode="decimal" value={precioUnit}
                onChange={e => setPrecioUnit(e.target.value)}
                placeholder={String(product.precio_venta || '0')} style={INPUT} />
            </div>
          </div>

          {/* Total calculado */}
          <div style={{
            backgroundColor: '#F0FDF4', borderRadius: 12,
            padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, color: '#065F46', fontSize: 14 }}>Total de esta venta</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#059669' }}>${total.toFixed(2)}</span>
          </div>

          {/* Evento / lugar */}
          <div>
            <span style={LABEL}>¿Dónde vendiste? (opcional)</span>
            <select value={eventId} onChange={e => setEventId(e.target.value)} style={INPUT}>
              <option value="">— Sin evento —</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.nombre}</option>
              ))}
            </select>
            {events.length === 0 && (
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 5 }}>
                💡 Crea un lugar de venta desde la pantalla principal antes de vender
              </div>
            )}
          </div>

          {/* Fecha */}
          <div>
            <span style={LABEL}>Fecha</span>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={INPUT} />
          </div>

          {/* Notas */}
          <div>
            <span style={LABEL}>Notas (opcional)</span>
            <input value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej: precio especial, cliente frecuente…" style={INPUT} />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: '2px solid #E5E7EB', background: 'transparent',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving || cant > disponible} style={{
              flex: 2, padding: 14, borderRadius: 12,
              backgroundColor: cant > disponible ? '#9CA3AF' : '#059669',
              border: 'none', color: '#fff', fontWeight: 800,
              cursor: cant > disponible ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', fontSize: 14, opacity: saving ? 0.7 : 1,
            }}>{saving ? 'Guardando…' : '✅ Confirmar venta'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
