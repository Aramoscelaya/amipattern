import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './pages/LoginScreen';
import GridScreen from './pages/GridScreen';
import DetailScreen from './pages/DetailScreen';
import PatternModal from './components/PatternModal';
import { usePatterns } from './hooks/usePatterns';
import { COLORS } from './lib/constants';

function AppInner() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { patterns, loading, error, savePattern, deletePattern, toggleStep, uploadImage } =
    usePatterns(user?.id);

  const [view, setView]       = useState('grid');
  const [detail, setDetail]   = useState(null);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // Cargando sesión
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

  // No autenticado → pantalla de login
  if (!user) return <LoginScreen />;

  const handleSavePattern = async (form) => {
    try {
      const saved = await savePattern(form);
      if (detail?.id === saved.id) setDetail(saved);
      showToast(form.id ? '✅ Patrón actualizado' : '🧶 ¡Patrón guardado!');
      setModal(false);
      setEditing(null);
    } catch (err) {
      alert('Error guardando: ' + err.message);
    }
  };

  const handleDeletePattern = async () => {
    try {
      await deletePattern(detail.id);
      setDetail(null);
      setView('grid');
      showToast('🗑 Patrón eliminado');
    } catch (err) {
      alert('Error eliminando: ' + err.message);
    }
  };

  const handleToggleStep = async (stepId) => {
    try {
      const updated = await toggleStep(detail.id, stepId);
      if (updated) setDetail(updated);
    } catch (err) {
      alert('Error actualizando paso: ' + err.message);
    }
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1A1A2E', color: '#fff',
          padding: '11px 20px', borderRadius: 99,
          fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: 9999, whiteSpace: 'nowrap',
          animation: 'fadeInDown 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      {view === 'grid' ? (
        <GridScreen
          patterns={patterns}
          loading={loading}
          error={error}
          user={user}
          onSignOut={signOut}
          onSelect={p => { setDetail(p); setView('detail'); }}
          onNew={() => { setEditing(null); setModal(true); }}
        />
      ) : (
        detail && (
          <DetailScreen
            pattern={detail}
            onBack={() => { setDetail(null); setView('grid'); }}
            onEdit={() => { setEditing(detail); setModal(true); }}
            onDelete={handleDeletePattern}
            onToggleStep={handleToggleStep}
          />
        )
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
        /* Móvil: safe area para notch/home bar */
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
      <AppInner />
    </AuthProvider>
  );
}
