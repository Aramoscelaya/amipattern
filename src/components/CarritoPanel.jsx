import React, { useState } from 'react';
import { COLORS, Z_INDEX, ANIMATION } from '../lib/constants';
import { StyledTextarea } from './FormFields';

export default function CarritoPanel({ visible = true, items, onChangeQty, onRemove, onCobrar, canal, onClose }) {
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notas,      setNotas]      = useState('');
  const [cobrando,   setCobrando]   = useState(false);

  const total = items.reduce((s, i) => s + (i.subtotal || 0), 0);
  const piezas = items.reduce((s, i) => s + (i.cantidad || 0), 0);

  const handleCobrar = async () => {
    if (items.length === 0) return;
    setCobrando(true);
    try {
      await onCobrar({ items, metodoPago, notas });
    } finally {
      setCobrando(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '88vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 32px',
        animation: ANIMATION.slideUp,
      }}>
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>🛒 Carrito</div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
              {canal ? `${canal.emoji || '🏪'} ${canal.nombre}` : 'Sin canal seleccionado'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: COLORS.textMuted }}>
            <div style={{ fontSize: 44 }}>🛒</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 10 }}>Agrega productos para comenzar</div>
          </div>
        ) : (
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div key={item.product.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                backgroundColor: '#F9FAFB', borderRadius: 12,
                padding: '10px 12px', border: '1px solid #F3F4F6',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  backgroundColor: item.product.color_hex || '#FAD2E1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{item.product.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: COLORS.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.nombre}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>${Number(item.precio_unit || 0).toFixed(2)} c/u</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => onChangeQty(item.product.id, item.cantidad - 1)} style={{
                    width: 26, height: 26, borderRadius: 7, border: '1px solid #E5E7EB',
                    background: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>−</button>
                  <input type="number" min="1" value={item.cantidad}
                    onChange={e => onChangeQty(item.product.id, Number(e.target.value))}
                    style={{ width: 42, textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: 7, padding: '4px 2px', fontSize: 13, fontWeight: 800, outline: 'none', fontFamily: 'inherit' }} />
                  <button onClick={() => onChangeQty(item.product.id, item.cantidad + 1)} style={{
                    width: 26, height: 26, borderRadius: 7, border: '1px solid #E5E7EB',
                    background: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>+</button>
                </div>
                <span style={{ fontWeight: 900, fontSize: 13, color: COLORS.textPrimary, minWidth: 58, textAlign: 'right' }}>
                  ${Number(item.subtotal || 0).toFixed(2)}
                </span>
                <button onClick={() => onRemove(item.product.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#EF4444', fontSize: 16, fontWeight: 900, padding: 0, flexShrink: 0,
                }}>×</button>
              </div>
            ))}

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '2px solid #1A1A2E', marginTop: 6, paddingTop: 10,
            }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: COLORS.textPrimary }}>
                Total ({piezas} pieza{piezas !== 1 ? 's' : ''})
              </span>
              <span style={{ fontWeight: 900, fontSize: 22, color: COLORS.textPrimary }}>
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Método de pago */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>💳 Método de pago</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'efectivo',      label: '💵 Efectivo' },
                  { id: 'transferencia', label: '🏦 Transferencia' },
                ].map(m => (
                  <button key={m.id} onClick={() => setMetodoPago(m.id)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit',
                    fontWeight: 700, fontSize: 13,
                    backgroundColor: metodoPago === m.id ? '#1A1A2E' : '#F9FAFB',
                    borderColor: metodoPago === m.id ? '#1A1A2E' : '#E5E7EB',
                    color: metodoPago === m.id ? '#FAD2E1' : COLORS.textSecondary,
                  }}>{m.label}</button>
                ))}
              </div>
            </div>

            {/* Notas */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>📝 Notas (opcional)</div>
              <StyledTextarea value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Detalles de la venta…" style={{ minHeight: 56 }} />
            </div>

            {/* Botón cobrar */}
            <button onClick={handleCobrar} disabled={cobrando} style={{
              width: '100%', padding: 14, borderRadius: 12,
              backgroundColor: cobrando ? '#9CA3AF' : '#059669', border: 'none',
              color: '#fff', fontWeight: 900, fontSize: 15,
              cursor: cobrando ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}>
              {cobrando ? '⏳ Cobrando…' : `💰 Cobrar $${total.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}