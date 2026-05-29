import React from 'react';

const ESTADO_CFG = {
  pendiente:  { label:'⏳ Pendiente',  bg:'#FEF3C7', fg:'#92400E' },
  en_proceso: { label:'🪡 En proceso', bg:'#EFF6FF', fg:'#1D4ED8' },
  listo:      { label:'✅ Listo',      bg:'#D1FAE5', fg:'#065F46' },
  entregado:  { label:'📦 Entregado',  bg:'#F3F4F6', fg:'#374151' },
  cancelado:  { label:'❌ Cancelado',  bg:'#FEE2E2', fg:'#991B1B' },
};

export default function OrderCard({ order, onEdit, onDelete, onEstado }) {
  const cfg       = ESTADO_CFG[order.estado] || ESTADO_CFG.pendiente;
  const saldo     = (order.precio_venta || 0) - (order.anticipo || 0);
  const diasHasta = order.fecha_entrega
    ? Math.ceil((new Date(order.fecha_entrega) - new Date()) / 86400000)
    : null;
  const urgente   = diasHasta !== null && diasHasta <= 2
    && !['entregado','cancelado'].includes(order.estado);

  const nextEstado = {
    pendiente: 'en_proceso', en_proceso: 'listo',
    listo: 'entregado', entregado: null, cancelado: null,
  }[order.estado];

  return (
    <div style={{
      backgroundColor:'#fff', borderRadius:16,
      boxShadow: urgente
        ? '0 2px 16px rgba(239,68,68,0.18)'
        : '0 2px 10px rgba(0,0,0,0.06)',
      border: urgente ? '1.5px solid #FECACA' : '1.5px solid transparent',
      overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: urgente
          ? 'linear-gradient(135deg,#FEF2F2,#FEE2E2)'
          : 'linear-gradient(135deg,#1A1A2E,#2D2D4E)',
        padding:'12px 14px',
        display:'flex', alignItems:'flex-start', justifyContent:'space-between',
      }}>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:26 }}>{order.patron_emoji || '🧶'}</span>
          <div>
            <div style={{
              fontWeight:800, fontSize:13,
              color: urgente ? '#991B1B' : '#FAD2E1',
              lineHeight:1.2,
            }}>{order.patron_nombre}</div>
            <div style={{ fontSize:11, color: urgente ? '#B91C1C' : '#6B7280', marginTop:1 }}>
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
              backgroundColor:'#FEE2E2', color:'#EF4444',
              borderRadius:99, padding:'3px 10px', fontSize:10, fontWeight:800,
            }}>
              {diasHasta === 0 ? '🔴 Hoy' : diasHasta === 1 ? '🟠 Mañana' : `🟡 ${diasHasta}d`}
            </span>
          )}
        </div>

        {/* Precio y saldo */}
        <div style={{
          backgroundColor:'#F9FAFB', borderRadius:10,
          padding:'8px 10px', marginBottom:8,
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <div>
            <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:800, textTransform:'uppercase' }}>Precio</div>
            <div style={{ fontSize:18, fontWeight:900, color:'#1A1A2E' }}>
              ${(order.precio_venta||0).toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'#9CA3AF', fontWeight:800, textTransform:'uppercase' }}>Saldo</div>
            <div style={{
              fontSize:15, fontWeight:800,
              color: saldo <= 0 ? '#16A34A' : '#EF4444',
            }}>
              {saldo <= 0 ? '✅ Pagado' : `$${saldo.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* Fecha entrega */}
        {order.fecha_entrega && (
          <div style={{ fontSize:11, color:'#6B7280', marginBottom:8 }}>
            📅 Entrega: <strong>{order.fecha_entrega}</strong>
            {order.cliente_telefono && (
              <a href={`https://wa.me/${order.cliente_telefono.replace(/\D/g,'')}`}
                target="_blank" rel="noreferrer"
                style={{ marginLeft:8, color:'#25D366', fontWeight:700, textDecoration:'none' }}>
                WhatsApp ↗
              </a>
            )}
          </div>
        )}

        {/* Avanzar estado */}
        {nextEstado && (
          <button onClick={()=>onEstado(order.id, nextEstado)} style={{
            width:'100%', padding:'8px 0', borderRadius:10,
            border:'1.5px solid #E5E7EB', backgroundColor:'#F9FAFB',
            fontWeight:700, fontSize:12, color:'#374151',
            cursor:'pointer', fontFamily:'inherit',
          }}>
            Marcar como {ESTADO_CFG[nextEstado]?.label} →
          </button>
        )}
      </div>
    </div>
  );
}
