import React, { useState } from 'react';
import CarritoPanel from '../../components/CarritoPanel';
import CanalSelectorModal from '../../components/CanalSelectorModal';
import StoreEventModal from '../../components/StoreEventModal';
import { TIPOS_EVENTO } from '../../lib/constants';
import { useToast } from '../../components/Toast';
import { COLORS, Z_INDEX } from '../../lib/constants';

const CANAL_TIPOS = ['venta_directa', 'bazar', 'boutique', 'online'];

function precioDe(canal, product) {
  const tipo = canal?.tipo_canal || canal?.tipo || 'bazar';
  if (tipo === 'boutique') {
    const boutique = Number(product.precio_boutique);
    return boutique > 0 ? boutique : Number(product.precio_venta) || 0;
  }
  return Number(product.precio_venta) || 0;
}

export default function VenderTab({ products, channels, activeChannel, onSetChannel, onRegisterSale, channelStats, isOnline, pendingCount, onSaveChannel, onClose }) {
  const { showToast } = useToast();

  const [cart,        setCart]        = useState([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [showCanales, setShowCanales] = useState(false);
  const [newChannelModal, setNewChannelModal] = useState(false);

  const disponible = (p) => Math.max(0, (p.stock_inicial || 0) - (p.stock_vendido || 0));

  const addToCart = (product) => {
    if (disponible(product) <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, disponible(product)) }
            : i
        );
      }
      const precio = precioDe(activeChannel, product);
      return [...prev, { product, cantidad: 1, precio_unit: precio }];
    });
  };

  const changeQty = (productId, cantidad) => {
    setCart(prev => prev.map(i =>
      i.product.id === productId
        ? { ...i, cantidad: Math.max(0, Math.min(Number(cantidad) || 0, disponible(i.product))) }
        : i
    ));
  };

  const removeFromCart = (productId) =>
    setCart(prev => prev.filter(i => i.product.id !== productId));

  const cartItems = cart
    .filter(i => i.cantidad > 0)
    .map(i => ({ ...i, subtotal: i.cantidad * (i.precio_unit || 0) }));

  const totalPiezas  = cartItems.reduce((s, i) => s + i.cantidad, 0);
  const totalCarrito = cartItems.reduce((s, i) => s + i.subtotal, 0);

  const handleCobrar = async ({ items, metodoPago, notas }) => {
    try {
      const payload = {
        channel: activeChannel,
        metodoPago,
        notas,
        items: items.map(i => ({
          product_id: i.product.id,
          cantidad:   i.cantidad,
          precio_unit: i.precio_unit,
          nombre:     i.product.nombre,
          emoji:      i.product.emoji,
        })),
      };
      await onRegisterSale(payload);
      showToast('💸 ¡Venta registrada!');
      setCart([]);
      setShowCarrito(false);
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const handleSaveChannel = async (form) => {
    try {
      if (onSaveChannel) {
        const saved = await onSaveChannel(form);
        showToast(form.id ? '✅ Canal actualizado' : '🏪 Canal creado');
        setNewChannelModal(false);
        if (saved?.id && onSetChannel) onSetChannel(saved.id);
      }
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const stats = activeChannel ? channelStats(activeChannel.id) : null;
  const hoy = new Date().toISOString().slice(0, 10);
  const hoyVentas = (stats?.ventas || []).filter(v => v.fecha === hoy);
  const hoyPiezas  = hoyVentas.reduce((s, v) => s + (v.cantidad || 0), 0);
  const hoyEfectivo = hoyVentas.filter(v => v.metodo_pago === 'efectivo').reduce((s, v) => s + (v.total || 0), 0);
  const hoyTransfer = hoyVentas.filter(v => v.metodo_pago === 'transferencia').reduce((s, v) => s + (v.total || 0), 0);

  const tipoCanal = activeChannel?.tipo_canal || activeChannel?.tipo || null;
  const tipoLabel = TIPOS_EVENTO.find(t => t.id === tipoCanal)?.label
    || CANAL_TIPOS.find(t => t === tipoCanal)
    || (activeChannel ? 'Canal' : 'Sin canal');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'inherit', paddingBottom: 120 }}>

      {/* Header canal */}
      <div style={{
        backgroundColor: COLORS.header,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: Z_INDEX.header,
      }}>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#4B5563', padding: '4px 4px 4px 0', fontFamily: 'inherit' }}>←</button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#FAD2E1', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vendiendo en</div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeChannel ? `${activeChannel.nombre} · ${tipoLabel}` : 'Ningún canal'}
          </div>
        </div>
        <button onClick={() => setShowCanales(true)} style={{
          backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
          padding: '8px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          color: '#fff', fontFamily: 'inherit', whiteSpace: 'nowrap', minHeight: 40,
        }}>🔄 Cambiar canal</button>
      </div>

      <div style={{ padding: '16px', maxWidth: 960, margin: '0 auto' }}>

        {/* Banner offline */}
        {!isOnline && (
          <div style={{
            backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA',
            borderRadius: 12, padding: '12px 16px', marginBottom: 12,
            fontSize: 13, color: '#991B1B', fontWeight: 700,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔴 Sin conexión — modo bazar activo</span>
              {pendingCount > 0 && (
                <span style={{ backgroundColor: '#EF4444', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 11 }}>
                  {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: '#B91C1C' }}>
              Tus ventas se guardan localmente y se sincronizan al reconectar
            </div>
          </div>
        )}

        {isOnline && pendingCount > 0 && (
          <div style={{
            backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 12,
            padding: '10px 16px', marginBottom: 12, fontSize: 13, color: '#92400E', fontWeight: 700,
          }}>
            🔄 Sincronizando {pendingCount} operación{pendingCount !== 1 ? 'es' : ''}…
          </div>
        )}

        {!activeChannel && (
          <div style={{
            backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12,
            padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#1D4ED8', fontWeight: 700,
          }}>
            Selecciona un canal para comenzar a vender →
          </div>
        )}

        {/* Grid de productos */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48 }}>🧸</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.textMuted, marginTop: 10 }}>
              ¡Agrega tu primer producto!
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
            {products.map(p => {
              const disp = disponible(p);
              const agotado = disp <= 0;
              const precio = precioDe(activeChannel, p);
              return (
                <div key={p.id} style={{
                  backgroundColor: agotado ? '#FEF2F2' : '#fff',
                  borderRadius: 16, padding: 14,
                  border: `1.5px solid ${agotado ? '#FECACA' : '#E5E7EB'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  opacity: agotado ? 0.8 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      backgroundColor: p.color_hex || '#FAD2E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>{p.emoji}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 12, color: COLORS.textPrimary, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                      <div style={{ fontSize: 10, color: agotado ? '#EF4444' : COLORS.textMuted, fontWeight: 700, marginTop: 1 }}>
                        {agotado ? '⚠️ Agotado' : `${disp} disponibles`}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>
                    ${precio.toFixed(2)}
                    <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted }}> c/u</span>
                  </div>
                  <button onClick={() => addToCart(p)} disabled={agotado || !activeChannel} style={{
                    width: '100%', padding: '8px 0', borderRadius: 10, border: 'none',
                    backgroundColor: agotado || !activeChannel ? '#E5E7EB' : '#1A1A2E',
                    fontWeight: 800, fontSize: 13, cursor: agotado || !activeChannel ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', color: agotado || !activeChannel ? '#9CA3AF' : '#FAD2E1',
                  }}>+ Agregar</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumen del evento */}
        {activeChannel && stats && (
          <div style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              📊 Resumen de hoy · {activeChannel.nombre}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { emoji: '🧶', val: hoyPiezas, label: 'Piezas' },
                { emoji: '💵', val: `$${hoyEfectivo.toFixed(0)}`, label: 'Efectivo' },
                { emoji: '🏦', val: `$${hoyTransfer.toFixed(0)}`, label: 'Transferencia' },
                { emoji: '💰', val: `$${(hoyEfectivo + hoyTransfer).toFixed(0)}`, label: 'Total', green: true },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16 }}>{s.emoji}</div>
                  <div style={{ fontWeight: 900, fontSize: 13, color: s.green ? '#059669' : COLORS.textPrimary, marginTop: 2 }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Carrito flotante */}
      {cartItems.length > 0 && (
        <button onClick={() => setShowCarrito(true)} style={{
          position: 'fixed', bottom: 'max(48px, env(safe-area-inset-bottom, 24px))', right: 24,
          zIndex: Z_INDEX.fab,
          backgroundColor: '#1A1A2E', border: 'none', borderRadius: 28,
          padding: '14px 20px', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}>
          <span style={{ fontSize: 20 }}>🛒</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{totalPiezas}</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#25D366' }}>${totalCarrito.toFixed(2)}</span>
        </button>
      )}

      {/* Panels / modals */}
      <CarritoPanel
        visible={showCarrito}
        items={cartItems}
        canal={activeChannel}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onCobrar={handleCobrar}
        onClose={() => setShowCarrito(false)}
      />

      <CanalSelectorModal
        visible={showCanales}
        channels={channels}
        activeChannel={activeChannel}
        onSelect={(c) => { onSetChannel(c.id); setShowCanales(false); }}
        onNew={() => { setNewChannelModal(true); setShowCanales(false); }}
        onClose={() => setShowCanales(false)}
      />

      <StoreEventModal
        visible={newChannelModal}
        onClose={() => setNewChannelModal(false)}
        onSave={handleSaveChannel}
      />
    </div>
  );
}