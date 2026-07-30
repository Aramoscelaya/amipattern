export function calcPrecio({ mode, ...params }) {
  if (mode === 'order' || mode === 'costing') {
    const costoMateriales = (params.materiales || []).reduce(
      (s, m) => s + (Number(m.cantidad) || 0) * (Number(m.costo_unit) || 0), 0
    )
    const costoManoObra   = (Number(params.horas) || 0) * (Number(params.costo_hora) || 60)
    const subtotal        = costoMateriales + costoManoObra
    const conOverhead     = subtotal * (1 + (Number(params.overhead_pct) || 10) / 100)
    const precioFinal     = conOverhead * (1 + (Number(params.margen_pct) || 30) / 100)
    return {
      costoMateriales:  round2(costoMateriales),
      costoManoObra:    round2(costoManoObra),
      subtotal:         round2(subtotal),
      conOverhead:      round2(conOverhead),
      precioFinal:      round2(precioFinal),
      costoTotal:       round2(subtotal),
    }
  }

  if (mode === 'boutique') {
    const costoTotal      = (Number(params.costo_material) || 0)
                          + (Number(params.horas) || 0) * (Number(params.pago_por_hora) || 60)
                          + (Number(params.costo_empaque) || 0)
    const precioBoutique  = costoTotal * (1 + (Number(params.margen_propio) || 0.20))
    const precioPublico   = precioBoutique / (1 - (Number(params.margen_boutique) || 0.35))
    const utilidadTuya    = precioBoutique - costoTotal
    return {
      costo_total:      round2(costoTotal),
      precio_boutique:  round2(precioBoutique),
      precio_publico:   round2(precioPublico),
      utilidad_tuya:    round2(utilidadTuya),
    }
  }

  throw new Error(`calcPrecio: mode desconocido "${mode}"`)
}

function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100 }
