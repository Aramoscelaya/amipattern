import React, { useState, useEffect } from 'react';
import OrderCard from '../components/OrderCard';
import OrderModal from '../components/OrderModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { useOrders } from '../hooks/useOrders';
import { useInventory } from '../hooks/useInventory';
import { COLORS, Z_INDEX } from '../lib/constants';

const FILTROS = [
  { id:'todos',      label:'Todos'          },
  { id:'pendiente',  label:'⏳ Pendientes'  },
  { id:'en_proceso', label:'🪡 En proceso'  },
  { id:'listo',      label:'✅ Listos'      },
  { id:'entregado',  label:'📦 Entregados'  },
  { id:'urgentes',   label:'🔴 Urgentes'    },
];

export default function BusinessScreen({ user, onBack }) {
  const { orders, loading, error, saveOrder, deleteOrder, updateEstado, proximosVencer, stats }
    = useOrders(user?.id);
  const { items: invItems } = useInventory(user?.id);

  const { showToast } = useToast();

  const [filtro,    setFiltro]    = useState('todos');
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // ── Notificación push por entregas próximas ──
  useEffect(() => {
    if (proximosVencer.length === 0) return;
    if (!('Notification' in window)) return;
    const notify = async () => {
      let perm = Notification.permission;
      if (perm === 'default') perm = await Notification.requestPermission();
      if (perm === 'granted') {
        proximosVencer.forEach(o => {
          const dias = Math.ceil((new Date(o.fecha_entrega) - new Date()) / 86400000);
          new Notification('🔔 AmiPattern — Entrega próxima', {
            body: `${o.patron_emoji} ${o.patron_nombre} para ${o.cliente_nombre} — ${dias === 0 ? 'HOY' : dias === 1 ? 'mañana' : `en ${dias} días`}`,
            icon: '/icon-192.png',
          });
        });
      }
    };
    const key = `orders-notif-${proximosVencer.map(o=>o.id).join('-')}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      notify();
    }
  }, [proximosVencer]);

  const handleSave = async (form) => {
    try {
      await saveOrder(form);
      showToast(form.id ? '✅ Pedido actualizado' : '🎉 Pedido creado');
      setModal(false); setEditing(null);
    } catch(err) { showToast('Error: ' + err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id);
      setConfirmId(null); showToast('🗑 Eliminado');
    } catch(err) { showToast('Error: ' + err.message); }
  };

  const filtered = orders.filter(o => {
    if (filtro === 'urgentes') {
      const dias = o.fecha_entrega
        ? Math.ceil((new Date(o.fecha_entrega)-new Date())/86400000) : null;
      if (dias === null || dias > 2 || ['entregado','cancelado'].includes(o.estado)) return false;
    } else if (filtro !== 'todos' && o.estado !== filtro) return false;

    if (search) {
      const q = search.toLowerCase();
      if (!o.cliente_nombre.toLowerCase().includes(q) &&
          !o.patron_nombre.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight:'80vh', backgroundColor:COLORS.bg, fontFamily:'inherit' }}>

      <ConfirmDialog
        visible={confirmId !== null}
        title="¿Eliminar pedido?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      {/* Header */}
      <div style={{
        backgroundColor: COLORS.header,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: Z_INDEX.header,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: '#4B5563', padding: '4px 4px 4px 0', fontFamily: 'inherit',
        }}>←</button>
        <div style={{ color: '#FAD2E1', fontSize: 18, fontWeight: 900 }}>💼 Negocio</div>
      </div>

      <div style={{ padding:'16px 16px', maxWidth:960, margin:'0 auto' }}>

        {/* ── Banner urgentes ── */}
        {proximosVencer.length > 0 && (
          <div style={{
            backgroundColor:'#FEF2F2', border:'1.5px solid #FECACA',
            borderRadius:14, padding:'12px 16px', marginBottom:14,
            display:'flex', alignItems:'center', gap:10,
          }}>
            <span style={{ fontSize:22 }}>🔔</span>
            <div>
              <div style={{ fontWeight:800, fontSize:13, color:'#991B1B' }}>
                {proximosVencer.length} entrega{proximosVencer.length>1?'s':''} próxima{proximosVencer.length>1?'s':''}
              </div>
              <div style={{ fontSize:12, color:'#B91C1C' }}>
                {proximosVencer.map(o=>`${o.patron_emoji} ${o.patron_nombre} (${o.cliente_nombre})`).join(' · ')}
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto' }}>
          {[
            { emoji:'📋', val:stats.total,          label:'Pedidos'   },
            { emoji:'🪡', val:stats.enProceso,      label:'En proceso'},
            { emoji:'✅', val:stats.entregados,     label:'Entregados'},
            { emoji:'💰', val:`$${stats.ingresos.toFixed(0)}`, label:'Ingresos'  },
            { emoji:'⏳', val:`$${stats.porCobrar.toFixed(0)}`,label:'Por cobrar',
              alert: stats.porCobrar > 0 },
          ].map(s => (
            <div key={s.label} style={{
              flex:'0 0 auto', minWidth:70,
              backgroundColor: s.alert ? '#FFFBEB' : '#fff',
              borderRadius:14, padding:'10px 8px', textAlign:'center',
              boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
              border: s.alert ? '1.5px solid #FDE68A' : '1.5px solid transparent',
            }}>
              <div style={{ fontSize:18 }}>{s.emoji}</div>
              <div style={{ fontWeight:900, fontSize:16,
                color: s.alert ? '#92400E' : '#1A1A2E', marginTop:2 }}>{s.val}</div>
              <div style={{ fontSize:9, color:'#9CA3AF', fontWeight:800, textTransform:'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍 Buscar por cliente o amigurumi…"
          style={{
            width:'100%', boxSizing:'border-box',
            backgroundColor:'#fff', borderRadius:12,
            border:'1.5px solid #E5E7EB',
            padding:'10px 14px', fontSize:14, color:'#1A1A2E',
            marginBottom:10, outline:'none', fontFamily:'inherit',
          }}/>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
          {FILTROS.map(f => (
            <button key={f.id} onClick={()=>setFiltro(f.id)} style={{
              padding:'7px 14px', borderRadius:99, whiteSpace:'nowrap',
              border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
              fontWeight:700, fontSize:12,
              backgroundColor: filtro===f.id ? '#1A1A2E' : '#fff',
              borderColor:     filtro===f.id ? '#1A1A2E' : '#E5E7EB',
              color:           filtro===f.id ? '#fff'    : '#6B7280',
            }}>
              {f.label}
              {f.id==='urgentes' && proximosVencer.length>0 && (
                <span style={{
                  marginLeft:5, backgroundColor:'#EF4444', color:'#fff',
                  borderRadius:99, padding:'1px 6px', fontSize:10, fontWeight:900,
                }}>{proximosVencer.length}</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor:'#FEF2F2', border:'1.5px solid #FECACA',
            borderRadius:12, padding:14, marginBottom:14, color:'#991B1B', fontSize:14,
          }}>⚠️ {error}</div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>
            <div style={{ fontSize:48 }}>💼</div>
            <div style={{ fontWeight:700, marginTop:10 }}>Cargando pedidos…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48 }}>📋</div>
            <div style={{ fontWeight:800, fontSize:15, color:'#9CA3AF', marginTop:10 }}>
              {orders.length === 0 ? '¡Registra tu primer pedido!' : 'Sin resultados'}
            </div>
            {orders.length === 0 && (
              <button onClick={()=>{setEditing(null);setModal(true);}} style={{
                marginTop:16, backgroundColor:'#1A1A2E', color:'#fff',
                border:'none', borderRadius:12, padding:'12px 24px',
                fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit',
              }}>+ Nuevo pedido</button>
            )}
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
            gap:12,
          }}>
            {filtered.map(o => (
              <OrderCard
                key={o.id}
                order={o}
                onEdit={o=>{setEditing(o);setModal(true);}}
                onDelete={id=>setConfirmId(id)}
                onEstado={updateEstado}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={()=>{setEditing(null);setModal(true);}} style={{
        position:'fixed',
        bottom:'max(24px, calc(env(safe-area-inset-bottom) + 92px))',
        right:24, zIndex:Z_INDEX.fab,
        width:54, height:54, borderRadius:27,
        backgroundColor:'#FAD2E1', border:'none',
        boxShadow:'0 4px 20px #a8a8ca',
        cursor:'pointer', fontSize:24,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>➕</button>

      <OrderModal
        visible={modal}
        initial={editing}
        inventoryItems={invItems}
        onClose={()=>{setModal(false);setEditing(null);}}
        onSave={handleSave}
      />
    </div>
  );
}
