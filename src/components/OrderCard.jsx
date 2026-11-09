import React, { useState } from 'react';
import WhatsAppCotizacionModal from './WhatsAppCotizacionModal';
import { buildWhatsAppLink, mensajeEstado } from '../lib/whatsapp';
import { COLORS } from '../lib/constants';

const ESTADO_CFG = {
  pendiente:  { label:'⏳ Pendiente',  ...COLORS.warning },
  en_proceso: { label:'🪡 En proceso', ...COLORS.info },
  listo:      { label:'✅ Listo',      ...COLORS.success },
  entregado:  { label:'📦 Entregado',  bg:COLORS.surface2, fg:COLORS.textSecondary },
  cancelado:  { label:'❌ Cancelado',  ...COLORS.danger },
};

export default function OrderCard({ order, onEdit, onDelete, onEstado }) {
  const [cotizModal, setCotizModal] = useState(false);
  const cfg       = ESTADO_CFG[order.estado] || ESTADO_CFG.pendiente;
  const telefono  = order.cliente_telefono || '';
  const hasPhone  = telefono.replace(/\D/g, '').length > 0;

  const saldo     = (order.precio_venta || 0) - (order.anticipo || 0);
  const diasHasta = order.fecha_entrega
    ? Math.ceil((new Date(order.fecha_entrega) - new Date()) / 86400000)
    : null;
  const urgente   = diasHasta !== null && diasHasta <= 2
    && !['entregado','cancelado'].includes(order.estado);

  // Calcular precio sugerido del pedido para comparar con precio_venta
  const calcularSugerido = (order) => {
    const costoMat = (order.materiales || []).reduce(
      (s, m) => s + (Number(m.cantidad) || 0) * (Number(m.costo_unit) || 0), 0
    )
    const costoMO  = (Number(order.horas) || 0) * (Number(order.costo_hora) || 40)
    const subtotal = costoMat + costoMO
    const overhead = subtotal * (1 + (Number(order.overhead_pct) || 10) / 100)
    return overhead * (1 + (Number(order.margen_pct) || 30) / 100)
  }

  const precioSugerido = calcularSugerido(order)
  const precioFinal    = Number(order.precio_venta) || 0
  const diferencia     = precioFinal - precioSugerido
  const pct            = precioSugerido > 0
    ? ((diferencia / precioSugerido) * 100).toFixed(0)
    : 0

  const nextEstado = {
    pendiente: 'en_proceso', en_proceso: 'listo',
    listo: 'entregado', entregado: null, cancelado: null,
  }[order.estado];

  return (
    <div style={{
      backgroundColor:COLORS.card, borderRadius:16,
      boxShadow: urgente
        ? '0 2px 16px rgba(239,68,68,0.18)'
        : '0 2px 10px rgba(0,0,0,0.06)',
      border: urgente ? `1.5px solid ${COLORS.danger.border}` : '1.5px solid transparent',
      overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: urgente
          ? `linear-gradient(135deg,${COLORS.danger.bg},${COLORS.surface2})`
          : `linear-gradient(135deg,${COLORS.header},${COLORS.surface2})`,
        padding:'12px 14px',
        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:26 }}>{order.patron_emoji || '🧶'}</span>
          <div>
            <div style={{
              fontWeight:800, fontSize:13,
              color: urgente ? COLORS.danger.fg : COLORS.accent,
              lineHeight:1.2,
            }}>{order.patron_nombre}</div>
            <div style={{ fontSize:11, color: urgente ? COLORS.danger.fg : COLORS.textMuted, marginTop:1 }}>
              👤 {order.cliente_nombre}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          <button onClick={()=>onEdit(order)} style={{
            background:'rgba(255,255,255,0.15)', border:'none', borderRadius:7,
            width:28, height:28, cursor:'pointer', fontSize:13,
          }}>✏️</button>
          <button onClick={()=>onDelete(order.id)} style={{
            background:'rgba(239,68,68,0.2)', border:'none', borderRadius:7,
            width:28, height:28, cursor:'pointer', fontSize:13,
          }}>🗑</button>
        </div>
      </div>

      <div style={{ padding:'10px 14px 12px' }}>
        {/* Estado badge */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{
            backgroundColor: cfg.bg, color: cfg.fg,
            borderRadius:99, padding:'3px 10px',
            fontSize:11, fontWeight:800,
          }}>{cfg.label}</span>
          {urgente && (
            <span style={{
              backgroundColor:COLORS.danger.bg, color:COLORS.danger.fg,
              borderRadius:99, padding:'3px 10px', fontSize:10, fontWeight:800,
            }}>
              {diasHasta === 0 ? '🔴 Hoy' : diasHasta === 1 ? '🟠 Mañana' : `🟡 ${diasHasta}d`}
            </span>
          )}
        </div>

        {/* Precio y saldo */}
        <div style={{
          backgroundColor:COLORS.surface2, borderRadius:10,
          padding:'8px 10px', marginBottom:8,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{ fontSize:10, color:COLORS.textMuted, fontWeight:800, textTransform:'uppercase' }}>Precio</div>
            <div style={{ fontSize:18, fontWeight:900, color:COLORS.textPrimary }}>
              ${(order.precio_venta||0).toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:COLORS.textMuted, fontWeight:800, textTransform:'uppercase' }}>Saldo</div>
            <div style={{
              fontSize:15, fontWeight:800,
              color: saldo <= 0 ? COLORS.success.fg : COLORS.danger.fg,
            }}>
              {saldo <= 0 ? '✅ Pagado' : `$${saldo.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* Badge de rentabilidad — solo si hay precio sugerido calculado */}
        {precioSugerido > 0 && precioFinal > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            backgroundColor: diferencia > 0.5
              ? COLORS.success.bg
              : diferencia < -0.5
                ? COLORS.danger.bg
                : COLORS.surface2,
            color: diferencia > 0.5
              ? COLORS.success.fg
              : diferencia < -0.5
                ? COLORS.danger.fg
                : COLORS.textSecondary,
            borderRadius: 99,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 800,
            marginTop: 4,
            marginBottom: 8,
          }}>
            {diferencia > 0.5
              ? `+${pct}% sobre sugerido`
              : diferencia < -0.5
                ? `${pct}% bajo sugerido`
                : 'Al precio sugerido'}
          </div>
        )}

        {/* Fecha entrega */}
        {order.fecha_entrega && (
          <div style={{ fontSize:11, color:COLORS.textSecondary, marginBottom:8 }}>
            📅 Entrega: <strong>{order.fecha_entrega}</strong>
            {order.cliente_telefono && (
              <a href={`https://wa.me/${order.cliente_telefono.replace(/\D/g,'')}`}
                target="_blank" rel="noreferrer"
                style={{ marginLeft:8, color:COLORS.whatsapp, fontWeight:700, textDecoration:'none' }}>
                WhatsApp ↗
              </a>
            )}
          </div>
        )}

        {/* Avanzar estado */}
        {nextEstado && (
          <button onClick={()=>onEstado(order.id, nextEstado)} style={{
            width:'100%', padding:'8px 0', borderRadius:10,
            border:`1.5px solid ${COLORS.border}`, backgroundColor:COLORS.surface2,
            fontWeight:700, fontSize:12, color:COLORS.textSecondary,
            cursor:'pointer', fontFamily:'inherit',
          }}>
            Marcar como {ESTADO_CFG[nextEstado]?.label} →
          </button>
        )}

        {/* WhatsApp actions */}
        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button
            onClick={() => {
              const msg = mensajeEstado(order.cliente_nombre, order.estado);
              window.open(buildWhatsAppLink(telefono, msg), '_blank');
            }}
            disabled={!hasPhone}
            title={hasPhone ? '' : 'Agrega el teléfono del cliente'}
            style={{
              flex:1, padding:'8px 0', borderRadius:10,
              border:`1.5px solid ${COLORS.border}`, backgroundColor:COLORS.surface2,
              fontWeight:700, fontSize:12, color:COLORS.info.fg,
              cursor: hasPhone ? 'pointer' : 'not-allowed', fontFamily:'inherit',
              opacity: hasPhone ? 1 : 0.4,
            }}
          >📱 Estado</button>
          <button
            onClick={() => setCotizModal(true)}
            disabled={!hasPhone}
            title={hasPhone ? '' : 'Agrega el teléfono del cliente'}
            style={{
              flex:1, padding:'8px 0', borderRadius:10,
              border:`1.5px solid ${COLORS.border}`, backgroundColor:COLORS.surface2,
              fontWeight:700, fontSize:12, color:COLORS.success.fg,
              cursor: hasPhone ? 'pointer' : 'not-allowed', fontFamily:'inherit',
              opacity: hasPhone ? 1 : 0.4,
            }}
          >💬 Cotización</button>
        </div>

        <WhatsAppCotizacionModal
          visible={cotizModal}
          telefono={telefono}
          initial={{
            nombre: order.patron_nombre,
            emoji: order.patron_emoji,
            precio: order.precio_venta,
          }}
          onClose={() => setCotizModal(false)}
        />
      </div>
    </div>
  );
}
