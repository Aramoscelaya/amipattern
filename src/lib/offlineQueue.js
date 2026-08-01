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

export function getTotalPending() {
  return getPendingSales().length + getPendingStock().length
}
