import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Z_INDEX } from '../lib/constants';

const ToastContext = createContext(null);

const SHOW = 'SHOW';
const HIDE = 'HIDE';

function reducer(state, action) {
  switch (action.type) {
    case SHOW: return { message: action.message, visible: true };
    case HIDE: return { message: '', visible: false };
    default: return state;
  }
}

export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { message: '', visible: false });

  const showToast = useCallback((message, duration = 2200) => {
    dispatch({ type: SHOW, message });
    setTimeout(() => dispatch({ type: HIDE }), duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {state.visible && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1A1A2E', color: '#fff',
          padding: '10px 20px', borderRadius: 99,
          fontWeight: 700, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          zIndex: Z_INDEX.toast, whiteSpace: 'nowrap',
          animation: 'fadeInDown 0.2s ease',
        }}>
          {state.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
