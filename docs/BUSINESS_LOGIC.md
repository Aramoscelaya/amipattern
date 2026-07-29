# Business Logic Reference

## Pricing Formula (Orders & Costings)

```
costoMateriales = Σ(material.cantidad × material.costo_unit)
costoManoObra   = horas × costo_hora
subtotal        = costoMateriales + costoManoObra
conOverhead      = subtotal × (1 + overhead_pct / 100)
precioSugerido  = conOverhead × (1 + margen_pct / 100)
```

### En OrderModal se muestra en vivo:
```
┌─────────────────────────────┐
│ Materiales:    $xxx          │
│ Mano de obra:  $xxx          │
│ ─────────────────────       │
│ Subtotal:      $xxx          │
│ Overhead (X%): $xxx          │
│ Utilidad (X%): $xxx          │
│ ─────────────────────       │
│ Sugerido:      $xxx          │
│ Precio final:  $xxx ◀ editable│
└─────────────────────────────┘
```

---

## Inventory Stock Calculation

```
disponible = stock_inicial + entradas - stock_usado
```

- `stock_inicial` se setea **una vez** al crear el item
- `entradas` se incrementa con cada reposición
- `stock_usado` se incrementa con cada uso (desde InventoryCard o por descuento automático de pedidos)

### Alertas de Stock Bajo
- Se activa cuando `disponible <= alerta_minimo`
- Se muestra badge rojo en InventoryCard
- Notificación browser al cargar InventoryScreen

---

## Inventory Deduction on Orders

Cuando un pedido cambia a estado `en_proceso` (y `inventario_descontado === false`):

```js
function _descontarInventario(materiales) {
  for each material in materiales:
    item = inventory.find(material.id_inventario)
    item.stock_usado += min(material.cantidad, item.disponible)
    // Capped at available stock
}
```

El flag `inventario_descontado` evita que se descuente múltiples veces si el estado cambia varias veces.

---

## Order Status Flow

```
pendiente → en_proceso → completado → entregado
                                               ↘ cancelado (cualquier estado)
```

Cada avance se hace desde el botón "Avanzar estado" en OrderCard.

### Urgencia de Entrega
- **Hoy:** Badge rojo + "⚠️ Entregas hoy:" banner
- **Mañana:** Badge naranja
- **En X días:** Badge azul con texto "Faltan X días"
- **Vencido:** Badge gris

### Notificaciones
- Al cargar BusinessScreen, revisa `proximosVencer` (due ≤ 2 días)
- Dispara notificaciones browser si hay pedidos próximos a vencer

---

## Store Sales Flow

```
registerSale({ product, event, cantidad, precio_unit, fecha, notas })
  → INSERT into store_sales
  → UPDATE store_products SET stock_vendido = stock_vendido + cantidad

deleteSale(sale)
  → DELETE from store_sales
  → UPDATE store_products SET stock_vendido = stock_vendido - sale.cantidad
```

### Stock Disponible en Tienda
```
disponible = stock_inicial - stock_vendido
```

---

## Event Stats

```js
eventStats(eventId) {
  sales = store_sales.filter(s => s.event_id === eventId)
  totalRevenue = Σ sales.total
  totalPieces = Σ sales.cantidad
  return { totalRevenue, totalPieces, sales }
}
```

---

## Costing → Product Creation Flow

`CostingModal.jsx` → `saveCostingAndProduct()`

1. Calcula costo total y precio sugerido
2. Crea registro en `store_costings`
3. Crea registro en `store_products` (con precio_final, stock, color, pattern link)
4. Linkea `product_id` en el costing

---

## Image Upload Flow

```js
uploadImage(file) {
  1. Resize client-side: 1200px max, JPEG 0.82 quality (canvas.toBlob)
  2. Generate unique filename: `${Date.now()}_${file.name}`
  3. Upload to Supabase Storage bucket 'pattern-images'
  4. Get public URL
  5. Return URL string
}
```

---

---

## Boutique Pricing Formula (Módulo Precios)

```
costo_total     = costo_material + (horas × pago_por_hora) + costo_empaque
precio_boutique = costo_total × (1 + margen_propio)
precio_publico  = precio_boutique / (1 - margen_boutique)
utilidad_tuya   = precio_boutique - costo_total
```

**Configuración global** (1 por usuario en `price_config`):
| Parámetro | Default | Ejemplo |
|-----------|---------|---------|
| `pago_por_hora` | $60 | |
| `margen_boutique` | 35% | Margen que se deja a la tienda |
| `margen_propio` | 20% | Ganancia mínima propia |

**Preview en el modal de configuración:**
```
Costo total:       $44
→ Precio boutique: $60   (costo * 1.2)
→ Precio público:  $100  (boutique / 0.65)
Utilidad tuya:     $16   (boutique - costo)
```

---

## Constants Reference (`src/lib/constants.js`)

```js
// Yarn colors (for thread selection)
COLORES_HILO = ['Blanco', 'Crema', 'Amarillo', 'Naranja', 'Rojo', ...]

// Difficulty levels
DIFICULTADES = ['fácil', 'media', 'difícil']

// Pattern statuses
ESTADOS_PATRON = ['no_iniciado', 'en_progreso', 'completado', 'abandonado']

// Order statuses
ESTADOS_PEDIDO = ['pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado']

// Badge colors map
BADGE_COLORS = { /* status/difficulty → color hex */ }

// UI Palette
COLORS = { primary: '#1A1A2E', background: '#F5F0EB', ... }

// Pricing defaults
PRICING_DEFAULTS = { pago_por_hora: 60, margen_boutique: 0.35, margen_propio: 0.20 }
COSTING_DEFAULTS = { costo_hora: 40, overhead_pct: 10, margen_pct: 30 }
```
