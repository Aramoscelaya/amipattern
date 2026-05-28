import React, { useState } from 'react';

const SUBTIPO_EMOJI = {
  chenille:'🧶', acrílico:'🧶', algodón:'🧶', lana:'🧶', amigurumi:'🧶',
  relleno:'🪶', ojo_seguridad:'👁️', llavero:'🔑', etiqueta:'🏷️',
  tarjeta:'🪧', caja:'📦', botones:'🔘', alambre:'〰️', otro:'➕',
};

export default function InventoryCard({ item, onEdit, onDelete, onUse, onEntrada }) {
  const [modo,     setModo]     = useState(null); // null | 'salida' | 'entrada'
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(false);

  // Cálculo correcto: inicial + entradas - usado
  const disponible = item.stock_inicial + item.entradas - item.stock_usado;
  const pct        = (item.stock_inicial + item.entradas) > 0
    ? Math.max(0, Math.min(100, (disponible / (item.stock_inicial + item.entradas)) * 100))
    : 0;
  const stockBajo = disponible <= item.alerta_minimo;
  const agotado   = disponible <= 0;
  const unidad    = item.unidad === 'g' ? 'g' : 'uds';
  const emoji     = SUBTIPO_EMOJI[(item.subtipo || '').toLowerCase()] || '📦';
  const barColor  = agotado ? '#EF4444' : stockBajo ? '#F97316' : '#2DD4BF';

  const handleConfirm = async () => {
    const n = Number(cantidad);
    if (!n || n <= 0) return;
    if (modo === 'salida' && n > disponible) return;
    setCargando(true);
    try {
      if (modo === 'salida') await onUse(item.id, n);
      else                   await onEntrada(item.id, n);
      setModo(null);
      setCantidad(1);
    } finally {
      setCargando(false);
    }
  };

  const BtnPill = ({ onClick, bg, border, color, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} style={{
      flex:1, padding:'5px 0', border:`1px solid ${border}`,
      borderRadius:8, cursor: disabled ? 'default' : 'pointer',
      fontSize:11, fontWeight:700, color,
      backgroundColor: bg,
      display:'flex', alignItems:'center', justifyContent:'center', gap:3,
      opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );

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
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
          <span style={{ fontSize:11, fontWeight:800, color: stockBajo ? '#EF4444' : '#6B7280' }}>
            {Math.max(0, disponible)}{unidad} disp.
          </span>
          <span style={{ fontSize:10, color:'#D1D5DB' }}>
            / {item.stock_inicial + item.entradas}{unidad}
          </span>
        </div>

        {/* Desglose compacto */}
        <div style={{ fontSize:10, color:'#C4C9D4', marginBottom:6, display:'flex', gap:8 }}>
          <span>📥 +{item.entradas}{unidad}</span>
          <span>📤 -{item.stock_usado}{unidad}</span>
        </div>

        {/* Costo */}
        {item.costo_unitario > 0 && (
          <div style={{
            fontSize:11, color:'#9CA3AF',
            borderTop:'1px solid #F9FAFB', paddingTop:6, marginBottom:6,
          }}>
            💰 ${item.costo_unitario}/{item.unidad==='g'?'g':'ud'} ·{' '}
            <strong style={{color:'#1A1A2E'}}>
              ${(item.costo_unitario * Math.max(0, disponible)).toFixed(2)}
            </strong> en stock
          </div>
        )}

        {/* ── Acciones rápidas ── */}
        <div style={{ borderTop:'1px solid #F3F4F6', paddingTop:8 }}>

          {/* Modo: botones iniciales */}
          {!modo && (
            <div style={{ display:'flex', gap:6 }}>
              <BtnPill
                onClick={() => { setModo('salida'); setCantidad(1); }}
                disabled={agotado}
                bg='#FEF2F2' border='#FECACA' color='#DC2626'
              >📤 Usar</BtnPill>
              <BtnPill
                onClick={() => { setModo('entrada'); setCantidad(1); }}
                bg='#F0FDF4' border='#BBF7D0' color='#16A34A'
              >📥 Reponer</BtnPill>
            </div>
          )}

          {/* Modo: input de cantidad */}
          {modo && (
            <div>
              <div style={{
                fontSize:10, fontWeight:800, color: modo==='salida' ? '#DC2626' : '#16A34A',
                textTransform:'uppercase', letterSpacing:0.5, marginBottom:5,
              }}>
                {modo === 'salida' ? '📤 ¿Cuánto usaste?' : '📥 ¿Cuánto repones?'}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <button
                  onClick={() => setCantidad(c => Math.max(1, Number(c) - 1))}
                  style={{
                    width:26, height:26, borderRadius:6, border:'1px solid #E5E7EB',
                    background:'#F9FAFB', cursor:'pointer', fontSize:14, fontWeight:800,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>−</button>
                <input
                  type="number" min={1}
                  max={modo === 'salida' ? disponible : undefined}
                  value={cantidad}
                  onChange={e => setCantidad(e.target.value)}
                  style={{
                    flex:1, textAlign:'center',
                    border:`1px solid ${modo==='salida' ? '#FECACA' : '#BBF7D0'}`,
                    borderRadius:6, padding:'3px 4px',
                    fontSize:12, fontWeight:700, color:'#1A1A2E',
                    outline:'none', width:0,
                  }}
                />
                <button
                  onClick={() => setCantidad(c => Number(c) + 1)}
                  style={{
                    width:26, height:26, borderRadius:6, border:'1px solid #E5E7EB',
                    background:'#F9FAFB', cursor:'pointer', fontSize:14, fontWeight:800,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>+</button>
                <button
                  onClick={handleConfirm}
                  disabled={cargando || !cantidad || Number(cantidad) <= 0
                    || (modo==='salida' && Number(cantidad) > disponible)}
                  style={{
                    width:26, height:26, borderRadius:6, border:'none',
                    backgroundColor: cargando ? '#93C5FD'
                      : modo==='salida' ? '#DC2626' : '#16A34A',
                    color:'#fff', cursor:'pointer', fontSize:13,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{cargando ? '…' : '✓'}</button>
                <button
                  onClick={() => setModo(null)}
                  style={{
                    width:26, height:26, borderRadius:6, border:'none',
                    background:'#F3F4F6', cursor:'pointer', fontSize:12,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>✕</button>
              </div>
              {modo === 'salida' && Number(cantidad) > disponible && (
                <div style={{ fontSize:10, color:'#DC2626', marginTop:4 }}>
                  Máximo disponible: {disponible}{unidad}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
