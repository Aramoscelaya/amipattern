const KEYS = {
  sales: 'amipattern_pending_sales',
  stock: 'amipattern_pending_stock',
}

// ── Ventas ────────────────────────────────────────────────────
export function getPendingSales() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.sales) || '[]')
  } catch { return [] }
}

export function addPendingSale(sale) {
  const pending = getPendingSales()
  pending.push({ ...sale, _id: 'offline_' + Date.now(), _savedAt: new Date().toISOString() })
  localStorage.setItem(KEYS.sales, JSON.stringify(pending))
}

export function removePendingSale(id) {
  const pending = getPendingSales().filter(s => s._id !== id)
  localStorage.setItem(KEYS.sales, JSON.stringify(pending))
}

export function clearPendingSales() {
  localStorage.removeItem(KEYS.sales)
}

// ── Stock ─────────────────────────────────────────────────────
export function getPendingStock() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.stock) || '[]')
  } catch { return [] }
}

export function addPendingStock(entry) {
  const pending = getPendingStock()
  // Si ya hay una entrada pendiente para el mismo producto, sumar cantidades
  const existing = pending.find(p => p.productId === entry.productId)
  if (existing) {
    existing.cantidad += entry.cantidad
    existing._savedAt = new Date().toISOString()
  } else {
    pending.push({ ...entry, _id: 'offline_stock_' + Date.now(), _savedAt: new Date().toISOString() })
  }
  localStorage.setItem(KEYS.stock, JSON.stringify(pending))
}

export function removePendingStock(id) {
  const pending = getPendingStock().filter(s => s._id !== id)
  localStorage.setItem(KEYS.stock, JSON.stringify(pending))
}

export function clearPendingStock() {
  localStorage.removeItem(KEYS.stock)
}

// ── Stock de Catálogo ─────────────────────────────────────────
// Separado de amipattern_pending_stock (que es para Tab Vender)
// para evitar conflictos en la sincronización

const KEY_CATALOG_STOCK = 'amipattern_pending_catalog_stock'

export function getPendingCatalogStock() {
  try {
    return JSON.parse(localStorage.getItem(KEY_CATALOG_STOCK) || '[]')
  } catch { return [] }
}

export function addPendingCatalogStock(entry) {
  // entry = { productId, cantidad }
  const pending = getPendingCatalogStock()
  // Si ya hay entrada pendiente para el mismo producto, acumular
  const existing = pending.find(p => p.productId === entry.productId)
  if (existing) {
    existing.cantidad += Number(entry.cantidad)
    existing._savedAt = new Date().toISOString()
  } else {
    pending.push({
      ...entry,
      cantidad: Number(entry.cantidad),
      _id: 'offline_catstock_' + Date.now(),
      _savedAt: new Date().toISOString(),
    })
  }
  localStorage.setItem(KEY_CATALOG_STOCK, JSON.stringify(pending))
}

export function removePendingCatalogStock(id) {
  const pending = getPendingCatalogStock().filter(p => p._id !== id)
  localStorage.setItem(KEY_CATALOG_STOCK, JSON.stringify(pending))
}

export function clearPendingCatalogStock() {
  localStorage.removeItem(KEY_CATALOG_STOCK)
}

// ── Costings offline ──────────────────────────────────────────
const KEY_COSTINGS = 'amipattern_pending_costings'

export function getPendingCostings() {
  try {
    return JSON.parse(localStorage.getItem(KEY_COSTINGS) || '[]')
  } catch { return [] }
}

export function addPendingCosting(entry) {
  // entry = { form, mode }
  // mode: 'new_product' | 'update_product' | 'costing_only'
  const pending = getPendingCostings()
  pending.push({
    ...entry,
    _id: 'offline_costing_' + Date.now(),
    _savedAt: new Date().toISOString(),
  })
  localStorage.setItem(KEY_COSTINGS, JSON.stringify(pending))
}

export function removePendingCosting(id) {
  const pending = getPendingCostings().filter(p => p._id !== id)
  localStorage.setItem(KEY_COSTINGS, JSON.stringify(pending))
}

export function clearPendingCostings() {
  localStorage.removeItem(KEY_COSTINGS)
}

// ── Total pendientes global (actualizado) ─────────────────────
export function getTotalPending() {
  return (
    getPendingSales().length +
    getPendingStock().length +
    getPendingCatalogStock().length +
    getPendingCostings().length
  )
}
