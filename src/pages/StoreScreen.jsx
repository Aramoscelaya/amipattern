import React, { useState } from 'react';
import { useStore, useStoreCostings, CATEGORIAS } from '../hooks/useStore';
import { usePriceList } from '../hooks/usePriceList';
import StoreProductModal from '../components/StoreProductModal';
import SaleModal         from '../components/SaleModal';
import StoreEventModal   from '../components/StoreEventModal';
import EventsPanel       from '../components/EventsPanel';
import ProductModal      from '../components/ProductModal';
import ConfirmDialog     from '../components/ConfirmDialog';
import { useToast }      from '../components/Toast';
import { COLORS, Z_INDEX } from '../lib/constants';

const FILTROS = [
  { id: 'todos',     label: 'Todos'       },
  { id: 'con_stock', label: '✅ Con stock' },
  { id: 'sin_stock', label: '⚠️ Agotados' },
  ...CATEGORIAS.map(c => ({ id: c.id, label: `${c.emoji} ${c.label}` })),
];

function StockBar({ inicial, vendido }) {
  const disponible = Math.max(0, inicial - vendido);
  const pct        = inicial > 0 ? (disponible / inicial) * 100 : 0;
  const color      = pct === 0 ? '#EF4444' : pct < 30 ? '#F59E0B' : '#10B981';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 5, backgroundColor: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 99, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 10, color: color, fontWeight: 800 }}>{disponible} disponibles</span>
        <span style={{ fontSize: 10, color: COLORS.textMuted }}>{vendido} vendidos</span>
      </div>
    </div>
  );
}

function ProductCard({ product, onSell, onEdit, onAddStock, onAddToPriceList, hasPriceListEntry }) {
  const disponible = (product.stock_inicial || 0) - (product.stock_vendido || 0);
  const agotado    = disponible <= 0;
  return (
    <div style={{
      backgroundColor: agotado ? '#FEF2F2' : '#fff',
      borderRadius: 16, padding: 14,
      border: `1.5px solid ${agotado ? '#FECACA' : '#E5E7EB'}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            backgroundColor: product.color_hex || '#FAD2E1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>{product.emoji}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.2 }}>{product.nombre}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>
              {CATEGORIAS.find(c => c.id === product.categoria)?.label || product.categoria}
              {product.patron_nombre && ` · ${product.patron_nombre}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {!hasPriceListEntry && (
            <button onClick={() => onAddToPriceList(product)} style={{ background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', color: COLORS.textMuted, padding: 4 }}>💰</button>
          )}
          <button onClick={() => onEdit(product)} style={{ background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', color: COLORS.textMuted, padding: 4 }}>✏️</button>
        </div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>
        ${Number(product.precio_venta || 0).toFixed(0)}
        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted }}> c/u</span>
      </div>
      <StockBar inicial={product.stock_inicial || 0} vendido={product.stock_vendido || 0} />
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button onClick={() => onAddStock(product)} style={{
          flex: 1, padding: '7px 0', borderRadius: 10,
          border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB',
          fontWeight: 700, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', color: COLORS.textSecondary,
        }}>📦 +Stock</button>
        <button onClick={() => !agotado && onSell(product)} disabled={agotado} style={{
          flex: 2, padding: '7px 0', borderRadius: 10, border: 'none',
          backgroundColor: agotado ? '#E5E7EB' : '#1A1A2E',
          fontWeight: 800, fontSize: 12, cursor: agotado ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', color: agotado ? '#9CA3AF' : '#FAD2E1',
        }}>{agotado ? 'Agotado' : '💸 Vender'}</button>
      </div>
    </div>
  );
}

function AddStockModal({ visible, product, onClose, onSave }) {
  const [cantidad, setCantidad] = useState('');
  const [saving,   setSaving]   = useState(false);
  React.useEffect(() => { if (visible) setCantidad(''); }, [visible]);
  if (!visible || !product) return null;
  const handle = async () => {
    const n = Number(cantidad);
    if (!n || n <= 0) return;
    setSaving(true);
    try { await onSave(product.id, n); } finally { setSaving(false); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.modal, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, maxWidth: 320, width: '100%' }}>
        <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>📦 Agregar stock</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>
          {product.emoji} {product.nombre} · actualmente {(product.stock_inicial || 0) - (product.stock_vendido || 0)} disponibles
        </div>
        <input type="number" inputMode="numeric" value={cantidad} onChange={e => setCantidad(e.target.value)}
          placeholder="¿Cuántas piezas nuevas?" autoFocus
          style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: '2px solid #E5E7EB', background: 'transparent', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
          <button onClick={handle} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 12, backgroundColor: '#1A1A2E', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Guardando…' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function StoreScreen({ user, patterns = [], onBack }) {
  const {
    products, events, loading, error,
    saveProduct, deleteProduct,
    saveEvent, deleteEvent,
    registerSale,
    addStock,
    statsGlobal, eventStats,
  } = useStore(user?.id);

  const { costings, saveCosting } = useStoreCostings(user?.id);
  const { items: priceListItems, saveItem: savePriceListItem } = usePriceList(user?.id);

  const { showToast } = useToast();

  const [filtro, setFiltro] = useState('todos');
  const [search, setSearch] = useState('');

  const [storeProductModal, setStoreProductModal] = useState(false);
  const [editingProd,   setEditingProd]   = useState(null);
  const [saleModal,     setSaleModal]     = useState(false);
  const [sellingProd,   setSellingProd]   = useState(null);
  const [eventModal,    setEventModal]    = useState(false);
  const [editingEvt,    setEditingEvt]    = useState(null);
  const [eventsPanel,   setEventsPanel]   = useState(false);
  const [productModal,  setProductModalState] = useState(false);
  const [editingProduct, setEditingProduct]   = useState(null);
  const [priceListModal, setPriceListModal]   = useState(false);
  const [priceListProd,  setPriceListProd]    = useState(null);
  const [addStockModal, setAddStockModal] = useState(false);
  const [addStockProd,  setAddStockProd]  = useState(null);
  const [confirmId,     setConfirmId]     = useState(null);

  const filtered = products.filter(p => {
    if (filtro === 'con_stock' && (p.stock_inicial - p.stock_vendido) <= 0) return false;
    if (filtro === 'sin_stock' && (p.stock_inicial - p.stock_vendido) >  0) return false;
    if (!['todos','con_stock','sin_stock'].includes(filtro) && p.categoria !== filtro) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSaveProduct = async (form) => {
    try {
      await saveProduct(form);
      showToast(form.id ? '✅ Producto actualizado' : '🧸 Producto agregado');
      setStoreProductModal(false); setEditingProd(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleSale = async (saleData) => {
    try {
      await registerSale(saleData);
      showToast('💸 ¡Venta registrada!');
      setSaleModal(false); setSellingProd(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleSaveEvent = async (form) => {
    try {
      await saveEvent(form);
      showToast(form.id ? '✅ Evento actualizado' : '🏪 Evento creado');
      setEventModal(false); setEditingEvt(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleDeleteEvent = async (id) => {
    try { await deleteEvent(id); showToast('🗑 Evento eliminado'); }
    catch (e) { showToast('Error: ' + e.message); }
  };

  const handleAddStock = async (productId, cantidad) => {
    try {
      await addStock(productId, cantidad);
      showToast('📦 Stock actualizado');
      setAddStockModal(false); setAddStockProd(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setConfirmId(null); showToast('🗑 Producto eliminado');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleSavePriceListProduct = async ({ costing, storeProduct, priceListItem }) => {
    try {
      if (priceListItem) {
        await savePriceListItem(priceListItem);
      }
      showToast('💰 Agregado a lista de precios');
      setPriceListModal(false); setPriceListProd(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleSaveProductModal = async ({ costing, storeProduct, priceListItem }) => {
    try {
      if (costing && storeProduct) {
        const merged = { ...costing, ...storeProduct };
        await saveCosting(merged, saveProduct);
      } else if (costing && !storeProduct) {
        await saveCosting(costing, null);
      }
      if (priceListItem) {
        await savePriceListItem(priceListItem);
      }
      showToast('✅ Guardado');
      setProductModalState(false); setEditingProduct(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  return (
    <div style={{ minHeight: '80vh', backgroundColor: COLORS.bg, fontFamily: 'inherit' }}>

      <ConfirmDialog
        visible={confirmId !== null}
        title="¿Eliminar producto?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => handleDeleteProduct(confirmId)}
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
        <div style={{ color: '#FAD2E1', fontSize: 18, fontWeight: 900 }}>🏪 Tienda</div>
      </div>

      <div style={{ padding: '16px 16px', maxWidth: 960, margin: '0 auto' }}>

        {/* Acciones rápidas */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { id: 'costo',    emoji: '🧮', label: 'Calcular costo', onClick: () => { setEditingProduct(null); setProductModalState(true); } },
            { id: 'lugar',    emoji: '🏪', label: 'Nuevo lugar',    onClick: () => { setEditingEvt(null); setEventModal(true); } },
            { id: 'producto', emoji: '🧸', label: 'Nuevo producto', onClick: () => { setEditingProd(null); setStoreProductModal(true); } },
          ].map(a => (
            <button key={a.id} onClick={a.onClick} style={{
              flex: '1 1 0', minWidth: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              backgroundColor: '#1A1A2E', border: 'none', borderRadius: 12,
              padding: '11px 10px', cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              <span style={{ fontSize: 17 }}>{a.emoji}</span>
              <span style={{ color: '#FAD2E1', fontWeight: 800, fontSize: 12, whiteSpace: 'nowrap' }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
          {[
            { emoji: '🧸', val: statsGlobal.totalProductos, label: 'Productos'  },
            { emoji: '📦', val: statsGlobal.totalPiezas,    label: 'En stock'   },
            { emoji: '💸', val: statsGlobal.totalVendidas,  label: 'Vendidas'   },
            { emoji: '💰', val: `$${statsGlobal.totalIngresos.toFixed(0)}`, label: 'Ingresos', green: true },
          ].map(s => (
            <div key={s.label} style={{ flex: '0 0 auto', minWidth: 72, backgroundColor: '#fff', borderRadius: 14, padding: '10px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 18 }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: s.green ? '#059669' : COLORS.textPrimary, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
          <div onClick={() => setEventsPanel(true)} style={{ flex: '0 0 auto', minWidth: 72, backgroundColor: '#1A1A2E', borderRadius: 14, padding: '10px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
            <div style={{ fontSize: 18 }}>🏪</div>
            <div style={{ fontWeight: 900, fontSize: 12, color: '#FAD2E1', marginTop: 2 }}>{events.length}</div>
            <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase' }}>Eventos</div>
          </div>
        </div>

        {/* Buscador */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar producto…"
          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB', padding: '10px 14px', fontSize: 14, color: COLORS.textPrimary, marginBottom: 10, outline: 'none', fontFamily: 'inherit' }}
        />

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)} style={{
              padding: '7px 14px', borderRadius: 99, whiteSpace: 'nowrap',
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              backgroundColor: filtro === f.id ? COLORS.header : '#fff',
              borderColor:     filtro === f.id ? COLORS.header : '#E5E7EB',
              color:           filtro === f.id ? '#fff' : COLORS.textSecondary,
            }}>{f.label}</button>
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: 14, marginBottom: 14, color: '#991B1B', fontSize: 14 }}>⚠️ {error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textMuted }}>
            <div style={{ fontSize: 48 }}>🧸</div>
            <div style={{ fontWeight: 700, marginTop: 10 }}>Cargando productos…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48 }}>🧸</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.textMuted, marginTop: 10 }}>
              {products.length === 0 ? '¡Agrega tu primer producto!' : 'Sin resultados'}
            </div>
            {products.length === 0 && (
              <button onClick={() => { setEditingProd(null); setStoreProductModal(true); }} style={{ marginTop: 16, backgroundColor: '#1A1A2E', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>+ Agregar producto</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p}
                onSell={prod => { setSellingProd(prod); setSaleModal(true); }}
                onEdit={prod => {
                  const linked = costings.find(co => co.product_id === prod.id);
                  if (linked) { setEditingProduct({ ...linked, emoji: prod.emoji, color_hex: prod.color_hex, stock_inicial: prod.stock_inicial }); setProductModalState(true); }
                  else { setEditingProd(prod); setStoreProductModal(true); }
                }}
                onAddStock={prod => { setAddStockProd(prod); setAddStockModal(true); }}
                onAddToPriceList={prod => { setPriceListProd({ nombre: prod.nombre, emoji: prod.emoji, patron_id: prod.patron_id, patron_nombre: prod.patron_nombre }); setPriceListModal(true); }}
                hasPriceListEntry={priceListItems.some(pl => pl.nombre === p.nombre)}
              />
            ))}
          </div>
        )}
      </div>

      {/* (FABs flotantes removidos — ver fila de acciones rápidas arriba) */}

      {/* Modals */}
      <StoreProductModal visible={storeProductModal} initial={editingProd} patterns={patterns}
        onClose={() => { setStoreProductModal(false); setEditingProd(null); }}
        onSave={handleSaveProduct}
      />
      <SaleModal visible={saleModal} product={sellingProd} events={events}
        onClose={() => { setSaleModal(false); setSellingProd(null); }}
        onSave={handleSale}
      />
      <AddStockModal visible={addStockModal} product={addStockProd}
        onClose={() => { setAddStockModal(false); setAddStockProd(null); }}
        onSave={handleAddStock}
      />
      <EventsPanel visible={eventsPanel} events={events} eventStats={eventStats}
        onClose={() => setEventsPanel(false)}
        onNew={() => { setEditingEvt(null); setEventModal(true); }}
        onEdit={ev => { setEditingEvt(ev); setEventModal(true); }}
        onDelete={handleDeleteEvent}
      />
      <StoreEventModal visible={eventModal} initial={editingEvt}
        onClose={() => { setEventModal(false); setEditingEvt(null); }}
        onSave={handleSaveEvent}
      />
      <ProductModal visible={productModal} initial={editingProduct} patterns={patterns} priceConfig={null}
        onClose={() => { setProductModalState(false); setEditingProduct(null); }}
        onSave={handleSaveProductModal}
      />
      <ProductModal visible={priceListModal} initial={priceListProd} patterns={patterns} priceConfig={{}}
        onClose={() => { setPriceListModal(false); setPriceListProd(null); }}
        onSave={handleSavePriceListProduct}
      />
    </div>
  );
}
