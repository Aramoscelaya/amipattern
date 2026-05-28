import React, { useState, useEffect } from 'react';

const COLORS_HEX = [
  '#2DD4BF','#FDA4AF','#F5F0DC','#A78BFA','#FCA5A5',
  '#6EE7B7','#FCD34D','#93C5FD','#F9A8D4','#D9F99D',
  '#C9A96E','#1A1A2E','#FFFFFF','#F97316','#84CC16',
];

const SUBTIPOS_HILO = ['Chenille','Acrílico','Algodón','Lana','Amigurumi','Fantasía','Otro'];
const SUBTIPOS_MAT  = [
  { id: 'relleno',       label: '🪶 Relleno',           unidad: 'g'      },
  { id: 'ojo_seguridad', label: '👁️ Ojos de seguridad', unidad: 'unidad' },
  { id: 'llavero',       label: '🔑 Llavero',           unidad: 'unidad' },
  { id: 'etiqueta',      label: '🏷️ Etiqueta',          unidad: 'unidad' },
  { id: 'tarjeta',       label: '🪧 Tarjeta',           unidad: 'unidad' },
  { id: 'caja',          label: '📦 Caja / empaque',    unidad: 'unidad' },
  { id: 'botones',       label: '🔘 Botones',           unidad: 'unidad' },
  { id: 'alambre',       label: '〰️ Alambre',           unidad: 'g'      },
  { id: 'otro',          label: '➕ Otro',              unidad: 'unidad' },
];
const GANCHOS = ['2.0mm','2.5mm','3.0mm','3.5mm','4.0mm','4.5mm','5.0mm','5.5mm','6.0mm'];

const BLANK_HILO = {
  tipo:'hilo', nombre:'', marca:'', color:'', color_hex: COLORS_HEX[0],
  subtipo:'Chenille', grosor_mm:'', tipo_gancho:'',
  unidad:'g',
  stock_inicial:'', entradas:'0', stock_usado:'0',
  alerta_minimo:'30', costo_unitario:'', notas:'',
};
const BLANK_MAT = {
  tipo:'material', nombre:'', marca:'', color:'', color_hex:'#C9A96E',
  subtipo:'relleno', unidad:'g',
  stock_inicial:'', entradas:'0', stock_usado:'0',
  alerta_minimo:'5', costo_unitario:'', notas:'',
};

const Label = ({ t, hint }) => (
  <div style={{ fontSize:11, fontWeight:800, color:'#6B7280',
    textTransform:'uppercase', letterSpacing:0.5, marginTop:14, marginBottom:5,
    display:'flex', alignItems:'center', gap:6 }}>
    {t}
    {hint && <span style={{ fontSize:10, fontWeight:400, textTransform:'none',
      color:'#9CA3AF', letterSpacing:0 }}>— {hint}</span>}
  </div>
);
const Input = ({ style={}, ...p }) => (
  <input style={{
    border:'1.5px solid #E5E7EB', borderRadius:10,
    padding:'9px 12px', fontSize:14, color:'#1A1A2E',
    backgroundColor:'#FAFAFA', width:'100%',
    boxSizing:'border-box', outline:'none', fontFamily:'inherit',
    ...style,
  }} {...p}/>
);

export default function InventoryModal({ visible, initial, onClose, onSave }) {
  const [tab,    setTab]    = useState('hilo');
  const [f,      setF]      = useState(BLANK_HILO);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTab(initial.tipo || 'hilo');
      setF({ ...initial });
    } else {
      setTab('hilo');
      setF({ ...BLANK_HILO, color_hex: COLORS_HEX[Math.floor(Math.random()*COLORS_HEX.length)] });
    }
  }, [initial, visible]);

  const upd = (k, v) => setF(x => ({ ...x, [k]: v }));

  const setSubtipoMat = (s) => {
    const found = SUBTIPOS_MAT.find(m => m.id === s);
    upd('subtipo', s);
    if (found) upd('unidad', found.unidad);
  };

  const handleSave = async () => {
    if (!f.nombre.trim()) { alert('Ponle un nombre al item.'); return; }
    setSaving(true);
    try { await onSave({ ...f, tipo: tab }); }
    finally { setSaving(false); }
  };

  if (!visible) return null;

  const isHilo       = tab === 'hilo';
  const unidadLabel  = f.unidad === 'g' ? 'gramos' : 'unidades';
  const costoLabel   = f.unidad === 'g' ? '$ por gramo' : '$ por unidad';
  const disponible   = Number(f.stock_inicial||0) + Number(f.entradas||0) - Number(f.stock_usado||0);
  const isEditing    = !!initial;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      backgroundColor:'rgba(0,0,0,0.5)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        backgroundColor:'#fff', borderRadius:'24px 24px 0 0',
        width:'100%', maxWidth:640, maxHeight:'94vh',
        display:'flex', flexDirection:'column',
        animation:'slideUp 0.3s ease',
      }}>

        {/* Hero */}
        <div style={{
          backgroundColor: f.color_hex, padding:'18px 20px 14px',
          borderRadius:'24px 24px 0 0',
          display:'flex', alignItems:'center', gap:12,
        }}>
          <div style={{
            width:48, height:48, borderRadius:14,
            backgroundColor:'rgba(255,255,255,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
          }}>
            {isHilo ? '🧶' : (SUBTIPOS_MAT.find(m=>m.id===f.subtipo)?.label?.split(' ')[0] || '📦')}
          </div>
          <input
            value={f.nombre}
            onChange={e => upd('nombre', e.target.value)}
            placeholder={isHilo ? 'Nombre del hilo' : 'Nombre del material'}
            style={{
              flex:1, fontSize:18, fontWeight:900, color:'#1A1A2E',
              background:'transparent', border:'none', outline:'none', fontFamily:'inherit',
            }}
          />
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.35)', border:'none', borderRadius:10,
            width:34, height:34, cursor:'pointer', fontSize:18, color:'#1A1A2E',
          }}>×</button>
        </div>

        {/* Tabs Hilo / Material */}
        {!initial && (
          <div style={{ display:'flex', gap:0, borderBottom:'1px solid #F3F4F6' }}>
            {[['hilo','🧶 Hilo'],['material','📦 Material']].map(([id, label]) => (
              <button key={id} onClick={() => {
                setTab(id);
                setF(id === 'hilo'
                  ? { ...BLANK_HILO, color_hex: f.color_hex }
                  : { ...BLANK_MAT });
              }} style={{
                flex:1, padding:'12px 0', border:'none', cursor:'pointer',
                fontFamily:'inherit', fontWeight:700, fontSize:14,
                backgroundColor:'transparent',
                color: tab === id ? '#1A1A2E' : '#9CA3AF',
                borderBottom: tab === id ? '2.5px solid #1A1A2E' : '2.5px solid transparent',
              }}>{label}</button>
            ))}
          </div>
        )}

        {/* Scroll body */}
        <div style={{ overflowY:'auto', flex:1, padding:'4px 20px 20px' }}>

          {/* Color */}
          <Label t="Color" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:4 }}>
            {COLORS_HEX.map(c => (
              <button key={c} onClick={() => upd('color_hex', c)} style={{
                width:28, height:28, borderRadius:14,
                backgroundColor:c, padding:0, cursor:'pointer',
                border:`2.5px solid ${f.color_hex===c ? '#1A1A2E' : 'transparent'}`,
                boxShadow: c==='#FFFFFF' ? 'inset 0 0 0 1px #E5E7EB' : 'none',
              }}/>
            ))}
          </div>
          <Input
            value={f.color}
            onChange={e => upd('color', e.target.value)}
            placeholder="Nombre del color (ej: turquesa, blanco crudo)"
            style={{ marginTop:6 }}
          />

          {/* Hilo */}
          {isHilo && (<>
            <Label t="Tipo de hilo" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {SUBTIPOS_HILO.map(s => (
                <button key={s} onClick={() => upd('subtipo', s)} style={{
                  padding:'6px 12px', borderRadius:99, fontSize:12, fontWeight:700,
                  cursor:'pointer', border:'1.5px solid', fontFamily:'inherit',
                  backgroundColor: f.subtipo===s ? '#1A1A2E' : '#FAFAFA',
                  borderColor:     f.subtipo===s ? '#1A1A2E' : '#E5E7EB',
                  color:           f.subtipo===s ? '#fff' : '#6B7280',
                }}>{s}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <div style={{ flex:1 }}>
                <Label t="Grosor (mm)" />
                <Input type="number" value={f.grosor_mm} onChange={e=>upd('grosor_mm',e.target.value)} placeholder="ej: 3.5"/>
              </div>
              <div style={{ flex:1 }}>
                <Label t="Tipo de gancho" />
                <select value={f.tipo_gancho} onChange={e=>upd('tipo_gancho',e.target.value)}
                  style={{ border:'1.5px solid #E5E7EB', borderRadius:10, padding:'9px 12px',
                    fontSize:14, color:'#1A1A2E', backgroundColor:'#FAFAFA',
                    width:'100%', outline:'none', fontFamily:'inherit' }}>
                  <option value="">Seleccionar</option>
                  {GANCHOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </>)}

          {/* Material */}
          {!isHilo && (<>
            <Label t="Tipo de material" />
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {SUBTIPOS_MAT.map(s => (
                <button key={s.id} onClick={() => setSubtipoMat(s.id)} style={{
                  padding:'6px 10px', borderRadius:99, fontSize:12, fontWeight:700,
                  cursor:'pointer', border:'1.5px solid', fontFamily:'inherit',
                  backgroundColor: f.subtipo===s.id ? '#1A1A2E' : '#FAFAFA',
                  borderColor:     f.subtipo===s.id ? '#1A1A2E' : '#E5E7EB',
                  color:           f.subtipo===s.id ? '#fff' : '#6B7280',
                }}>{s.label}</button>
              ))}
            </div>
          </>)}

          {/* Marca */}
          <Label t="Marca / Proveedor" />
          <Input value={f.marca} onChange={e=>upd('marca',e.target.value)} placeholder="ej: Katia, Amazon, Mercado Libre"/>

          {/* ── Sección de stock ── */}
          <div style={{
            backgroundColor:'#F9FAFB', borderRadius:14,
            border:'1.5px solid #F3F4F6', padding:'12px 14px', marginTop:16,
          }}>
            <div style={{ fontSize:12, fontWeight:800, color:'#374151', marginBottom:12 }}>
              📊 Stock
            </div>

            {/* Stock inicial */}
            <div>
              <Label t={`Stock inicial (${unidadLabel})`} hint="cuánto tenías al dar de alta" />
              <Input
                type="number"
                value={f.stock_inicial}
                onChange={e => upd('stock_inicial', e.target.value)}
                placeholder={f.unidad==='g' ? 'ej: 200' : 'ej: 50'}
                style={{ backgroundColor:'#fff' }}
              />
            </div>

            {/* Entradas acumuladas — solo visible al editar */}
            {isEditing && (
              <div>
                <Label t={`Entradas acumuladas (${unidadLabel})`} hint="total de reposiciones registradas" />
                <Input
                  type="number"
                  value={f.entradas}
                  onChange={e => upd('entradas', e.target.value)}
                  placeholder="0"
                  style={{ backgroundColor:'#FFF7ED', borderColor:'#FDE68A' }}
                />
                <div style={{ fontSize:11, color:'#92400E', marginTop:4 }}>
                  ⚠️ Edita esto solo para corregir errores. Para reponer stock usa el botón 📥 en la tarjeta.
                </div>
              </div>
            )}

            {/* Salidas acumuladas — solo visible al editar */}
            {isEditing && (
              <div>
                <Label t={`Salidas acumuladas (${unidadLabel})`} hint="total de uso registrado" />
                <Input
                  type="number"
                  value={f.stock_usado}
                  onChange={e => upd('stock_usado', e.target.value)}
                  placeholder="0"
                  style={{ backgroundColor:'#FFF7ED', borderColor:'#FDE68A' }}
                />
                <div style={{ fontSize:11, color:'#92400E', marginTop:4 }}>
                  ⚠️ Edita esto solo para corregir errores. Para usar stock usa el botón 📤 en la tarjeta.
                </div>
              </div>
            )}

            {/* Alerta */}
            <div>
              <Label t={`Alerta si quedan menos de (${unidadLabel})`} />
              <Input
                type="number"
                value={f.alerta_minimo}
                onChange={e => upd('alerta_minimo', e.target.value)}
                placeholder={f.unidad==='g' ? 'ej: 30' : 'ej: 5'}
                style={{ backgroundColor:'#fff' }}
              />
            </div>

            {/* Resumen disponible (solo al editar) */}
            {isEditing && (
              <div style={{
                marginTop:12, padding:'10px 12px', borderRadius:10,
                backgroundColor: disponible <= 0 ? '#FEF2F2' : disponible <= Number(f.alerta_minimo) ? '#FFF7ED' : '#F0FDF4',
                border: `1px solid ${disponible <= 0 ? '#FECACA' : disponible <= Number(f.alerta_minimo) ? '#FDE68A' : '#BBF7D0'}`,
                fontSize:12, fontWeight:700,
                color: disponible <= 0 ? '#DC2626' : disponible <= Number(f.alerta_minimo) ? '#92400E' : '#15803D',
              }}>
                Disponible actual: {Math.max(0, disponible)}{f.unidad === 'g' ? 'g' : ' uds'}
                <span style={{ fontWeight:400, color:'#9CA3AF', marginLeft:8 }}>
                  = {f.stock_inicial||0} inicial + {f.entradas||0} entradas − {f.stock_usado||0} salidas
                </span>
              </div>
            )}
          </div>

          {/* Costo */}
          <Label t={costoLabel} />
          <Input type="number" value={f.costo_unitario}
            onChange={e=>upd('costo_unitario',e.target.value)}
            placeholder="ej: 0.15"/>
          {Number(f.costo_unitario) > 0 && Number(f.stock_inicial) > 0 && (
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>
              💰 Valor total del stock disponible:{' '}
              <strong style={{color:'#1A1A2E'}}>
                ${(Number(f.costo_unitario) * Math.max(0, disponible)).toFixed(2)}
              </strong>
            </div>
          )}

          {/* Notas */}
          <Label t="Notas" />
          <textarea value={f.notas} onChange={e=>upd('notas',e.target.value)}
            placeholder="Link de compra, tono exacto, observaciones..."
            style={{
              border:'1.5px solid #E5E7EB', borderRadius:10,
              padding:'9px 12px', fontSize:14, color:'#1A1A2E',
              backgroundColor:'#FAFAFA', width:'100%',
              boxSizing:'border-box', outline:'none',
              fontFamily:'inherit', resize:'vertical', minHeight:64,
            }}/>

          {/* Botones */}
          <div style={{ display:'flex', gap:10, marginTop:22 }}>
            <button onClick={onClose} style={{
              flex:1, padding:14, borderRadius:12,
              border:'2px solid #E5E7EB', backgroundColor:'transparent',
              fontWeight:800, fontSize:14, color:'#6B7280',
              cursor:'pointer', fontFamily:'inherit',
            }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{
              flex:2, padding:14, borderRadius:12,
              backgroundColor:'#1A1A2E', border:'none',
              color:'#fff', fontWeight:900, fontSize:14,
              cursor: saving ? 'wait' : 'pointer', fontFamily:'inherit',
            }}>
              {saving ? '⏳ Guardando...' : '💾 Guardar'}
            </button>
          </div>
          <div style={{ height:20 }}/>
        </div>
      </div>
    </div>
  );
}
