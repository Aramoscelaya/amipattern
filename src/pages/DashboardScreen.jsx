import React, { useState, useMemo } from 'react';
import { COLORS, Z_INDEX } from '../lib/constants';

const MODULES = [
  { id: 'patterns',  emoji: '🧶', label: 'Patrones',  color: '#FAD2E1', desc: 'Tus amigurumis' },
  { id: 'inventario_pedidos', emoji: '📦', label: 'Inventario & Pedidos',  color: '#B5EAD7', desc: 'Hilos, materiales y pedidos' },
  { id: 'comercial', emoji: '💼', label: 'Comercial', color: '#A8DADC', desc: 'Vender, catálogo y costos' },
];

export default function DashboardScreen({ user, patterns = [], items = [], orders = [], products = [], onSelect, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);

  const avatarUrl   = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'Tú';

  const stockAlerts = useMemo(() =>
    items.filter(i => {
      const disp = (i.stock_inicial || 0) + (i.entradas || 0) - (i.stock_usado || 0);
      return disp <= (i.alerta_minimo || 0);
    }), [items]);

  const proximasEntregas = useMemo(() =>
    orders.filter(o => {
      if (!o.fecha_entrega || o.estado === 'entregado' || o.estado === 'cancelado') return false;
      const dias = Math.ceil((new Date(o.fecha_entrega) - new Date()) / 86400000);
      return dias <= 2 && dias >= 0;
    }), [orders]);

  const piezasTienda = useMemo(() =>
    products.reduce((s, p) => s + (p.stock_inicial || 0) - (p.stock_vendido || 0), 0),
  [products]);

  const pedidosActivos = orders.filter(
    o => o.estado === 'pendiente' || o.estado === 'en_proceso'
  ).length;

  const stats = [
    { emoji: '🧶', val: patterns.length, label: 'Patrones' },
    { emoji: '⚠️', val: stockAlerts.length, label: 'Alertas stock', warn: true },
    { emoji: '💼', val: pedidosActivos, label: 'Pedidos activos' },
    { emoji: '🏪', val: piezasTienda, label: 'Piezas en tienda' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{
        backgroundColor: COLORS.header,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 16, paddingLeft: 20, paddingRight: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: '#FAD2E1', fontSize: 22, fontWeight: 900 }}>🧶 AmiPattern</div>
            <div style={{ color: '#4B5563', fontSize: 13, marginTop: 2 }}>Hola, {displayName} 👋</div>
          </div>

          {/* Avatar + menú */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(m => !m)} style={{
              width: 40, height: 40, borderRadius: 20, padding: 0,
              border: '2px solid #374151', cursor: 'pointer',
              overflow: 'hidden', backgroundColor: '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <span style={{fontSize:20}}>👤</span>
              }
            </button>
            {showMenu && (<>
              <div onClick={() => setShowMenu(false)} style={{position:'fixed',inset:0,zIndex:Z_INDEX.modal}}/>
              <div style={{
                position:'absolute', right:0, top:48, zIndex:Z_INDEX.header,
                backgroundColor:'#fff', borderRadius:14,
                boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
                minWidth:180, padding:8,
              }}>
                <div style={{padding:'8px 14px 10px',borderBottom:'1px solid #F3F4F6'}}>
                  <div style={{fontWeight:800,fontSize:13,color:'#1A1A2E'}}>
                    {user?.user_metadata?.full_name||'Usuario'}
                  </div>
                  <div style={{fontSize:11,color:'#9CA3AF',marginTop:2}}>{user?.email}</div>
                </div>
                <button onClick={()=>{setShowMenu(false);onSignOut();}} style={{
                  width:'100%',padding:'10px 14px',border:'none',
                  backgroundColor:'transparent',textAlign:'left',
                  color:'#EF4444',fontWeight:700,fontSize:13,
                  cursor:'pointer',fontFamily:'inherit',borderRadius:8,
                }}>🚪 Cerrar sesión</button>
              </div>
            </>)}
          </div>
        </div>
      </div>

      {/* Grid de módulos */}
      <div style={{ padding: '24px 20px', maxWidth: 500, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          {MODULES.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                backgroundColor: COLORS.card, borderRadius: 20,
                padding: '28px 16px', border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                backgroundColor: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32,
              }}>{m.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: COLORS.textPrimary }}>{m.label}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Stats rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              backgroundColor: '#fff', borderRadius: 14, padding: '12px 10px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 20 }}>{s.emoji}</div>
              <div style={{
                fontWeight: 900, fontSize: 18, marginTop: 2,
                color: s.warn && s.val > 0 ? '#EF4444' : COLORS.textPrimary,
              }}>{s.val}</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alertas */}
        {(stockAlerts.length > 0 || proximasEntregas.length > 0) && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              ⚠️ Alertas activas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stockAlerts.map(i => {
                const disp = (i.stock_inicial || 0) + (i.entradas || 0) - (i.stock_usado || 0);
                return (
                  <div key={i.id} style={{
                    backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12,
                    padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 16 }}>🧵</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: '#991B1B' }}>{i.nombre}</div>
                      <div style={{ fontSize: 11, color: '#B91C1C' }}>
                        Stock bajo: {Math.max(0, disp)} {i.unidad || 'ud'} (mín: {i.alerta_minimo || 0})
                      </div>
                    </div>
                  </div>
                );
              })}
              {proximasEntregas.map(o => (
                <div key={o.id} style={{
                  backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 12,
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 16 }}>📦</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#92400E' }}>{o.cliente_nombre}</div>
                    <div style={{ fontSize: 11, color: '#78350F' }}>
                      {o.patron_nombre} · Entrega: {o.fecha_entrega ? new Date(o.fecha_entrega).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: 32,
          fontSize: 11, color: COLORS.textMuted,
          fontWeight: 600,
        }}>
          Creado por Minué Crochet
        </div>
      </div>
    </div>
  );
}
