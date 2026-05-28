import React, { useState } from 'react';
import PatternCard from '../components/PatternCard';
import BottomNav from '../components/BottomNav';
import ComingSoonScreen from './ComingSoonScreen';
import InventoryScreen from './InventoryScreen';
import { COLORS, ESTADOS } from '../lib/constants';

export default function GridScreen({ patterns, onSelect, onNew, loading, error, user, onSignOut }) {
  const [search,       setSearch]   = useState('');
  const [filterEstado, setFilter]   = useState('Todos');
  const [showMenu,     setShowMenu] = useState(false);
  const [activeTab,    setActiveTab]= useState('patrones');

  const filtered = patterns.filter(p => {
    const ms = p.nombre.toLowerCase().includes(search.toLowerCase());
    const me = filterEstado === 'Todos' || p.estado === filterEstado;
    return ms && me;
  });

  const stats = [
    { label:'Total',    value:patterns.length,                                        emoji:'🧶' },
    { label:'Hechos',   value:patterns.filter(p=>p.estado==='Completado').length,      emoji:'✅' },
    { label:'Tejiendo', value:patterns.filter(p=>p.estado==='En progreso').length,     emoji:'🪡' },
  ];

  const avatarUrl   = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'Tú';

  const HEADER_BTN = {
    patrones:  { label:'+ Nuevo',    action: onNew },
    inventario:{ label:'+ Agregar',  action: null  }, // el FAB lo maneja InventoryScreen
    negocio:   { label:null },
    organizar: { label:null },
  };
  const headerBtn = HEADER_BTN[activeTab];

  return (
    <div style={{ minHeight:'100vh', backgroundColor:COLORS.bg, fontFamily:'inherit' }}>

      {/* ── Sticky header ── */}
      <div style={{
        backgroundColor:COLORS.header,
        paddingTop:'max(12px, env(safe-area-inset-top))',
        paddingBottom:12, paddingLeft:20, paddingRight:20,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        position:'sticky', top:0, zIndex:100,
      }}>
        <div>
          <div style={{ color:'#FAD2E1', fontSize:20, fontWeight:900 }}>🧶 AmiPattern</div>
          <div style={{ color:'#4B5563', fontSize:11, marginTop:1 }}>Hola, {displayName} 👋</div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {headerBtn?.label && headerBtn?.action && (
            <button onClick={headerBtn.action} style={{
              backgroundColor:'#FAD2E1', borderRadius:12,
              padding:'9px 16px', border:'none',
              color:'#1A1A2E', fontWeight:900, fontSize:14,
              cursor:'pointer', fontFamily:'inherit',
            }}>{headerBtn.label}</button>
          )}

          {/* Avatar + menú */}
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowMenu(m=>!m)} style={{
              width:36, height:36, borderRadius:18, padding:0,
              border:'2px solid #374151', cursor:'pointer',
              overflow:'hidden', backgroundColor:'#374151',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <span style={{fontSize:18}}>👤</span>
              }
            </button>
            {showMenu && (<>
              <div onClick={()=>setShowMenu(false)} style={{position:'fixed',inset:0,zIndex:99}}/>
              <div style={{
                position:'absolute', right:0, top:44, zIndex:100,
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

      {/* ── Contenido por tab ── */}
      {activeTab === 'inventario' && <InventoryScreen user={user} />}
      {activeTab === 'negocio'    && <ComingSoonScreen section="negocio" />}
      {activeTab === 'organizar'  && <ComingSoonScreen section="organizar" />}

      {activeTab === 'patrones' && (
        <div style={{ padding:'20px 16px', maxWidth:960, margin:'0 auto' }}>

          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            {stats.map(s => (
              <div key={s.label} style={{
                flex:1, backgroundColor:COLORS.card, borderRadius:14,
                padding:12, textAlign:'center',
                boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{fontSize:20}}>{s.emoji}</div>
                <div style={{fontWeight:900,fontSize:22,color:COLORS.textPrimary,marginTop:2}}>{s.value}</div>
                <div style={{fontSize:10,color:COLORS.textMuted,fontWeight:800,textTransform:'uppercase'}}>{s.label}</div>
              </div>
            ))}
          </div>

          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 Buscar amigurumi…"
            style={{
              width:'100%', boxSizing:'border-box',
              backgroundColor:COLORS.card, borderRadius:12,
              border:'1.5px solid #E5E7EB',
              padding:'10px 14px', fontSize:14, color:COLORS.textPrimary,
              marginBottom:10, outline:'none', fontFamily:'inherit',
            }}
          />

          <div style={{display:'flex',gap:8,marginBottom:20,overflowX:'auto',paddingBottom:4}}>
            {['Todos',...ESTADOS].map(item=>(
              <button key={item} onClick={()=>setFilter(item)} style={{
                padding:'7px 14px', borderRadius:99, whiteSpace:'nowrap',
                border:'1.5px solid', cursor:'pointer', fontFamily:'inherit',
                fontWeight:700, fontSize:13,
                backgroundColor: filterEstado===item ? COLORS.header : COLORS.card,
                borderColor:     filterEstado===item ? COLORS.header : '#E5E7EB',
                color:           filterEstado===item ? '#fff' : COLORS.textSecondary,
              }}>{item}</button>
            ))}
          </div>

          {error && (
            <div style={{
              backgroundColor:'#FEF2F2',border:'1.5px solid #FECACA',
              borderRadius:12,padding:16,marginBottom:16,color:'#991B1B',fontSize:14,
            }}>⚠️ Error: {error}</div>
          )}

          {loading ? (
            <div style={{textAlign:'center',padding:'60px 0',color:COLORS.textMuted}}>
              <div style={{fontSize:52}}>🧶</div>
              <div style={{fontWeight:700,marginTop:10}}>Cargando tus patrones…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'60px 0'}}>
              <div style={{fontSize:52}}>🧶</div>
              <div style={{fontWeight:800,fontSize:16,color:COLORS.textMuted,marginTop:10}}>
                {patterns.length===0 ? '¡Agrega tu primer amigurumi!' : 'Sin resultados'}
              </div>
              {patterns.length===0 && (
                <button onClick={onNew} style={{
                  marginTop:16,backgroundColor:'#1A1A2E',color:'#fff',
                  border:'none',borderRadius:12,padding:'12px 24px',
                  fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit',
                }}>+ Crear primer patrón</button>
              )}
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
              gap:14,
            }}>
              {filtered.map(p=>(
                <PatternCard key={p.id} pattern={p} onPress={()=>onSelect(p)}/>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav active={activeTab} onChange={setActiveTab}/>
    </div>
  );
}
