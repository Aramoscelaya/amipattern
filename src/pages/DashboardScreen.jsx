import React, { useState } from 'react';
import { COLORS } from '../lib/constants';

const MODULES = [
  { id: 'patterns',  emoji: '🧶', label: 'Patrones',  color: '#FAD2E1', desc: 'Tus amigurumis' },
  { id: 'inventory', emoji: '🧵', label: 'Inventario', color: '#B5EAD7', desc: 'Hilos y materiales' },
  { id: 'business',  emoji: '💼', label: 'Negocio',   color: '#FFDAC1', desc: 'Pedidos y clientes' },
  { id: 'prices',    emoji: '💰', label: 'Precios',   color: '#C7CEEA', desc: 'Lista para boutique' },
  { id: 'store',     emoji: '🏪', label: 'Tienda',    color: '#A8DADC', desc: 'Ventas y eventos' },
];

export default function DashboardScreen({ user, onSelect, onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);

  const avatarUrl   = user?.user_metadata?.avatar_url;
  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'Tú';

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
              <div onClick={() => setShowMenu(false)} style={{position:'fixed',inset:0,zIndex:99}}/>
              <div style={{
                position:'absolute', right:0, top:48, zIndex:100,
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
