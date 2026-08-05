import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import PatternsScreen from './pages/PatternsScreen';
import DetailScreen from './pages/DetailScreen';
import InventarioPedidosScreen from './pages/InventarioPedidosScreen';
import ComercialScreen from './pages/ComercialScreen';
import PatternModal from './components/PatternModal';
import { ToastProvider, useToast } from './components/Toast';
import { usePatterns } from './hooks/usePatterns';
import { useInventory } from './hooks/useInventory';
import { useOrders } from './hooks/useOrders';
import { useCommerce } from './hooks/useCommerce';
import { COLORS } from './lib/constants';

function AppInner() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { patterns, loading, error, savePattern, deletePattern, toggleStep, resetPattern, uploadImage } =
    usePatterns(user?.id);

  const inventory = useInventory(user?.id);
  const ordersHook = useOrders(user?.id);
  const { products } = useCommerce(user?.id);

  const { items: inventoryItems } = inventory;
  const { orders } = ordersHook;

  const { showToast } = useToast();

  const [view, setView]       = useState('dashboard');
  const [detail, setDetail]   = useState(null);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: COLORS.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Nunito', sans-serif",
      }}>
        <div style={{ fontSize: 52 }}>🧶</div>
        <div style={{ fontWeight: 700, color: COLORS.textMuted, marginTop: 12 }}>Cargando…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  const handleSavePattern = async (form) => {
    try {
      const saved = await savePattern(form);
      if (detail?.id === saved.id) setDetail(saved);
      showToast(form.id ? '✅ Patrón actualizado' : '🧶 ¡Patrón guardado!');
      setModal(false);
      setEditing(null);
    } catch (err) {
      showToast('Error guardando: ' + err.message);
    }
  };

  const handleDeletePattern = async () => {
    try {
      await deletePattern(detail.id);
      setDetail(null);
      setView('dashboard');
      showToast('🗑 Patrón eliminado');
    } catch (err) {
      showToast('Error eliminando: ' + err.message);
    }
  };

  const handleToggleStep = async (stepId) => {
    try {
      const updated = await toggleStep(detail.id, stepId);
      if (updated) setDetail(updated);
    } catch (err) {
      showToast('Error actualizando paso: ' + err.message);
    }
  };

  const handleResetPattern = async (patternId) => {
    try {
      const updated = await resetPattern(patternId);
      if (updated) setDetail(updated);
      showToast('🔄 Patrón reiniciado');
    } catch (err) {
      showToast('Error reiniciando patrón: ' + err.message);
    }
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      {view === 'dashboard' && (
        <DashboardScreen user={user} onSignOut={signOut} onSelect={setView}
          patterns={patterns} items={inventoryItems} orders={orders} products={products}
        />
      )}

      {view === 'patterns' && (
        <PatternsScreen
          patterns={patterns}
          loading={loading}
          error={error}
          user={user}
          onSignOut={signOut}
          onBack={() => setView('dashboard')}
          onSelect={p => { setDetail(p); setView('detail'); }}
          onNew={() => { setEditing(null); setModal(true); }}
        />
      )}

      {view === 'detail' && detail && (
        <DetailScreen
          user={user}
          pattern={detail}
          onBack={() => { setDetail(null); setView('dashboard'); }}
          onEdit={() => { setEditing(detail); setModal(true); }}
          onDelete={handleDeletePattern}
          onToggleStep={handleToggleStep}
          onResetPattern={handleResetPattern}
          onGoToInventory={() => { setDetail(null); setView('inventario_pedidos'); }}
        />
      )}

      {view === 'inventario_pedidos' && (
        <InventarioPedidosScreen
          user={user}
          inventory={inventory}
          orders={ordersHook}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'comercial' && (
        <ComercialScreen user={user} patterns={patterns} onBack={() => setView('dashboard')} />
      )}

      <PatternModal
        visible={modal}
        initial={editing}
        onClose={() => { setModal(false); setEditing(null); }}
        onSave={handleSavePattern}
        onUploadImage={uploadImage}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background-color: ${COLORS.bg}; }
        input:focus, textarea:focus { border-color: #1A1A2E !important; }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @supports (padding: env(safe-area-inset-bottom)) {
          body { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  );
}
