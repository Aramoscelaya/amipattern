import React, { useState, useCallback } from 'react';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductModal from '../components/ProductModal';
import { usePriceConfig, usePriceList } from '../hooks/usePriceList';
import { useCommerce } from '../hooks/useCommerce';
import { COLORS, Z_INDEX } from '../lib/constants';

const progress = p =>
  !p.pasos?.length ? 0 : Math.round(p.pasos.filter(s => s.hecho).length / p.pasos.length * 100);

const isLightColor = hex => {
  const h = (hex || '').replace('#', '');
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
};

export default function DetailScreen({ user, pattern, onBack, onEdit, onDelete, onToggleStep, onResetPattern, onGoToInventory }) {
  const { config: priceConfig } = usePriceConfig(user?.id);
  const { saveCosting } = useCommerce(user?.id);
  const { saveItem: savePriceListItem } = usePriceList(user?.id);

  const handleSaveProductModal = useCallback(async ({ costing, storeProduct, priceListItem }) => {
    if (costing && storeProduct) {
      const merged = { ...costing, ...storeProduct };
      await saveCosting(merged, { createProduct: true });
    }
    if (priceListItem) {
      await savePriceListItem(priceListItem);
    }
  }, [saveCosting, savePriceListItem]);

  const [confirmDel,  setConfirmDel]  = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [counter,     setCounter]     = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const [prodModal,   setProdModal]   = useState(false);
  const [prodInitial, setProdInitial] = useState(null);

  const pct      = progress(pattern);
  const barColor = pct === 100 ? COLORS.teal : COLORS.orange;

  const heroLight  = isLightColor(pattern.color);
  const heroInk    = heroLight ? COLORS.onAccent : COLORS.textPrimary;
  const heroOverlay = heroLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.16)';
  const cardStyle = {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg }}>

      {/* Sticky top bar — con safe area para móvil */}
      <div style={{
        backgroundColor: COLORS.bg,
        borderBottom: `1px solid ${COLORS.border}`,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        position: 'sticky', top: 0, zIndex: Z_INDEX.header,
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <button onClick={onBack} style={{
            backgroundColor: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 10,
            padding: '8px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            color: COLORS.textPrimary, fontFamily: 'inherit',
            minHeight: 40, whiteSpace: 'nowrap', flexShrink: 0,
          }}>← Volver</button>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={() => { setProdInitial({
              nombre: pattern.nombre,
              emoji: pattern.emoji,
              patron_id: pattern.id,
              patron_nombre: pattern.nombre,
            }); setProdModal(true); }} style={{
              backgroundColor: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 10,
              padding: '8px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              color: COLORS.textSecondary, fontFamily: 'inherit',
              minHeight: 40, whiteSpace: 'nowrap',
            }}>📦 Crear</button>
            <button onClick={onEdit} style={{
              backgroundColor: COLORS.accent, border: 'none', borderRadius: 10,
              padding: '8px 10px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
              color: COLORS.onAccent, fontFamily: 'inherit',
              minHeight: 40, whiteSpace: 'nowrap',
            }}>✏️ Editar</button>
            <button onClick={() => setConfirmReset(true)} style={{
              backgroundColor: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 10,
              padding: '8px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              color: COLORS.textSecondary, fontFamily: 'inherit',
              minHeight: 40, whiteSpace: 'nowrap',
            }}>🔄 Repetir</button>
            <button onClick={() => setConfirmDel(true)} style={{
              backgroundColor: COLORS.danger.bg, border: `1px solid ${COLORS.danger.border}`, borderRadius: 10,
              padding: '8px 10px', cursor: 'pointer', fontSize: 16, color: COLORS.danger.fg,
              minHeight: 40, minWidth: 40,
            }}>🗑</button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        visible={confirmDel}
        title="Eliminar patrón"
        message={`¿Seguro que quieres eliminar "${pattern.nombre}"?`}
        onConfirm={onDelete}
        onCancel={() => setConfirmDel(false)}
      />

      <ConfirmDialog
        visible={confirmReset}
        title="Repetir patrón"
        message="¿Resetear todos los pasos? Esto marcará todas las etapas como no completadas."
        confirmLabel="Resetear"
        confirmColor={COLORS.teal}
        onConfirm={async () => {
          await onResetPattern(pattern.id);
          setCounter(0);
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
        {/* Hero */}
        <div style={{
          backgroundColor: pattern.color,
          borderRadius: 20,
          padding: 20,
          marginBottom: 14,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}>
          {pattern.imagen_url && (
            <img src={pattern.imagen_url} alt={pattern.nombre}
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 14, marginBottom: 16, display: 'block' }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              backgroundColor: heroOverlay,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
            }}>{pattern.emoji}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: heroInk, lineHeight: 1.2, minWidth: 0 }}>
              {pattern.nombre}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Badge text={pattern.estado} />
            <Badge text={pattern.dificultad} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Info grid */}
          <div style={cardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: '📏 Talla',  v: pattern.talla || '—' },
                { l: '🪝 Aguja', v: pattern.aguja || '—' },
                { l: '📅 Inicio', v: pattern.fecha || '—' },
                { l: '🧵 Hilos',  v: pattern.hilos?.length ? pattern.hilos.join(', ') : '—' },
              ].map(x => (
                <div key={x.l} style={{
                  minWidth: 0, backgroundColor: COLORS.surface2,
                  border: `1px solid ${COLORS.border}`, borderRadius: 12,
                  padding: '10px 12px',
                }}>
                  <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>
                    {x.l}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.4, wordBreak: 'break-word' }}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Materiales */}
          {!!pattern.materiales && (
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                🧰 Materiales
              </div>
              <div style={{ fontSize: 14, color: COLORS.textPrimary, lineHeight: 1.6 }}>{pattern.materiales}</div>
              <button onClick={onGoToInventory} style={{
                marginTop: 10, background: 'none', border: 'none', padding: 0,
                color: COLORS.accent, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              }}>→ Ver inventario</button>
            </div>
          )}

          {/* Pasos */}
          {pattern.pasos?.length > 0 && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  📋 Patrón paso a paso
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: COLORS.success.fg,
                  backgroundColor: COLORS.surface2, border: `1px solid ${COLORS.border}`,
                  borderRadius: 99, padding: '3px 10px', whiteSpace: 'nowrap',
                }}>
                  {pattern.pasos.filter(s => s.hecho).length}/{pattern.pasos.length}
                </span>
              </div>
              <div style={{ height: 8, backgroundColor: COLORS.border, borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pattern.pasos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => onToggleStep(p.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${p.hecho ? COLORS.success.border : COLORS.border}`,
                      backgroundColor: p.hecho ? COLORS.success.bg : COLORS.surface2,
                      textAlign: 'left', width: '100%', fontFamily: 'inherit',
                      transition: 'background 0.15s ease, border-color 0.15s ease',
                    }}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: 12, flexShrink: 0, marginTop: 1,
                      backgroundColor: p.hecho ? COLORS.teal : COLORS.bg,
                      border: `1px solid ${p.hecho ? COLORS.teal : COLORS.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {p.hecho && <span style={{ color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: 14, lineHeight: 1.55,
                      color: p.hecho ? COLORS.textMuted : COLORS.textPrimary,
                      textDecoration: p.hecho ? 'line-through' : 'none',
                    }}>
                      <strong style={{ color: p.hecho ? COLORS.textMuted : COLORS.textSecondary }}>{i + 1}. </strong>{p.texto}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {!!pattern.notas && (
            <div style={{
              ...cardStyle,
              backgroundColor: COLORS.warning.bg, border: `1.5px solid ${COLORS.warning.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.warning.fg, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                💡 Notas
              </div>
              <div style={{ fontSize: 14, color: COLORS.warning.fg, lineHeight: 1.6 }}>{pattern.notas}</div>
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
          bottom: 'max(48px, env(safe-area-inset-bottom, 24px))',
          right: 24, zIndex: Z_INDEX.fab,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: COLORS.accent, border: 'none',
          boxShadow: '0 4px 20px rgba(250,210,225,0.25)',
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
          right: 24, zIndex: Z_INDEX.fab,
          backgroundColor: COLORS.card,
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
            fontSize: 64, fontWeight: 900, color: COLORS.accent,
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
                border: `2px solid ${COLORS.border}`, backgroundColor: COLORS.surface2,
                fontSize: 24, fontWeight: 900, cursor: 'pointer',
                color: counter === 0 ? COLORS.textMuted : COLORS.textPrimary,
                fontFamily: 'inherit',
              }}
            >−</button>
            <button
              onClick={() => setCounter(c => c + 1)}
              style={{
                flex: 1, height: 48, borderRadius: 14,
                border: 'none', backgroundColor: COLORS.accent,
                fontSize: 24, fontWeight: 900, cursor: 'pointer',
                color: COLORS.onAccent, fontFamily: 'inherit',
              }}
            >+</button>
          </div>
          <button
            onClick={() => setCounter(0)}
            disabled={counter === 0}
            style={{
              width: '100%', padding: '8px 0', borderRadius: 10,
              border: 'none', backgroundColor: 'transparent',
              color: COLORS.danger.fg, fontWeight: 700, fontSize: 13,
              cursor: counter === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit', opacity: counter === 0 ? 0.4 : 1,
            }}
          >↺ Reiniciar</button>
        </div>
        
      )}

      {/* ProductModal */}
      <ProductModal visible={prodModal} initial={prodInitial} patterns={[]} priceConfig={priceConfig}
        onClose={() => { setProdModal(false); setProdInitial(null); }}
        onSave={async (payload) => {
          await handleSaveProductModal(payload);
          setProdModal(false); setProdInitial(null);
        }}
      />

      <style>{`
        @keyframes slideUpCounter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
