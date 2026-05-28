import React, { useState, useEffect } from 'react';
import InventoryCard from '../components/InventoryCard';
import InventoryModal from '../components/InventoryModal';
import { useInventory } from '../hooks/useInventory';
import { COLORS } from '../lib/constants';

const FILTROS = [
  { id:'todos',    label:'Todos'         },
  { id:'hilo',     label:'🧶 Hilos'      },
  { id:'material', label:'📦 Materiales' },
  { id:'alerta',   label:'⚠️ Alerta'     },
];

export default function InventoryScreen({ user }) {
  const {
    items, loading, error,
    saveItem, deleteItem,
    updateUsed, addEntrada,
    stockBajoItems, valorTotal
  } = useInventory(user?.id);

  const [filtro,    setFiltro]    = useState('todos');
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [toast,     setToast]     = useState(null);
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = async (form) => {
    try {
      await saveItem(form);
      showToast(form.id ? '✅ Actualizado' : '💾 Guardado');
      setModal(false);
      setEditing(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setConfirmId(null);
      showToast('🗑 Eliminado');
    } catch (err) {
      alert('Error: ' + err.message);
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
    <div style={{ minHeight:'80vh', backgroundColor: COLORS.bg, fontFamily:'inherit' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
          backgroundColor:'#1A1A2E', color:'#fff',
          padding:'10px 20px', borderRadius:99, fontWeight:700, fontSize:14,
          boxShadow:'0 4px 20px rgba(0,0,0,0.25)', zIndex:9999,
          whiteSpace:'nowrap', animation:'fadeInDown 0.2s ease',
        }}>{toast}</div>
      )}

      {/* Confirm delete */}
      {confirmId && (
        <div style={{
          position:'fixed', inset:0, zIndex:500,
          backgroundColor:'rgba(0,0,0,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:20,
        }}>
          <div style={{
            backgroundColor:'#fff', borderRadius:20, padding:24,
            maxWidth:320, width:'100%', textAlign:'center',
          }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🗑</div>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:8 }}>¿Eliminar este item?</div>
            <div style={{ color:'#6B7280', fontSize:14, marginBottom:20 }}>Esta acción no se puede deshacer.</div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmId(null)} style={{
                flex:1, padding:12, borderRadius:12,
                border:'2px solid #E5E7EB', background:'transparent',
                fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmId)} style={{
                flex:1, padding:12, borderRadius:12,
                background:'#EF4444', border:'none',
                color:'#fff', fontWeight:800, cursor:'pointer', fontFamily:'inherit',
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

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
          {FILTROS.map(f => (
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
        onClick={() => { setEditing(null); setModal(true); }}
        style={{
          position:'fixed', bottom:'max(24px, calc(env(safe-area-inset-bottom) + 80px))',
          right:24, zIndex:300,
          width:54, height:54, borderRadius:27,
          backgroundColor:'#1A1A2E', border:'none',
          boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
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
    </div>
  );
}
