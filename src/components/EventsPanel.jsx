import React, { useState } from 'react';
import { TIPOS_EVENTO } from '../hooks/useStore';
import { COLORS } from '../lib/constants';

function tipoEvento(tipo) {
  return TIPOS_EVENTO.find(t => t.id === tipo) || { emoji: '📍', label: tipo };
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventsPanel({ visible, events, eventStats, onClose, onNew, onEdit, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{
        width: '100%', maxHeight: '92vh', overflowY: 'auto',
        backgroundColor: '#fff', borderRadius: '20px 20px 0 0',
        padding: '0 0 40px',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: COLORS.textPrimary }}>🏪 Eventos y lugares</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onNew} style={{
              backgroundColor: '#FAD2E1', border: 'none', borderRadius: 10,
              padding: '8px 14px', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit', color: '#1A1A2E',
            }}>+ Nuevo</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
          </div>
        </div>

        {/* Confirm delete */}
        {confirmId && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 700, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🗑</div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>¿Eliminar evento?</div>
              <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>Las ventas registradas en este evento no se borrarán.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmId(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '2px solid #E5E7EB', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                <button onClick={() => { onDelete(confirmId); setConfirmId(null); }} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#EF4444', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textMuted }}>
              <div style={{ fontSize: 40 }}>🏪</div>
              <div style={{ fontWeight: 700, marginTop: 10 }}>Aún no tienes eventos</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Crea un bazar, tienda o cualquier lugar de venta</div>
            </div>
          ) : (
            events.map(ev => {
              const tipo  = tipoEvento(ev.tipo);
              const stats = eventStats(ev.id);
              const isOpen = expandedId === ev.id;

              return (
                <div key={ev.id} style={{
                  backgroundColor: '#fff', borderRadius: 16,
                  border: '1.5px solid #E5E7EB',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}>
                  {/* Cabecera del evento */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : ev.id)}
                    style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      backgroundColor: '#F5F0EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                      flexShrink: 0,
                    }}>{tipo.emoji}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.textPrimary }}>{ev.nombre}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                        {tipo.label}
                        {ev.fecha_inicio && ` · ${formatDate(ev.fecha_inicio)}`}
                        {ev.fecha_fin && ev.fecha_fin !== ev.fecha_inicio && ` → ${formatDate(ev.fecha_fin)}`}
                      </div>
                    </div>

                    {/* Mini stats */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#059669' }}>${stats.ingresos.toFixed(0)}</div>
                      <div style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700 }}>{stats.piezas} piezas</div>
                    </div>

                    <span style={{ color: COLORS.textMuted, fontSize: 12, marginLeft: 4 }}>{isOpen ? '▲' : '▼'}</span>
                  </div>

                  {/* Detalle expandido */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 16px', backgroundColor: '#FAFAFA' }}>

                      {stats.ventas.length === 0 ? (
                        <div style={{ fontSize: 13, color: COLORS.textMuted, textAlign: 'center', padding: '8px 0' }}>
                          Sin ventas registradas en este evento
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                          {stats.ventas.map(v => (
                            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                              <span style={{ color: COLORS.textPrimary }}>
                                {v.product_emoji} {v.product_nombre} × {v.cantidad}
                              </span>
                              <span style={{ fontWeight: 700, color: '#059669' }}>${v.total.toFixed(2)}</span>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: 13 }}>Total evento</span>
                            <span style={{ fontWeight: 900, fontSize: 15, color: '#059669' }}>${stats.ingresos.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {ev.notas && (
                        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 10, fontStyle: 'italic' }}>
                          📝 {ev.notas}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => onEdit(ev)} style={{
                          flex: 1, padding: '8px', borderRadius: 10,
                          border: '1.5px solid #E5E7EB', background: '#fff',
                          fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                        }}>✏️ Editar</button>
                        <button onClick={() => setConfirmId(ev.id)} style={{
                          flex: 1, padding: '8px', borderRadius: 10,
                          border: '1.5px solid #FECACA', background: '#FEF2F2',
                          fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#EF4444',
                        }}>🗑 Eliminar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
