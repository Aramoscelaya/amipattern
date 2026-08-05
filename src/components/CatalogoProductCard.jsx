import React from 'react';
import { CATEGORIAS } from '../lib/constants';
import { COLORS } from '../lib/constants';
import { calcPreciosCanal } from '../lib/pricing';

const ESTADO_CFG = {
  activo:         { label: '🟢 Activo',        bg: '#D1FAE5', fg: '#065F46' },
  bajo_pedido:    { label: '🟡 Bajo pedido',   bg: '#FEF3C7', fg: '#92400E' },
  descontinuado:  { label: '🔴 Descontinuado', bg: '#FEE2E2', fg: '#991B1B' },
};

export default function CatalogoProductCard({ product, config, onEdit, onDelete }) {
  const cfg = {
    margen_propio:   config?.margen_propio   ?? 0.20,
    margen_boutique: config?.margen_boutique ?? 0.35,
    redondeo:        config?.redondeo ?? 0,
  };

  const disponible  = (product.stock_inicial || 0) - (product.stock_vendido || 0);
  const costoBase   = Number(product.costo_base)   || 0;
  const precioPub   = Number(product.precio_venta) || 0;
  const precioBout  = Number(product.precio_boutique) || 0;

  const auto = costoBase > 0 ? calcPreciosCanal({ costo_base: costoBase, config: cfg }) : null;
  const pubFinal   = precioPub  > 0 ? precioPub  : (auto?.precio_publico || 0);
  const boutFinal  = precioBout > 0 ? precioBout : (auto?.precio_boutique || 0);

  const utilPub  = pubFinal  - costoBase;
  const utilBout = boutFinal - costoBase;
  const margenPub  = pubFinal  > 0 ? (utilPub  / pubFinal)  * 100 : 0;
  const margenBout = boutFinal > 0 ? (utilBout / boutFinal) * 100 : 0;

  const estadoObj = ESTADO_CFG[product.estado_catalogo] || ESTADO_CFG.activo;
  const catLabel  = CATEGORIAS.find(c => c.id === product.categoria)?.label || product.categoria;

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 16, padding: 14,
      border: '1.5px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          backgroundColor: product.color_hex || '#FAD2E1',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>{product.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.nombre}
          </div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>
            {catLabel}
          </div>
        </div>
        <span style={{
          backgroundColor: estadoObj.bg, color: estadoObj.fg,
          borderRadius: 99, padding: '3px 8px', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap',
        }}>{estadoObj.label}</span>
      </div>

      {/* Stock */}
      <div style={{ display: 'flex', gap: 6 }}>
        <span style={{
          flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 800,
          backgroundColor: disponible <= 0 ? '#FEF2F2' : '#F0FDF4',
          color: disponible <= 0 ? '#EF4444' : '#059669', borderRadius: 8, padding: '5px 0',
        }}>📦 {Math.max(0, disponible)} disp.</span>
        <span style={{
          flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 800,
          backgroundColor: '#F3F4F6', color: COLORS.textSecondary, borderRadius: 8, padding: '5px 0',
        }}>🔄 {(product.stock_vendido || 0)} vend.</span>
      </div>

      {/* Costo base */}
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>
        Costo base: <strong style={{ color: COLORS.textPrimary }}>${costoBase.toFixed(2)}</strong>
      </div>

      {/* Precios por canal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, padding: '8px 10px' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>Público</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#1D4ED8' }}>${pubFinal.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 700 }}>
            <div style={{ color: '#16A34A' }}>+${Math.max(0, utilPub).toFixed(2)}</div>
            <div style={{ color: COLORS.textMuted }}>{margenPub.toFixed(0)}% util.</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, padding: '8px 10px' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>Boutique</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>${boutFinal.toFixed(2)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 700 }}>
            <div style={{ color: '#16A34A' }}>+${Math.max(0, utilBout).toFixed(2)}</div>
            <div style={{ color: COLORS.textMuted }}>{margenBout.toFixed(0)}% util.</div>
          </div>
        </div>
      </div>

      {/* Tiempo elaboración */}
      {product.tiempo_elaboracion && (
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
          ⏱️ <strong style={{ color: COLORS.textPrimary }}>{product.tiempo_elaboracion}</strong>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button onClick={() => onEdit(product)} style={{
          flex: 1, padding: '8px 0', borderRadius: 10,
          border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB',
          fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: COLORS.textSecondary,
        }}>✏️ Editar</button>
        <button onClick={() => onDelete(product.id)} style={{
          flex: 1, padding: '8px 0', borderRadius: 10,
          border: '1.5px solid #FECACA', backgroundColor: '#FEF2F2',
          fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#EF4444',
        }}>🗑 Eliminar</button>
      </div>
    </div>
  );
}