import React, { useState, useEffect, useRef } from 'react';
import { useCommerce } from '../hooks/useCommerce';
import VenderTab from './tabs/VenderTab';
import CatalogoTab from './tabs/CatalogoTab';
import CostearTab from './tabs/CostearTab';
import { useToast } from '../components/Toast';
import { COLORS, Z_INDEX } from '../lib/constants';

const TABS = [
  { id: 'vender',   label: 'Vender',    emoji: '🛍️' },
  { id: 'catalogo', label: 'Catálogo',  emoji: '📚' },
  { id: 'costear',  label: 'Costear',   emoji: '🧮' },
];

export default function ComercialScreen({ user, patterns = [], onBack }) {
  const {
    products, channels, config,
    loading, error,
    saveConfig,
    saveProduct, deleteProduct, addStock,
    saveChannel, setActiveChannel, activeChannel,
    registerSale, channelStats,
    saveCosting,
    isOnline, pendingCount,
  } = useCommerce(user?.id);

  const [tab, setTab] = useState('vender');

  const { showToast } = useToast();
  const prevPendingRef = useRef(0);

  useEffect(() => {
    if (isOnline && pendingCount === 0 && prevPendingRef.current > 0) {
      showToast('Todo sincronizado');
    }
    prevPendingRef.current = pendingCount;
  }, [isOnline, pendingCount, showToast]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, fontFamily: 'inherit' }}>

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
          color: COLORS.headerAccent, padding: '4px 4px 4px 0', fontFamily: 'inherit',
        }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: COLORS.accent, fontSize: 18, fontWeight: 900 }}>💼 Comercial</div>
          <div style={{ color: COLORS.headerAccent, fontSize: 11, marginTop: 1 }}>Ventas, catálogo y costos</div>
        </div>
        {!isOnline && (
          <div style={{
            backgroundColor: COLORS.danger.bg, border: `1.5px solid ${COLORS.danger.border}`,
            borderRadius: 10, padding: '6px 10px', fontSize: 11,
            color: COLORS.danger.fg, fontWeight: 800, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>🔴</span> Offline
            {pendingCount > 0 && (
              <span style={{ backgroundColor: COLORS.dangerSolid, color: '#fff', borderRadius: 99, padding: '1px 6px', fontSize: 10 }}>
                {pendingCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tab bar interna */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 16px',
        backgroundColor: COLORS.header,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 'max(60px, calc(env(safe-area-inset-top) + 60px))',
        zIndex: Z_INDEX.header,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 4px', borderRadius: 10,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 800, fontSize: 13, textAlign: 'center',
            backgroundColor: tab === t.id ? COLORS.accent : 'rgba(255,255,255,0.12)',
            color: tab === t.id ? COLORS.onAccent : COLORS.textPrimary,
            transition: 'background 0.2s',
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {isOnline && pendingCount > 0 && (
        <div style={{
          backgroundColor: COLORS.warning.bg,
          border: `1.5px solid ${COLORS.warning.border}`,
          padding: '8px 16px',
          fontSize: 12,
          color: COLORS.warning.fg,
          fontWeight: 700,
          textAlign: 'center',
        }}>
          Sincronizando {pendingCount} operacion{pendingCount !== 1 ? 'es' : ''}...
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: COLORS.danger.bg, borderBottom: `1.5px solid ${COLORS.danger.border}`,
          padding: '10px 16px', fontSize: 13, color: COLORS.danger.fg, fontWeight: 700,
        }}>⚠️ {error}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textMuted, fontFamily: 'inherit' }}>
          <div style={{ fontSize: 48 }}>💼</div>
          <div style={{ fontWeight: 700, marginTop: 10 }}>Cargando módulo comercial…</div>
        </div>
      ) : tab === 'vender' ? (
        <VenderTab
          products={products}
          channels={channels}
          activeChannel={activeChannel}
          onSetChannel={setActiveChannel}
          onRegisterSale={registerSale}
          channelStats={channelStats}
          isOnline={isOnline}
          pendingCount={pendingCount}
          onSaveChannel={saveChannel}
        />
      ) : tab === 'catalogo' ? (
        <CatalogoTab
          products={products}
          config={config}
          onSaveProduct={saveProduct}
          onDeleteProduct={deleteProduct}
          onSaveConfig={saveConfig}
          onAddStock={addStock}
          isOnline={isOnline}
          pendingCount={pendingCount}
        />
      ) : (
        <CostearTab
          products={products}
          config={config}
          patterns={patterns}
          saveCosting={saveCosting}
          isOnline={isOnline}
          pendingCount={pendingCount}
        />
      )}
    </div>
  );
}