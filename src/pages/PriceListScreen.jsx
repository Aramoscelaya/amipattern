import React, { useState, useMemo } from 'react';
import { usePriceList, usePriceConfig } from '../hooks/usePriceList';
import { useStore, useStoreCostings } from '../hooks/useStore';
import { calcPrecio } from '../lib/pricing';
import PriceConfigModal from '../components/PriceConfigModal';
import ProductModal from '../components/ProductModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { COLORS, Z_INDEX } from '../lib/constants';

function PriceCard({ item, config, onEdit, onDelete }) {
  const calc = calcPrecio({
    mode: 'boutique',
    costo_material: item.costo_material,
    horas: item.horas,
    costo_empaque: item.costo_empaque,
    pago_por_hora:  config?.pago_por_hora,
    margen_propio:  config?.margen_propio,
    margen_boutique: config?.margen_boutique,
  });

  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 16, padding: 14,
      border: '1.5px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: '#C7CEEA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>{item.emoji || '🧸'}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: COLORS.textPrimary, lineHeight: 1.2 }}>{item.nombre}</div>
            {item.size && <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 1 }}>{item.size}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(item)} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: COLORS.textMuted, padding: 2 }}>✏️</button>
          <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', fontSize: 14, cursor: 'pointer', color: '#EF4444', padding: 2 }}>🗑</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', marginTop: 6 }}>
        <PriceLabel label="Costo"   val={calc.costo_total}     color={COLORS.textSecondary} />
        <PriceLabel label="Utilidad" val={calc.utilidad_tuya}   color="#92400E" />
        <PriceLabel label="Boutique"  val={calc.precio_boutique} color="#059669" bold />
        <PriceLabel label="Público"   val={calc.precio_publico}  color="#1D4ED8" bold />
      </div>

      {item.nota && (
        <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontStyle: 'italic' }}>
          📝 {item.nota}
        </div>
      )}
    </div>
  );
}

function PriceLabel({ label, val, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 900 : 700, color }}>${val.toFixed(0)}</span>
    </div>
  );
}

export default function PriceListScreen({ user, patterns, onBack }) {
  const { config, saveConfig } = usePriceConfig(user?.id);
  const { items, loading, error, saveItem, deleteItem } = usePriceList(user?.id);
  const { saveProduct } = useStore(user?.id);
  const { saveCosting } = useStoreCostings(user?.id);

  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const [showConfig, setShowConfig] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleSaveConfig = async (form) => {
    try {
      await saveConfig(form);
      showToast('⚙️ Configuración guardada');
      setShowConfig(false);
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
        await saveItem(priceListItem);
      }
      showToast('✅ Guardado');
      setItemModal(false);
      setEditingItem(null);
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      setConfirmId(null);
      showToast('🗑 Eliminado');
    } catch (e) { showToast('Error: ' + e.message); }
  };

  const filtered = items.filter(i => {
    if (search && !i.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: items.length,
    utilidadTotal: items.reduce((s, i) => {
      const c = calcPrecio({ mode: 'boutique', costo_material: i.costo_material, horas: i.horas, costo_empaque: i.costo_empaque, pago_por_hora: config?.pago_por_hora, margen_propio: config?.margen_propio, margen_boutique: config?.margen_boutique });
      return s + c.utilidad_tuya;
    }, 0),
    precioPromedio: items.length > 0
      ? items.reduce((s, i) => {
          const c = calcPrecio({ mode: 'boutique', costo_material: i.costo_material, horas: i.horas, costo_empaque: i.costo_empaque, pago_por_hora: config?.pago_por_hora, margen_propio: config?.margen_propio, margen_boutique: config?.margen_boutique });
          return s + c.precio_boutique;
        }, 0) / items.length
      : 0,
  }), [items, config]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{
        backgroundColor: COLORS.header,
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: Z_INDEX.header,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
            color: '#4B5563', padding: '4px 4px 4px 0', fontFamily: 'inherit',
          }}>←</button>
          <div>
            <div style={{ color: '#FAD2E1', fontSize: 18, fontWeight: 900 }}>💰 Precios</div>
            <div style={{ color: '#4B5563', fontSize: 11, marginTop: 1 }}>Lista para boutique</div>
          </div>
        </div>
        <button onClick={() => setShowConfig(true)} style={{
          background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',
          color: '#4B5563', padding: 4, fontFamily: 'inherit',
        }}>⚙️</button>
      </div>

      <ConfirmDialog
        visible={confirmId !== null}
        title="¿Eliminar producto?"
        message="Esta acción no se puede deshacer."
        onConfirm={() => handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      <div style={{ padding: '16px 16px', maxWidth: 960, margin: '0 auto' }}>

        {/* Config summary */}
        {config && (
          <div style={{
            backgroundColor: '#fff', borderRadius: 14, padding: '10px 14px', marginBottom: 14,
            display: 'flex', gap: 16, flexWrap: 'wrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <ConfigChip label="Pago/hora" value={`$${config.pago_por_hora}`} />
            <ConfigChip label="Margen boutique" value={`${(config.margen_boutique * 100).toFixed(0)}%`} />
            <ConfigChip label="Margen propio" value={`${(config.margen_propio * 100).toFixed(0)}%`} />
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
          {[
            { emoji: '🧸', val: stats.total,         label: 'Productos' },
            { emoji: '💰', val: `$${stats.utilidadTotal.toFixed(0)}`,   label: 'Utilidad total', green: true },
            { emoji: '🏷️', val: `$${stats.precioPromedio.toFixed(0)}`, label: 'Precio prom.', blue: true },
          ].map(s => (
            <div key={s.label} style={{
              flex: '0 0 auto', minWidth: 80,
              backgroundColor: '#fff', borderRadius: 14, padding: '10px 8px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 18 }}>{s.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: s.green ? '#059669' : s.blue ? '#1D4ED8' : COLORS.textPrimary, marginTop: 2 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 800, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar producto…"
          style={{
            width: '100%', boxSizing: 'border-box',
            backgroundColor: '#fff', borderRadius: 12,
            border: '1.5px solid #E5E7EB',
            padding: '10px 14px', fontSize: 14, color: COLORS.textPrimary,
            marginBottom: 10, outline: 'none', fontFamily: 'inherit',
          }}
        />

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 12, padding: 14, marginBottom: 14, color: '#991B1B', fontSize: 14 }}>⚠️ {error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textMuted }}>
            <div style={{ fontSize: 48 }}>💰</div>
            <div style={{ fontWeight: 700, marginTop: 10 }}>Cargando lista de precios…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48 }}>💰</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.textMuted, marginTop: 10 }}>
              {items.length === 0 ? '¡Agrega tu primer producto!' : 'Sin resultados'}
            </div>
            {items.length === 0 && (
              <button onClick={() => { setEditingItem(null); setItemModal(true); }} style={{
                marginTop: 16, backgroundColor: '#1A1A2E', color: '#fff',
                border: 'none', borderRadius: 12, padding: '12px 24px',
                fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Agregar producto</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 }}>
            {filtered.map(i => (
              <PriceCard key={i.id} item={i} config={config}
                onEdit={item => { setEditingItem(item); setItemModal(true); }}
                onDelete={id => setConfirmId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => { setEditingItem(null); setItemModal(true); }} style={{
        position: 'fixed',
        bottom: 'max(24px, calc(env(safe-area-inset-bottom) + 24px))',
        right: 24, zIndex: Z_INDEX.fab,
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: '#FAD2E1', border: 'none',
        boxShadow: '0 4px 20px #a8a8ca',
        cursor: 'pointer', fontSize: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>➕</button>

      {/* Modals */}
      <PriceConfigModal visible={showConfig} config={config}
        onClose={() => setShowConfig(false)}
        onSave={handleSaveConfig}
      />
      <ProductModal visible={itemModal} initial={editingItem} patterns={patterns} priceConfig={config}
        onClose={() => { setItemModal(false); setEditingItem(null); }}
        onSave={handleSaveProductModal}
      />
    </div>
  );
}

function ConfigChip({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted }}>{label}:</span>
      <span style={{ fontSize: 13, fontWeight: 900, color: COLORS.textPrimary }}>{value}</span>
    </div>
  );
}
