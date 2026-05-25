import React, { useState, useEffect, useRef } from 'react';
import { YARN_COLORS, DIFICULTADES, ESTADOS } from '../lib/constants';

const BLANK = {
  nombre: '', emoji: '🧶', dificultad: 'Principiante', estado: 'En progreso',
  talla: '', aguja: '', hilos: [], materiales: '', notas: '',
  pasos: [], imagen_url: null,
  fecha: new Date().toISOString().slice(0, 10),
  color: YARN_COLORS[0],
};

const Label = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 800, color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 14, marginBottom: 5,
  }}>
    {children}
  </div>
);

const Input = ({ style = {}, ...props }) => (
  <input
    style={{
      border: '1.5px solid #E5E7EB', borderRadius: 10,
      padding: '9px 12px', fontSize: 14, color: '#1A1A2E',
      backgroundColor: '#FAFAFA', width: '100%',
      boxSizing: 'border-box', outline: 'none',
      fontFamily: 'inherit',
      ...style,
    }}
    {...props}
  />
);

const Textarea = ({ style = {}, ...props }) => (
  <textarea
    style={{
      border: '1.5px solid #E5E7EB', borderRadius: 10,
      padding: '9px 12px', fontSize: 14, color: '#1A1A2E',
      backgroundColor: '#FAFAFA', width: '100%',
      boxSizing: 'border-box', outline: 'none',
      fontFamily: 'inherit', resize: 'vertical', minHeight: 72,
      ...style,
    }}
    {...props}
  />
);

export default function PatternModal({ visible, initial, onClose, onSave, onUploadImage }) {
  const [f, setF]         = useState(initial || BLANK);
  const [hilo, setHilo]   = useState('');
  const [paso, setPaso]   = useState('');
  const [saving, setSaving] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    setF(initial || {
      ...BLANK,
      color: YARN_COLORS[Math.floor(Math.random() * YARN_COLORS.length)],
    });
  }, [initial, visible]);

  const upd = (k, v) => setF(x => ({ ...x, [k]: v }));

  const addHilo = () => {
    if (hilo.trim()) { upd('hilos', [...f.hilos, hilo.trim()]); setHilo(''); }
  };

  const addPaso = () => {
    if (paso.trim()) {
      upd('pasos', [...f.pasos, { id: Date.now(), texto: paso.trim(), hecho: false }]);
      setPaso('');
    }
  };

  const movePaso = (id, dir) => {
    const arr = [...f.pasos];
    const i = arr.findIndex(p => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    upd('pasos', arr);
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const url = await onUploadImage(file);
      upd('imagen_url', url);
    } catch (err) {
      alert('Error subiendo imagen: ' + err.message);
    } finally {
      setImgLoading(false);
    }
  };

  const handleSave = async () => {
    if (!f.nombre.trim()) {
      alert('Dale un nombre a tu amigurumi antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      await onSave(f);
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '24px 24px 0 0',
        width: '100%', maxWidth: 640,
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Hero */}
        <div style={{
          backgroundColor: f.color, padding: '20px 20px 16px',
          borderRadius: '24px 24px 0 0',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <input
            value={f.emoji}
            onChange={e => upd('emoji', e.target.value)}
            maxLength={2}
            style={{
              fontSize: 32, backgroundColor: 'rgba(255,255,255,0.35)',
              border: 'none', borderRadius: 10, width: 54,
              textAlign: 'center', padding: 4, cursor: 'text',
              fontFamily: 'inherit',
            }}
          />
          <input
            value={f.nombre}
            onChange={e => upd('nombre', e.target.value)}
            placeholder="Nombre del amigurumi"
            style={{
              flex: 1, fontSize: 20, fontWeight: 900, color: '#1A1A2E',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.35)', border: 'none',
            borderRadius: 10, width: 36, height: 36,
            cursor: 'pointer', fontSize: 18, color: '#1A1A2E',
          }}>×</button>
        </div>

        {/* Scroll body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 20px 20px' }}>

          {/* Color picker */}
          <Label>Color de tarjeta</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {YARN_COLORS.map(c => (
              <button
                key={c}
                onClick={() => upd('color', c)}
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: c, border: `2.5px solid ${f.color === c ? '#1A1A2E' : 'transparent'}`,
                  cursor: 'pointer', padding: 0,
                }}
              />
            ))}
          </div>

          {/* Dificultad + Estado */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Label>Dificultad</Label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DIFICULTADES.map(d => (
                  <button key={d} onClick={() => upd('dificultad', d)} style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: '1.5px solid', fontFamily: 'inherit',
                    backgroundColor: f.dificultad === d ? '#1A1A2E' : '#FAFAFA',
                    borderColor: f.dificultad === d ? '#1A1A2E' : '#E5E7EB',
                    color: f.dificultad === d ? '#fff' : '#6B7280',
                  }}>{d}</button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Label>Estado</Label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ESTADOS.map(s => (
                  <button key={s} onClick={() => upd('estado', s)} style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: '1.5px solid', fontFamily: 'inherit',
                    backgroundColor: f.estado === s ? '#1A1A2E' : '#FAFAFA',
                    borderColor: f.estado === s ? '#1A1A2E' : '#E5E7EB',
                    color: f.estado === s ? '#fff' : '#6B7280',
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Talla + Aguja */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <Label>📏 Talla</Label>
              <Input value={f.talla} onChange={e => upd('talla', e.target.value)} placeholder="ej: 15 cm" />
            </div>
            <div style={{ flex: 1 }}>
              <Label>🪝 Aguja</Label>
              <Input value={f.aguja} onChange={e => upd('aguja', e.target.value)} placeholder="ej: 3.5 mm" />
            </div>
          </div>

          {/* Fecha */}
          <Label>📅 Fecha de inicio</Label>
          <Input type="date" value={f.fecha} onChange={e => upd('fecha', e.target.value)} style={{ maxWidth: 200 }} />

          {/* Hilos */}
          <Label>🧵 Colores de hilo</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={hilo} onChange={e => setHilo(e.target.value)}
              placeholder="ej: Blanco crudo"
              onKeyDown={e => e.key === 'Enter' && addHilo()}
              style={{ flex: 1 }}
            />
            <button onClick={addHilo} style={{
              backgroundColor: '#1A1A2E', color: '#fff', border: 'none',
              borderRadius: 10, width: 44, fontSize: 22, fontWeight: 900,
              cursor: 'pointer',
            }}>+</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {f.hilos.map((h, i) => (
              <span key={i} style={{
                backgroundColor: '#F3F4F6', borderRadius: 99,
                padding: '4px 10px', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                🧵 {h}
                <button onClick={() => upd('hilos', f.hilos.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 16, padding: 0, fontWeight: 900 }}>
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Materiales */}
          <Label>🧰 Materiales adicionales</Label>
          <Textarea
            value={f.materiales} onChange={e => upd('materiales', e.target.value)}
            placeholder="Ojos de seguridad, relleno, alambre..."
          />

          {/* Pasos */}
          <Label>📋 Pasos del patrón</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={paso} onChange={e => setPaso(e.target.value)}
              placeholder="ej: Vuelta 1: 6pb en anillo mágico"
              onKeyDown={e => e.key === 'Enter' && addPaso()}
              style={{ flex: 1 }}
            />
            <button onClick={addPaso} style={{
              backgroundColor: '#1A1A2E', color: '#fff', border: 'none',
              borderRadius: 10, width: 44, fontSize: 22, fontWeight: 900, cursor: 'pointer',
            }}>+</button>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {f.pasos.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: 10, backgroundColor: '#FAFAFA',
                borderRadius: 10, border: '1px solid #E5E7EB',
              }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#D1D5DB', minWidth: 20 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: 13, color: '#374151' }}>{p.texto}</span>
                <button onClick={() => movePaso(p.id, -1)} disabled={i === 0}
                  style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', fontSize: 16, opacity: i === 0 ? 0.2 : 1 }}>↑</button>
                <button onClick={() => movePaso(p.id, 1)} disabled={i === f.pasos.length - 1}
                  style={{ background: 'none', border: 'none', cursor: i === f.pasos.length - 1 ? 'default' : 'pointer', fontSize: 16, opacity: i === f.pasos.length - 1 ? 0.2 : 1 }}>↓</button>
                <button onClick={() => upd('pasos', f.pasos.filter(x => x.id !== p.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}>🗑</button>
              </div>
            ))}
          </div>

          {/* Notas */}
          <Label>💡 Notas y tips</Label>
          <Textarea
            value={f.notas} onChange={e => upd('notas', e.target.value)}
            placeholder="Trucos, errores comunes, mejoras..."
          />

          {/* Imagen */}
          <Label>📷 Imagen de referencia</Label>
          <input
            ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }} onChange={handleImageFile}
          />
          <button onClick={() => fileRef.current?.click()} disabled={imgLoading} style={{
            border: '1.5px dashed #E5E7EB', borderRadius: 10,
            padding: 12, width: '100%', backgroundColor: 'transparent',
            color: '#6B7280', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            {imgLoading ? '⏳ Subiendo...' : f.imagen_url ? '🔄 Cambiar imagen' : '+ Agregar imagen'}
          </button>
          {f.imagen_url && (
            <div style={{ marginTop: 8 }}>
              <img src={f.imagen_url} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
              <button onClick={() => upd('imagen_url', null)} style={{
                background: 'none', border: 'none', color: '#EF4444',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4,
              }}>× Quitar imagen</button>
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: 14, borderRadius: 12,
              border: '2px solid #E5E7EB', backgroundColor: 'transparent',
              fontWeight: 800, fontSize: 14, color: '#6B7280',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: 14, borderRadius: 12,
              backgroundColor: '#1A1A2E', border: 'none',
              color: '#fff', fontWeight: 900, fontSize: 14,
              cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}>
              {saving ? '⏳ Guardando...' : '💾 Guardar'}
            </button>
          </div>
          <div style={{ height: 20 }} />
        </div>
      </div>
    </div>
  );
}
