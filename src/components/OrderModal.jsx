import React, { useState, useEffect, useMemo } from 'react';
import { calcPrecio } from '../hooks/useOrders';

const ESTADOS = [
  { id:'pendiente',  label:'⏳ Pendiente',   color:'#FEF3C7', fg:'#92400E' },
  { id:'en_proceso', label:'🪡 En proceso',  color:'#EFF6FF', fg:'#1D4ED8' },
  { id:'listo',      label:'✅ Listo',       color:'#D1FAE5', fg:'#065F46' },
  { id:'entregado',  label:'📦 Entregado',   color:'#F3F4F6', fg:'#374151' },
  { id:'cancelado',  label:'❌ Cancelado',   color:'#FEE2E2', fg:'#991B1B' },
];

const EMOJIS = ['🧶','🐻','🐰','🐱','🐶','🦊','🐸','🦋','🌸','⭐','🎀','🐙','🦄','🌵','🍄'];

const BLANK = {
  cliente_nombre:'', cliente_telefono:'', cliente_email:'',
  patron_nombre:'', patron_emoji:'🧶',
  materiales:[],
  horas:'1', costo_hora:'40',
  overhead_pct:'10', margen_pct:'30',
  precio_venta:'', precio_manual:false,
  estado:'pendiente',
  fecha_pedido: new Date().toISOString().slice(0,10),
  fecha_entrega:'',
  anticipo:'0', notas:'',
};

const Label = ({ t, hint }) => (
  <div style={{ fontSize:11, fontWeight:800, color:'#6B7280',
    textTransform:'uppercase', letterSpacing:0.5, marginTop:14, marginBottom:5 }}>
    {t}{hint && <span style={{ fontSize:10, fontWeight:400, textTransform:'none', color:'#9CA3AF' }}> — {hint}</span>}
  </div>
);
const Input = ({ style={}, ...p }) => (
  <input style={{
    border:'1.5px solid #E5E7EB', borderRadius:10, padding:'9px 12px',
    fontSize:14, color:'#1A1A2E', backgroundColor:'#FAFAFA',
    width:'100%', boxSizing:'border-box', outline:'none', fontFamily:'inherit',
    ...style,
  }} {...p}/>
);

export default function OrderModal({ visible, initial, inventoryItems = [], onClose, onSave }) {
  const [f,        setF]      = useState(BLANK);
  const [saving,   setSaving] = useState(false);
  const [matSearch,setMS]     = useState('');
  const [showMats, setShowM]  = useState(false);

  useEffect(() => {
    setF(initial ? { ...BLANK, ...initial,
      horas: initial.horas || '1',
      costo_hora: initial.costo_hora || '40',
      overhead_pct: initial.overhead_pct || '10',
      margen_pct: initial.margen_pct || '30',
      anticipo: initial.anticipo || '0',
    } : { ...BLANK, fecha_pedido: new Date().toISOString().slice(0,10) });
  }, [initial, visible]);

  const upd = (k,v) => setF(x => ({ ...x, [k]:v }));

  // ── Cálculo en tiempo real ──
  const calc = useMemo(() => calcPrecio({
    materiales:   f.materiales || [],
    horas:        Number(f.horas)       || 0,
    costo_hora:   Number(f.costo_hora)  || 40,
    overhead_pct: Number(f.overhead_pct)|| 10,
    margen_pct:   Number(f.margen_pct)  || 30,
  }), [f.materiales, f.horas, f.costo_hora, f.overhead_pct, f.margen_pct]);

  // Sincroniza precio_venta con el calculado, a menos que sea manual
  useEffect(() => {
    if (!f.precio_manual) upd('precio_venta', calc.precioFinal.toFixed(2));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc.precioFinal, f.precio_manual]);

  // ── Materiales del inventario disponibles ──
  const invDisp = inventoryItems.filter(i =>
    i.nombre.toLowerCase().includes(matSearch.toLowerCase()) ||
    (i.marca||'').toLowerCase().includes(matSearch.toLowerCase())
  );

  const addMaterial = (inv) => {
    const ya = f.materiales.find(m => m.inv_id === inv.id);
    if (ya) return;
    upd('materiales', [...f.materiales, {
      inv_id:     inv.id,
      nombre:     inv.nombre,
      unidad:     inv.unidad,
      costo_unit: inv.costo_unitario || 0,
      cantidad:   1,
    }]);
    setMS(''); setShowM(false);
  };

  const updMat = (inv_id, cantidad) => {
    upd('materiales', f.materiales.map(m =>
      m.inv_id === inv_id ? { ...m, cantidad: Math.max(0.1, Number(cantidad)) } : m
    ));
  };
  const removeMat = (inv_id) =>
    upd('materiales', f.materiales.filter(m => m.inv_id !== inv_id));

  const handleSave = async () => {
    if (!f.cliente_nombre.trim()) { alert('Agrega el nombre del cliente.'); return; }
    if (!f.patron_nombre.trim())  { alert('Agrega el nombre del amigurumi.'); return; }
    setSaving(true);
    try { await onSave(f); }
    finally { setSaving(false); }
  };

  if (!visible) return null;

  const estadoObj = ESTADOS.find(e => e.id === f.estado) || ESTADOS[0];

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:1000,
      backgroundColor:'rgba(0,0,0,0.55)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        backgroundColor:'#fff', borderRadius:'24px 24px 0 0',
        width:'100%', maxWidth:640, maxHeight:'95vh',
        display:'flex', flexDirection:'column',
        animation:'slideUp 0.3s ease',
      }}>

        {/* Hero */}
        <div style={{
          background:'linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%)',
          padding:'18px 20px 14px', borderRadius:'24px 24px 0 0',
          display:'flex', alignItems:'center', gap:12,
        }}>
          {/* Emoji picker */}
          <div style={{ position:'relative' }}>
            <select value={f.patron_emoji} onChange={e=>upd('patron_emoji',e.target.value)}
              style={{
                position:'absolute', inset:0, opacity:0, cursor:'pointer',
                width:'100%', height:'100%',
              }}>
              {EMOJIS.map(e=><option key={e} value={e}>{e}</option>)}
            </select>
            <div style={{
              width:48, height:48, borderRadius:14,
              backgroundColor:'rgba(255,255,255,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, cursor:'pointer',
            }}>{f.patron_emoji}</div>
          </div>
          <input
            value={f.patron_nombre}
            onChange={e=>upd('patron_nombre',e.target.value)}
            placeholder="Nombre del amigurumi"
            style={{
              flex:1, fontSize:18, fontWeight:900, color:'#FAD2E1',
              background:'transparent', border:'none', outline:'none', fontFamily:'inherit',
            }}
          />
          <div style={{
            backgroundColor: estadoObj.color,
            color: estadoObj.fg,
            borderRadius:99, padding:'4px 10px',
            fontSize:11, fontWeight:800, whiteSpace:'nowrap',
          }}>{estadoObj.label}</div>
          <button onClick={onClose} style={{
            background:'rgba(255,255,255,0.15)', border:'none', borderRadius:10,
            width:34, height:34, cursor:'pointer', fontSize:18, color:'#fff',
          }}>×</button>
        </div>

        {/* Scroll body */}
        <div style={{ overflowY:'auto', flex:1, padding:'4px 20px 24px' }}>

          {/* ── Cliente ── */}
          <Label t="👤 Cliente" />
          <Input value={f.cliente_nombre} onChange={e=>upd('cliente_nombre',e.target.value)}
            placeholder="Nombre completo" style={{ marginBottom:8 }}/>
          <div style={{ display:'flex', gap:8 }}>
            <Input value={f.cliente_telefono} onChange={e=>upd('cliente_telefono',e.target.value)}
              placeholder="📱 Teléfono" type="tel" style={{ flex:1 }}/>
            <Input value={f.cliente_email} onChange={e=>upd('cliente_email',e.target.value)}
              placeholder="📧 Email" type="email" style={{ flex:1 }}/>
          </div>

          {/* ── Estado ── */}
          <Label t="Estado del pedido" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {ESTADOS.map(e => (
              <button key={e.id} onClick={()=>upd('estado',e.id)} style={{
                padding:'6px 12px', borderRadius:99, fontSize:12, fontWeight:700,
                cursor:'pointer', border:'1.5px solid', fontFamily:'inherit',
                backgroundColor: f.estado===e.id ? e.color : '#FAFAFA',
                borderColor:     f.estado===e.id ? e.fg   : '#E5E7EB',
                color:           f.estado===e.id ? e.fg   : '#6B7280',
              }}>{e.label}</button>
            ))}
          </div>

          {/* ── Fechas ── */}
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <Label t="📅 Fecha pedido" />
              <Input type="date" value={f.fecha_pedido} onChange={e=>upd('fecha_pedido',e.target.value)}/>
            </div>
            <div style={{ flex:1 }}>
              <Label t="🔔 Fecha entrega" hint="recordatorio 2 días antes"/>
              <Input type="date" value={f.fecha_entrega} onChange={e=>upd('fecha_entrega',e.target.value)}
                style={{ borderColor: f.fecha_entrega ? '#2DD4BF' : '#E5E7EB' }}/>
            </div>
          </div>

          {/* ── Materiales del inventario ── */}
          <Label t="🧵 Materiales usados" hint="desde tu inventario"/>

          <div style={{ position:'relative' }}>
            <Input
              value={matSearch}
              onChange={e=>{ setMS(e.target.value); setShowM(true); }}
              onFocus={()=>setShowM(true)}
              placeholder="Buscar material del inventario…"
            />
            {showMats && matSearch && invDisp.length > 0 && (
              <div style={{
                position:'absolute', top:'100%', left:0, right:0, zIndex:50,
                backgroundColor:'#fff', borderRadius:12,
                boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
                maxHeight:180, overflowY:'auto',
                border:'1.5px solid #E5E7EB', marginTop:4,
              }}>
                {invDisp.slice(0,8).map(inv => {
                  const disp = inv.stock_inicial + inv.entradas - inv.stock_usado;
                  return (
                    <button key={inv.id} onClick={()=>addMaterial(inv)}
                      disabled={disp <= 0}
                      style={{
                        width:'100%', padding:'10px 14px', border:'none',
                        borderBottom:'1px solid #F9FAFB',
                        backgroundColor:'transparent', cursor: disp<=0 ? 'default':'pointer',
                        textAlign:'left', fontFamily:'inherit',
                        display:'flex', justifyContent:'space-between', alignItems:'center',
                        opacity: disp<=0 ? 0.4 : 1,
                      }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:'#1A1A2E' }}>{inv.nombre}</div>
                        <div style={{ fontSize:11, color:'#9CA3AF' }}>
                          {inv.marca} · ${inv.costo_unitario}/{inv.unidad==='g'?'g':'ud'}
                        </div>
                      </div>
                      <div style={{ fontSize:11, color: disp<=0?'#EF4444':'#16A34A', fontWeight:700 }}>
                        {disp<=0 ? 'Sin stock' : `${Math.max(0,disp).toFixed(0)} disp.`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {showMats && <div onClick={()=>setShowM(false)} style={{ position:'fixed', inset:0, zIndex:49 }}/>}

          {/* Lista de materiales seleccionados */}
          {f.materiales.length > 0 && (
            <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:6 }}>
              {f.materiales.map(m => (
                <div key={m.inv_id} style={{
                  display:'flex', alignItems:'center', gap:8,
                  backgroundColor:'#F9FAFB', borderRadius:10,
                  padding:'8px 10px', border:'1px solid #F3F4F6',
                }}>
                  <span style={{ flex:1, fontSize:13, fontWeight:700, color:'#1A1A2E' }}>{m.nombre}</span>
                  <span style={{ fontSize:11, color:'#9CA3AF' }}>
                    ${m.costo_unit}/{m.unidad==='g'?'g':'ud'}
                  </span>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <button onClick={()=>updMat(m.inv_id, Math.max(0.1, m.cantidad-1))}
                      style={{ width:22, height:22, borderRadius:6, border:'1px solid #E5E7EB',
                        background:'#fff', cursor:'pointer', fontWeight:900, fontSize:14,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                    <input type="number" min="0.1" value={m.cantidad}
                      onChange={e=>updMat(m.inv_id, e.target.value)}
                      style={{ width:42, textAlign:'center', border:'1px solid #E5E7EB',
                        borderRadius:6, padding:'2px 4px', fontSize:12,
                        fontWeight:700, outline:'none', fontFamily:'inherit' }}/>
                    <button onClick={()=>updMat(m.inv_id, m.cantidad+1)}
                      style={{ width:22, height:22, borderRadius:6, border:'1px solid #E5E7EB',
                        background:'#fff', cursor:'pointer', fontWeight:900, fontSize:14,
                        display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:'#1A1A2E', minWidth:44, textAlign:'right' }}>
                    ${(m.cantidad * m.costo_unit).toFixed(2)}
                  </span>
                  <button onClick={()=>removeMat(m.inv_id)}
                    style={{ background:'none', border:'none', cursor:'pointer',
                      color:'#EF4444', fontSize:14, fontWeight:900, padding:0 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* ── Tiempo de trabajo ── */}
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <Label t="⏱️ Horas de trabajo" />
              <Input type="number" min="0" step="0.5"
                value={f.horas} onChange={e=>upd('horas',e.target.value)}
                placeholder="ej: 3.5"/>
            </div>
            <div style={{ flex:1 }}>
              <Label t="💵 Costo por hora ($)" />
              <Input type="number" min="0"
                value={f.costo_hora} onChange={e=>upd('costo_hora',e.target.value)}
                placeholder="40"/>
            </div>
          </div>

          {/* ── Márgenes ── */}
          <div style={{ display:'flex', gap:12 }}>
            <div style={{ flex:1 }}>
              <Label t="📊 Overhead %" hint="gastos fijos"/>
              <Input type="number" min="0" max="100"
                value={f.overhead_pct} onChange={e=>upd('overhead_pct',e.target.value)}/>
            </div>
            <div style={{ flex:1 }}>
              <Label t="💹 Margen de ganancia %" />
              <Input type="number" min="0" max="200"
                value={f.margen_pct} onChange={e=>upd('margen_pct',e.target.value)}/>
            </div>
          </div>

          {/* ── Desglose de costos en tiempo real ── */}
          <div style={{
            backgroundColor:'#F9FAFB', borderRadius:14,
            border:'1.5px solid #E5E7EB',
            padding:'14px 16px', marginTop:14,
          }}>
            <div style={{ fontSize:11, fontWeight:800, color:'#6B7280',
              textTransform:'uppercase', letterSpacing:0.5, marginBottom:12 }}>
              🧮 Desglose de costos
            </div>
            {[
              { label:`Materiales (${f.materiales.length} items)`, val: calc.costoMat,    color:'#374151' },
              { label:`Mano de obra (${f.horas}h × $${f.costo_hora})`, val: calc.costoMO, color:'#374151' },
              { label:'Subtotal',                                    val: calc.subtotal,   color:'#374151', border:true },
              { label:`Overhead (${f.overhead_pct}%)`,              val: calc.conOverhead - calc.subtotal, color:'#6B7280' },
              { label:`Ganancia (${f.margen_pct}%)`,                val: calc.precioFinal - calc.conOverhead, color:'#16A34A' },
            ].map(r => (
              <div key={r.label} style={{
                display:'flex', justifyContent:'space-between',
                padding:'5px 0',
                borderTop: r.border ? '1px solid #E5E7EB' : 'none',
                marginTop: r.border ? 4 : 0,
              }}>
                <span style={{ fontSize:12, color:'#6B7280' }}>{r.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color: r.color }}>${r.val.toFixed(2)}</span>
              </div>
            ))}
            {/* Precio final */}
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              borderTop:'2px solid #1A1A2E', marginTop:8, paddingTop:10,
            }}>
              <span style={{ fontSize:14, fontWeight:800, color:'#1A1A2E' }}>Precio sugerido</span>
              <span style={{ fontSize:22, fontWeight:900, color:'#1A1A2E' }}>
                ${calc.precioFinal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Precio de venta ── */}
          <Label t="💰 Precio de venta final" hint={f.precio_manual ? 'manual' : 'calculado automático'}/>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Input type="number" min="0"
              value={f.precio_venta}
              onChange={e=>{ upd('precio_venta',e.target.value); upd('precio_manual',true); }}
              style={{ flex:1, fontWeight:700, fontSize:16 }}/>
            {f.precio_manual && (
              <button onClick={()=>{ upd('precio_manual',false); }} style={{
                padding:'8px 12px', borderRadius:10, border:'1.5px solid #E5E7EB',
                backgroundColor:'#F9FAFB', cursor:'pointer', fontSize:12,
                fontWeight:700, color:'#6B7280', fontFamily:'inherit', whiteSpace:'nowrap',
              }}>↺ Auto</button>
            )}
          </div>

          {/* ── Anticipo ── */}
          <Label t="💳 Anticipo recibido ($)" />
          <Input type="number" min="0"
            value={f.anticipo} onChange={e=>upd('anticipo',e.target.value)}/>
          {Number(f.precio_venta) > 0 && (
            <div style={{ fontSize:12, color:'#6B7280', marginTop:4 }}>
              Saldo pendiente:{' '}
              <strong style={{ color: Number(f.anticipo) >= Number(f.precio_venta) ? '#16A34A' : '#EF4444' }}>
                ${Math.max(0, Number(f.precio_venta) - Number(f.anticipo)).toFixed(2)}
              </strong>
            </div>
          )}

          {/* ── Notas ── */}
          <Label t="📝 Notas del pedido" />
          <textarea value={f.notas} onChange={e=>upd('notas',e.target.value)}
            placeholder="Detalles especiales, tallas, colores específicos…"
            style={{
              border:'1.5px solid #E5E7EB', borderRadius:10,
              padding:'9px 12px', fontSize:14, color:'#1A1A2E',
              backgroundColor:'#FAFAFA', width:'100%',
              boxSizing:'border-box', outline:'none',
              fontFamily:'inherit', resize:'vertical', minHeight:64,
            }}/>

          {/* ── Botones ── */}
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
              cursor: saving ? 'wait':'pointer', fontFamily:'inherit',
            }}>{saving ? '⏳ Guardando…' : '💾 Guardar pedido'}</button>
          </div>
          <div style={{ height:20 }}/>
        </div>
      </div>
    </div>
  );
}
