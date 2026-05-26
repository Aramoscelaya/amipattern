import React, { useState } from 'react';
import Badge from '../components/Badge';
import { COLORS } from '../lib/constants';

const progress = p =>
  !p.pasos?.length ? 0 : Math.round(p.pasos.filter(s => s.hecho).length / p.pasos.length * 100);

export default function DetailScreen({ pattern, onBack, onEdit, onDelete, onToggleStep }) {
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [counter,     setCounter]     = useState(0);
  const [showCounter, setShowCounter] = useState(false);

  const pct      = progress(pattern);
  const barColor = pct === 100 ? COLORS.teal : COLORS.orange;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg }}>

      {/* Sticky top bar — con safe area para móvil */}
      <div style={{
        backgroundColor: pattern.color,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{
          backgroundColor: 'rgba(255,255,255,0.4)', border: 'none', borderRadius: 10,
          padding: '8px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          color: '#1A1A2E', fontFamily: 'inherit',
          minHeight: 40, minWidth: 80,           // área táctil mínima
        }}>← Volver</button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEdit} style={{
            backgroundColor: 'rgba(255,255,255,0.4)', border: 'none', borderRadius: 10,
            padding: '8px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            color: '#1A1A2E', fontFamily: 'inherit',
            minHeight: 40,
          }}>✏️ Editar</button>
          <button onClick={() => setConfirmDel(true)} style={{
            backgroundColor: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 10,
            padding: '8px 12px', cursor: 'pointer', fontSize: 18,
            minHeight: 40, minWidth: 44,
          }}>🗑</button>
        </div>
      </div>

      {/* Confirm delete dialog */}
      {confirmDel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: 20, padding: 24,
            maxWidth: 360, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Eliminar patrón</div>
            <div style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>
              ¿Seguro que quieres eliminar "{pattern.nombre}"?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(false)} style={{
                flex: 1, padding: 12, borderRadius: 12,
                border: '2px solid #E5E7EB', background: 'transparent',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>Cancelar</button>
              <button onClick={onDelete} style={{
                flex: 1, padding: 12, borderRadius: 12,
                background: '#EF4444', border: 'none',
                color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ backgroundColor: pattern.color, padding: '0 20px 24px' }}>
          {pattern.imagen_url && (
            <img src={pattern.imagen_url} alt={pattern.nombre}
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 14, display: 'block' }} />
          )}
          <div style={{ fontSize: 44 }}>{pattern.emoji}</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#1A1A2E', marginTop: 4, lineHeight: 1.2 }}>
            {pattern.nombre}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Badge text={pattern.estado} />
            <Badge text={pattern.dificultad} />
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Info grid */}
          <div style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {[
                { l: '📏 Talla',  v: pattern.talla || '—' },
                { l: '🪝 Aguja', v: pattern.aguja || '—' },
                { l: '📅 Inicio', v: pattern.fecha || '—' },
                { l: '🧵 Hilos',  v: pattern.hilos?.length ? pattern.hilos.join(', ') : '—' },
              ].map(x => (
                <div key={x.l} style={{ minWidth: '40%', flex: 1 }}>
                  <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
                    {x.l}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Materiales */}
          {!!pattern.materiales && (
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                🧰 Materiales
              </div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{pattern.materiales}</div>
            </div>
          )}

          {/* Pasos */}
          {pattern.pasos?.length > 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  📋 Patrón paso a paso
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.teal }}>
                  {pattern.pasos.filter(s => s.hecho).length}/{pattern.pasos.length}
                </span>
              </div>
              <div style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pattern.pasos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => onToggleStep(p.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: 10, borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${p.hecho ? '#BBF7D0' : '#F3F4F6'}`,
                      backgroundColor: p.hecho ? '#F0FDF4' : '#FAFAFA',
                      textAlign: 'left', width: '100%', fontFamily: 'inherit',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 11, flexShrink: 0, marginTop: 1,
                      backgroundColor: p.hecho ? COLORS.teal : '#E5E7EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {p.hecho && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 14, lineHeight: 1.5,
                      color: p.hecho ? '#9CA3AF' : '#374151',
                      textDecoration: p.hecho ? 'line-through' : 'none',
                    }}>
                      <strong style={{ color: '#D1D5DB' }}>{i + 1}. </strong>{p.texto}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {!!pattern.notas && (
            <div style={{
              backgroundColor: '#FFFBEB', border: '1.5px solid #FDE68A',
              borderRadius: 16, padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                💡 Notas
              </div>
              <div style={{ fontSize: 14, color: '#78350F', lineHeight: 1.6 }}>{pattern.notas}</div>
            </div>
          )}

          <div style={{ height: 100 }} />
        </div>
      </div>

      {/* ── CONTADOR FLOTANTE ─────────────────────────────────────── */}
      <button
        onClick={() => setShowCounter(s => !s)}
        title="Contador de vueltas"
        style={{
          position: 'fixed',
          bottom: 'max(50px, env(safe-area-inset-bottom, 24px))',
          right: 24, zIndex: 300,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: "#687c8f", border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          cursor: 'pointer', fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}
      >
        🔢
      </button>

      {showCounter && (
        <div style={{
          position: 'fixed',
          bottom: 'max(90px, calc(env(safe-area-inset-bottom, 0px) + 90px))',
          right: 24, zIndex: 300,
          backgroundColor: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '20px 24px',
          minWidth: 200,
          textAlign: 'center',
          animation: 'slideUpCounter 0.2s ease',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: COLORS.textMuted,
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14,
          }}>
            🧶 Contador de puntos
          </div>
          <div style={{
            fontSize: 64, fontWeight: 900, color: COLORS.header,
            lineHeight: 1, marginBottom: 16,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {counter}
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <button
              onClick={() => setCounter(c => Math.max(0, c - 1))}
              style={{
                flex: 1, height: 48, borderRadius: 14,
                border: '2px solid #E5E7EB', backgroundColor: '#F9FAFB',
                fontSize: 24, fontWeight: 900, cursor: 'pointer',
                color: counter === 0 ? '#D1D5DB' : '#1A1A2E',
                fontFamily: 'inherit',
              }}
            >−</button>
            <button
              onClick={() => setCounter(c => c + 1)}
              style={{
                flex: 1, height: 48, borderRadius: 14,
                border: 'none', backgroundColor: '#aa798b',
                fontSize: 24, fontWeight: 900, cursor: 'pointer',
                color: '#fff', fontFamily: 'inherit',
              }}
            >+</button>
          </div>
          <button
            onClick={() => setCounter(0)}
            disabled={counter === 0}
            style={{
              width: '100%', padding: '8px 0', borderRadius: 10,
              border: 'none', backgroundColor: 'transparent',
              color: '#EF4444', fontWeight: 700, fontSize: 13,
              cursor: counter === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: counter === 0 ? 0.4 : 1,
            }}
          >↺ Reiniciar</button>
        </div>
        
      )}
      <div
        style={{
          fontSize: 11,
          marginTop: 1,
          display:"inline-block",
          background:"#f6f1ee",
          padding:"6px 12px",
          borderRadius:20,
          color:"#7a6d66",
          position: 'fixed',
          bottom: 'max(20px, env(safe-area-inset-bottom, 24px))',
          right: 24, zIndex: 300,
          width: 160, height: 20,
          //display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease'
        }}>
            Creado por Minué Crochet
      </div>

      <style>{`
        @keyframes slideUpCounter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
