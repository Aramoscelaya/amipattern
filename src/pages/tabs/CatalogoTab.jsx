import React, { useState } from 'react';
import CatalogoProductCard from '../../components/CatalogoProductCard';
import PriceConfigModal from '../../components/PriceConfigModal';
import StoreProductModal from '../../components/StoreProductModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { CATEGORIAS } from '../../lib/constants';
import { useToast } from '../../components/Toast';
import { COLORS, Z_INDEX } from '../../lib/constants';

const ESTADO_FILTROS = [
  { id: 'todos',        label: 'Todos' },
  { id: 'activo',       label: '🟢 Activos' },
  { id: 'bajo_pedido',  label: '🟡 Bajo pedido' },
  { id: 'descontinuado', label: '🔴 Descontinuados' },
];

export default function CatalogoTab({ products, config, onSaveProduct, onDeleteProduct, onSaveConfig, onClose, onAddStock, isOnline = true, pendingCount = 0 }) {
  const { showToast } = useToast();

  const [search,       setSearch]       = useState('');
  const [filtroCat,    setFiltroCat]    = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showConfig,   setShowConfig]   = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [confirmDel,   setConfirmDel]   = useState(null);

  const tarifa    = config?.tarifa_hora     || config?.pago_por_hora || 60;
  const margenPub = (config?.margen_propio   ?? 0.20) * 100;
  const margenBou = (config?.margen_boutique ?? 0.35) * 100;

  const activos = products.filter(p => p.estado_catalogo !== 'descontinuado');
  const valorCatalogo = products.reduce((s, p) => {
    const precio = Number(p.precio_venta) || 0;
    const disp   = Math.max(0, (p.stock_inicial || 0) - (p.stock_vendido || 0));
    return s + precio * disp;
  }, 0);

  const filtered = products.filter(p => {
    if (filtroCat !== 'todos' && p.categoria !== filtroCat) return false;
    if (filtroEstado !== 'todos' && p.estado_catalogo !== filtroEstado) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSaveProduct = async (form) => {
    try {
      await onSaveProduct(form);
      showToast(form.id ? '✅ Producto actualizado' : '🧸 Producto agregado');
      setShowModal(false); setEditing(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleDeleteProduct = async () => {
    try {
      await onDeleteProduct(confirmDel);
      showToast('🗑 Producto eliminado');
      setConfirmDel(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleSaveConfig = async (form) => {
    try {
      await onSaveConfig(form);
      showToast('⚙️ Configuración guardada');
      setShowConfig(false);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'inherit', paddingBottom: 120 }}>

      <ConfirmDialog
        visible={confirmDel !== null}
        title="¿Eliminar producto?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDeleteProduct}
        onCancel={() => setConfirmDel(null)}
      />

      {/* Header */}
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
        <div style={{ color: '#FAD2E1', fontSize: 18, fontWeight: 900, flex: 1 }}>📚 Catálogo</div>
        <button onClick={() => setShowConfig(true)} style={{
          backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
          padding: '8px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          color: '#fff', fontFamily: 'inherit', minHeight: 40,
        }}>⚙️ Precios</button>
      </div>

      <div style={{ padding: '16px', maxWidth: 960, margin: '0 auto' }}>

        {!isOnline && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: 12,
            padding: '10px 16px',
            marginBottom: 12,
            fontSize: 13,
            color: '#991B1B',
            fontWeight: 700,
          }}>
            Sin conexion — solo puedes agregar stock a productos existentes
          </div>
        )}

        {/* Barra de config */}
        <div style={{
          backgroundColor: '#fff', borderRadius: 16, padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 14,
          display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {[
            { label: 'Tarifa/hora', val: `$${tarifa}` },
            { label: 'Margen propio', val: `${margenPub.toFixed(0)}%` },
            { label: 'Margen boutique', val: `${margenBou.toFixed(0)}%` },
            { label: 'Redondeo', val: config?.redondeo ? `$${config.redondeo}` : '—' },
          ].map(c => (
            <div key={c.label} style={{ flex: '1 1 100px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>{c.label}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: COLORS.textPrimary, marginTop: 2 }}>{c.val}</div>
            </div>
          ))}
        </div>

        {/* Stats rápidas */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { emoji: '🟢', val: activos.length, label: 'Activos' },
            { emoji: '📦', val: products.length, label: 'Total productos' },
            { emoji: '💰', val: `$${valorCatalogo.toFixed(0)}`, label: 'Valor catálogo', green: true },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: '10px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 16 }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 14, color: s.green ? '#059669' : COLORS.textPrimary, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Buscador */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar producto…"
          style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#fff', borderRadius: 12, border: '1.5px solid #E5E7EB', padding: '10px 14px', fontSize: 14, color: COLORS.textPrimary, marginBottom: 10, outline: 'none', fontFamily: 'inherit' }}
        />

        {/* Filtros categoría */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[{ id: 'todos', label: 'Todos' }, ...CATEGORIAS.map(c => ({ id: c.id, label: `${c.emoji} ${c.label}` }))].map(f => (
            <button key={f.id} onClick={() => setFiltroCat(f.id)} style={{
              padding: '7px 14px', borderRadius: 99, whiteSpace: 'nowrap',
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              backgroundColor: filtroCat === f.id ? COLORS.header : '#fff',
              borderColor:     filtroCat === f.id ? COLORS.header : '#E5E7EB',
              color:           filtroCat === f.id ? '#fff' : COLORS.textSecondary,
            }}>{f.label}</button>
          ))}
        </div>

        {/* Filtros estado */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {ESTADO_FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltroEstado(f.id)} style={{
              padding: '7px 14px', borderRadius: 99, whiteSpace: 'nowrap',
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
              backgroundColor: filtroEstado === f.id ? '#1A1A2E' : '#fff',
              borderColor:     filtroEstado === f.id ? '#1A1A2E' : '#E5E7EB',
              color:           filtroEstado === f.id ? '#FAD2E1' : COLORS.textSecondary,
            }}>{f.label}</button>
          ))}
        </div>

        {/* Grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48 }}>📚</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.textMuted, marginTop: 10 }}>
              {isOnline ? '¡Agrega tu primer producto al catálogo!' : 'Conectate para agregar tu primer producto'}
            </div>
            {isOnline && (
              <button onClick={() => { setEditing(null); setShowModal(true); }} style={{
                marginTop: 16, backgroundColor: '#1A1A2E', color: '#fff',
                border: 'none', borderRadius: 12, padding: '12px 24px',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Agregar producto</button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.textMuted, marginTop: 10 }}>Sin resultados</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {filtered.map(p => (
              <CatalogoProductCard key={p.id} product={p} config={config}
                onEdit={prod => { setEditing(prod); setShowModal(true); }}
                onDelete={id => setConfirmDel(id)}
                onAddStock={onAddStock}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {isOnline && (
        <button onClick={() => { setEditing(null); setShowModal(true); }} style={{
          position: 'fixed', bottom: 'max(48px, env(safe-area-inset-bottom, 24px))', right: 24,
          zIndex: Z_INDEX.fab,
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: '#1A1A2E', border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          cursor: 'pointer', fontSize: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>+</button>
      )}

      {/* Modals */}
      <PriceConfigModal visible={showConfig} config={config}
        onClose={() => setShowConfig(false)}
        onSave={handleSaveConfig}
      />
      <StoreProductModal visible={showModal} initial={editing} config={config}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={handleSaveProduct}
      />
    </div>
  );
}