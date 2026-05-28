import React from 'react';

const SUBTIPO_EMOJI = {
  chenille:'🧶', acrílico:'🧶', algodón:'🧶', lana:'🧶', amigurumi:'🧶',
  relleno:'🪶', ojo_seguridad:'👁️', llavero:'🔑', etiqueta:'🏷️',
  tarjeta:'🪧', caja:'📦', botones:'🔘', alambre:'〰️', otro:'➕',
};

export default function InventoryCard({ item, onEdit, onDelete }) {
  const disponible = item.stock_total - item.stock_usado;
  const pct        = item.stock_total > 0 ? Math.max(0, Math.min(100, (disponible / item.stock_total) * 100)) : 0;
  const stockBajo  = disponible <= item.alerta_minimo;
  const agotado    = disponible <= 0;
  const unidad     = item.unidad === 'g' ? 'g' : 'uds';
  const emoji      = SUBTIPO_EMOJI[(item.subtipo||'').toLowerCase()] || '📦';

  const barColor = agotado ? '#EF4444' : stockBajo ? '#F97316' : '#2DD4BF';

  return (
    <div style={{
      backgroundColor:'#fff', borderRadius:16,
      overflow:'hidden',
      boxShadow: stockBajo
        ? '0 2px 12px rgba(239,68,68,0.12)'
        : '0 2px 10px rgba(0,0,0,0.06)',
      border: stockBajo ? '1.5px solid #FECACA' : '1.5px solid transparent',
      position:'relative',
    }}>
      {/* Badge stock bajo */}
      {stockBajo && (
        <div style={{
          position:'absolute', top:8, right:8, zIndex:2,
          backgroundColor: agotado ? '#EF4444' : '#F97316',
          color:'#fff', borderRadius:99, padding:'2px 8px',
          fontSize:10, fontWeight:800,
        }}>
          {agotado ? '❌ Agotado' : '⚠️ Stock bajo'}
        </div>
      )}

      {/* Header con color */}
      <div style={{
        backgroundColor: item.color_hex || '#C9A96E',
        height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', padding:'0 12px',
      }}>
        <span style={{ fontSize:28 }}>{emoji}</span>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => onEdit(item)} style={{
            background:'rgba(255,255,255,0.35)', border:'none', borderRadius:8,
            width:30, height:30, cursor:'pointer', fontSize:14,
          }}>✏️</button>
          <button onClick={() => onDelete(item.id)} style={{
            background:'rgba(239,68,68,0.15)', border:'none', borderRadius:8,
            width:30, height:30, cursor:'pointer', fontSize:14,
          }}>🗑</button>
        </div>
      </div>

      <div style={{ padding:'10px 12px 12px' }}>
        {/* Nombre */}
        <div style={{
          fontWeight:800, fontSize:13, color:'#1A1A2E',
          marginBottom:2, lineHeight:1.3,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{item.nombre}</div>

        {/* Marca + color */}
        <div style={{ fontSize:11, color:'#9CA3AF', marginBottom:8 }}>
          {[item.marca, item.color].filter(Boolean).join(' · ') || '—'}
        </div>

        {/* Barra de stock */}
        <div style={{ height:5, backgroundColor:'#F3F4F6', borderRadius:99, overflow:'hidden', marginBottom:4 }}>
          <div style={{
            height:'100%', width:`${pct}%`,
            backgroundColor: barColor, borderRadius:99,
            transition:'width 0.4s ease',
          }}/>
        </div>

        {/* Números */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:11, fontWeight:800, color: stockBajo ? '#EF4444' : '#6B7280' }}>
            {disponible}{unidad} disp.
          </span>
          <span style={{ fontSize:10, color:'#D1D5DB' }}>
            / {item.stock_total}{unidad}
          </span>
        </div>

        {/* Costo */}
        {item.costo_unitario > 0 && (
          <div style={{
            marginTop:6, fontSize:11, color:'#9CA3AF',
            borderTop:'1px solid #F9FAFB', paddingTop:6,
          }}>
            💰 ${item.costo_unitario}/{item.unidad==='g'?'g':'ud'} ·{' '}
            <strong style={{color:'#1A1A2E'}}>
              ${(item.costo_unitario * disponible).toFixed(2)}
            </strong> en stock
          </div>
        )}
      </div>
    </div>
  );
}
