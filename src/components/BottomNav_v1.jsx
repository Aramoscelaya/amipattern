import React from 'react';

const TABS = [
  { id: 'patrones',   emoji: '🧶', label: 'Patrones'   },
  { id: 'inventario', emoji: '🧵', label: 'Inventario'  },
  { id: 'negocio',    emoji: '💼', label: 'Negocio'     },
  { id: 'organizar',  emoji: '🏷️', label: 'Organizar'  },
];

export default function BottomNav({ active, onChange }) {
  return (
    <>
      {/* ── Bottom tab bar (móvil) ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        backgroundColor: '#1A1A2E',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
        borderTop: '1px solid #2D2D4E',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
      }}>
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                flex: 1, padding: '10px 4px 8px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s ease',
              }}
            >
              {/* Pill indicador activo */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  width: 32, height: 3, borderRadius: 99,
                  backgroundColor: '#FAD2E1',
                  marginTop: -10,
                }}/>
              )}
              <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.emoji}</span>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 800 : 600,
                color: isActive ? '#FAD2E1' : '#6B7280',
                letterSpacing: 0.3,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Spacer para que el contenido no quede tapado por el nav */}
      <div style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }} />
    </>
  );
}
