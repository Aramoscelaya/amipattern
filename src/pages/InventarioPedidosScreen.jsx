import React, { useState, useEffect } from 'react';
import InventoryCard from '../components/InventoryCard';
import InventoryModal from '../components/InventoryModal';
import OrderCard from '../components/OrderCard';
import OrderModal from '../components/OrderModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { COLORS, Z_INDEX } from '../lib/constants';

const TABS = [
  { id: 'materiales', label: 'Materiales', emoji: '🧵' },
  { id: 'pedidos',    label: 'Pedidos',    emoji: '📦' },
];

const FILTROS_INV = [
  { id:'todos',    label:'Todos'         },
  { id:'hilo',     label:'🧶 Hilos'      },
  { id:'material', label:'📦 Materiales' },
  { id:'alerta',   label:'⚠️ Alerta'     },
];

const FILTROS_PED = [
  { id:'todos',      label:'Todos'          },
  { id:'pendiente',  label:'⏳ Pendientes'  },
  { id:'en_proceso', label:'🪡 En proceso'  },
  { id:'listo',      label:'✅ Listos'      },
  { id:'entregado',  label:'📦 Entregados'  },
  { id:'urgentes',   label:'🔴 Urgentes'    },
];

function MaterialesTab({ inventory }) {
  const {
    items, loading, error,
    saveItem, deleteItem,
    updateUsed, addEntrada,
    stockBajoItems, valorTotal,
  } = inventory;

  const { showToast } = useToast();

  const [filtro,    setFiltro]    = useState('todos');
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  // Notificación de stock bajo
  useEffect(() => {
    if (stockBajoItems.length === 0) return;
    if (!('Notification' in window)) return;
    const askAndNotify = async () => {
      let perm = Notification.permission;
      if (perm === 'default') perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('⚠️ AmiPattern — Stock bajo', {
          body: `${stockBajoItems.length} item${stockBajoItems.length > 1 ? 's' : ''} con stock bajo: ${stockBajoItems.map(i => i.nombre).join(', ')}`,
          icon: '/icon-192.png',
        });
      }
    };
    const key = `notified-${stockBajoItems.map(i=>i.id).join('-')}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      askAndNotify();
    }
  }, [stockBajoItems]);

  const handleSave = async (form) => {
    try {
      await saveItem(form);
      showToast(form.id ? '✅ Actualizado' : '💾 Guardado');
      setModal(false);
      setEditing(null);
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setConfirmId(null);
      showToast('🗑 Eliminado');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  };

  const filtered = items.filter(item => {
    if (filtro === 'hilo'     && item.tipo !== 'hilo')     return false;
    if (filtro === 'material' && item.tipo !== 'material') return false;
    if (filtro === 'alerta') {
      const disp = item.stock_inicial + item.entradas - item.stock_usado;
      if (disp > item.alerta_minimo) return false;
    }
    if (search && !item.nombre.toLowerCase().includes(search.toLowerCase()) &&
        !(item.marca||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalHilos  = items.filter(i => i.tipo === 'hilo').length;
  const totalMats   = items.filter(i => i.tipo === 'material').length;
  const alertaCount = stockBajoItems.length;

  return (
    <>
      <ConfirmDialog
        visible={confirmId !== null}
        title="¿Eliminar este item?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <div style={{ padding:'16px 16px', maxWidth:960, margin:'0 auto' }}>

        {/* Stats */}
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[
            { emoji:'🧶', val:totalHilos,          label:'Hilos'     },
            { emoji:'📦', val:totalMats,            label:'Materiales'},
            { emoji:'⚠️', val:alertaCount,          label:'Alertas',  alert: alertaCount > 0 },
            { emoji:'💰', val:`$${valorTotal.toFixed(0)}`, label:'En stock' },
          ].map(s => (
            <div key={s.label} style={{
              flex:1, backgroundColor: s.alert ? '#FEF2F2' : '#fff',
              borderRadius:14, padding:'10px 8px', textAlign:'center',
              boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
              border: s.alert ? '1.5px solid #FECACA' : '1.5px solid transparent',
            }}>
              <div style={{ fontSize:18 }}>{s.emoji}</div>
              <div style={{ fontWeight:900, fontSize:18, color: s.alert ? '#EF4444' : '#1A1A2E', marginTop:2 }}>
                {s.val}
              </div>
              <div style={{ fontSize:9, color:'#9CA3AF', fontWeight:800, textTransform:'uppercase' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar por nombre o marca…"
          style={{
            width:'100%', boxSizing:'border-box',
            backgroundColor:'#fff', borderRadius:12,
            border:'1.5px solid #E5E7EB',
            padding:'10px 14px', fontSize:14, color:'#1A1A2E',
            marginBottom:10, outline:'none', fontFamily:'inherit',
          }}
        />

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
          {FILTROS_INV.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)} style={{
              padding:'7px 14px', borderRadius:99, whiteSpace:'nowrap',
              border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
              fontWeight:700, fontSize:12,
              backgroundColor: filtro===f.id ? '#1A1A2E' : '#fff',
              borderColor:     filtro===f.id ? '#1A1A2E' : '#E5E7EB',
              color:           filtro===f.id ? '#fff' : '#6B7280',
            }}>
              {f.label}
              {f.id === 'alerta' && alertaCount > 0 && (
                <span style={{
                  marginLeft:5, backgroundColor:'#EF4444', color:'#fff',
                  borderRadius:99, padding:'1px 6px', fontSize:10, fontWeight:900,
                }}>{alertaCount}</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            backgroundColor:'#FEF2F2', border:'1.5px solid #FECACA',
            borderRadius:12, padding:14, marginBottom:14, color:'#991B1B', fontSize:14,
          }}>⚠️ {error}</div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#9CA3AF' }}>
            <div style={{ fontSize:48 }}>🧵</div>
            <div style={{ fontWeight:700, marginTop:10 }}>Cargando inventario…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:48 }}>📦</div>
            <div style={{ fontWeight:800, fontSize:15, color:'#9CA3AF', marginTop:10 }}>
              {items.length === 0 ? '¡Agrega tu primer item!' : 'Sin resultados'}
            </div>
            {items.length === 0 && (
              <button onClick={() => { setEditing(null); setModal(true); }} style={{
                marginTop:16, backgroundColor:'#1A1A2E', color:'#fff',
                border:'none', borderRadius:12, padding:'12px 24px',
                fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit',
              }}>+ Agregar primer item</button>
            )}
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(155px, 1fr))',
            gap:12,
          }}>
            {filtered.map(item => (
              <InventoryCard
                key={item.id}
                item={item}
                onEdit={i  => { setEditing(i); setModal(true); }}
                onDelete={id => setConfirmId(id)}
                onUse={updateUsed}
                onEntrada={addEntrada}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        id="newInventory"
        onClick={() => { setEditing(null); setModal(true); }}
        style={{
          position:'fixed', bottom:'max(24px, calc(env(safe-area-inset-bottom) + 92px))',
          right:24, zIndex:Z_INDEX.fab,
          width:54, height:54, borderRadius:27,
          backgroundColor:'#FAD2E1', border:'none',
          boxShadow:'0 4px 20px #a8a8ca',
          cursor:'pointer', fontSize:24,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
      >➕</button>

      <InventoryModal
        visible={modal}
        initial={editing}
        onClose={() => { setModal(false); setEditing(null); }}
        onSave={handleSave}
      />
    </>
  );
}

function PedidosTab({ ordersHook, inventoryItems }) {
  const {
    orders, loading, error,
    saveOrder, deleteOrder, updateEstado,
    proximosVencer, stats,
  } = ordersHook;

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
    <>
      <ConfirmDialog
        visible={confirmId !== null}
        title="¿Eliminar pedido?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

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
          {FILTROS_PED.map(f => (
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
        inventoryItems={inventoryItems}
        onClose={()=>{setModal(false);setEditing(null);}}
        onSave={handleSave}
      />
    </>
  );
}

export default function InventarioPedidosScreen({ user, inventory, orders, onBack }) {
  const [tab, setTab] = useState('materiales');

  return (
    <div style={{ minHeight:'100vh', backgroundColor: COLORS.bg, fontFamily:'inherit' }}>

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
        <div style={{ flex: 1 }}>
          <div style={{ color: '#FAD2E1', fontSize: 18, fontWeight: 900 }}>📦 Inventario & Pedidos</div>
          <div style={{ color: '#4B5563', fontSize: 11, marginTop: 1 }}>Materiales y pedidos de clientes</div>
        </div>
      </div>

      {/* Tab bar interna */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 16px',
        backgroundColor: COLORS.header,
        borderTop: '1px solid rgba(0,0,0,0.08)',
        position: 'sticky', top: 'max(60px, calc(env(safe-area-inset-top) + 60px))',
        zIndex: Z_INDEX.header,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 4px', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 800, fontSize: 13, textAlign: 'center',
            backgroundColor: tab === t.id ? '#1A1A2E' : 'rgba(255,255,255,0.12)',
            color: tab === t.id ? '#FAD2E1' : 'rgba(255,255,255,0.85)',
            transition: 'background 0.2s',
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {tab === 'materiales' ? (
        <MaterialesTab inventory={inventory} />
      ) : (
        <PedidosTab ordersHook={orders} inventoryItems={inventory.items} />
      )}
    </div>
  );
}