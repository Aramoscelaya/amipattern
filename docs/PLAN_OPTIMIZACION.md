# Plan de Optimización — AmiPattern
> Documento de instrucciones para OpenCode. Ejecutar fase por fase en orden estricto.
> Después de cada fase: `npm run build` debe compilar sin errores antes de continuar.

---

## Contexto del Proyecto

- **Stack:** React 18 + Supabase + Vercel (Create React App, sin router, sin CSS framework)
- **Navegación:** Estado `view` en `App.jsx` — sin BottomNav, sin tabs. Cada módulo es una vista independiente.
- **Estilos:** 100% inline styles. Sin archivos CSS.
- **Hooks:** Toda la lógica de datos vive en custom hooks (`usePatterns`, `useInventory`, `useOrders`, `useStore`, `usePriceList`).
- **Estructura de archivos relevante:**
  ```
  src/
  ├── App.jsx
  ├── lib/constants.js
  ├── hooks/usePatterns.js, useInventory.js, useOrders.js, useStore.js, usePriceList.js
  ├── pages/DashboardScreen.jsx, PatternsScreen.jsx, DetailScreen.jsx,
  │         InventoryScreen.jsx, BusinessScreen.jsx, StoreScreen.jsx, PriceListScreen.jsx
  └── components/[ver COMPONENTS.md para lista completa]
  ```

---

## Fase 1 — Limpieza + Componentes Compartidos

### Objetivo
Eliminar 21 archivos muertos y centralizar ~700 líneas de código duplicado en 3 componentes compartidos.

### Precondición
Ninguna. Esta es la fase base.

### Archivos a CREAR (3)

#### `src/components/Toast.jsx`
Implementar con `React.createContext` + `useReducer`. Exportar:
- `ToastProvider` — envuelve la app, renderiza el toast visual
- `useToast()` — devuelve `showToast(message, duration = 2200)`

El toast debe:
- Aparecer en `position: fixed`, centrado horizontalmente, `top: 20px`
- `z-index: 9999`
- Fondo `#1A1A2E`, texto blanco, `border-radius: 99px`, `padding: 10px 20px`
- Desaparecer automáticamente tras `duration` ms
- Solo mostrar 1 toast a la vez (el nuevo reemplaza al anterior)

#### `src/components/ConfirmDialog.jsx`
Componente funcional. Props:
```js
{ visible, title, message, onConfirm, onCancel, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', confirmColor = '#EF4444' }
```
Debe:
- Renderizar overlay oscuro + card centrada (no bottom sheet)
- Manejar teclado: `Enter` → `onConfirm`, `Escape` → `onCancel`
- `z-index: 1100`
- No renderizar nada si `visible === false`

#### `src/components/FormFields.jsx`
Exportar como named exports (no default):
```js
export function StyledInput({ value, onChange, placeholder, type, inputMode, min, max, autoFocus, style })
export function StyledLabel({ children })
export function StyledTextarea({ value, onChange, placeholder, rows, style })
export function SelectRow({ value, onChange, children, style })
```
Estilos base (deben verse idénticos a los actuales):
```js
const baseInput = {
  width: '100%', boxSizing: 'border-box',
  backgroundColor: '#F9FAFB', borderRadius: 10,
  border: '1.5px solid #E5E7EB',
  padding: '10px 12px', fontSize: 14, color: '#1A1A2E',
  outline: 'none', fontFamily: 'inherit',
}
const baseLabel = {
  fontSize: 12, fontWeight: 800, color: '#6B7280',
  marginBottom: 4, display: 'block',
  textTransform: 'uppercase', letterSpacing: 0.5,
}
```
El prop `style` permite override adicional por instancia.

### Archivos a MODIFICAR

**`src/App.jsx`**
- Importar `ToastProvider` y envolver `<AppInner>` con él
- Eliminar cualquier toast local que exista en App.jsx

**Screens:** `InventoryScreen.jsx`, `BusinessScreen.jsx`, `StoreScreen.jsx`, `PriceListScreen.jsx`, `DetailScreen.jsx`
- Reemplazar toast local (`useState` + `setTimeout`) por `const { showToast } = useToast()`
- Reemplazar `ConfirmDialog` inline por `import { ConfirmDialog } from '../components/ConfirmDialog'`

**`src/components/EventsPanel.jsx`**
- Reemplazar confirm inline por `<ConfirmDialog>`

**Modales** (reemplazar inputs/labels inline por FormFields):
`PatternModal.jsx`, `InventoryModal.jsx`, `OrderModal.jsx`, `CostingModal.jsx`,
`StoreProductModal.jsx`, `SaleModal.jsx`, `StoreEventModal.jsx`,
`PriceConfigModal.jsx`, `PriceListItemModal.jsx`
- Reemplazar campos `<input>`, `<textarea>`, `<select>` con sus wrappers de `FormFields.jsx`
- Las etiquetas `<span style={LABEL}>` → `<StyledLabel>`
- **No cambiar ningún estado, handler ni lógica de negocio**

### Archivos a ELIMINAR (21)
> ⚠️ Antes de eliminar, verificar que ningún archivo activo los importa con `grep -r "BottomNav" src/` etc.

```
src/hooks/useStore_v1.js
src/hooks/useOrders_v1.js
src/hooks/useOrders_v2.js
src/hooks/useInventory_v1.js

src/pages/GridScreen.jsx          ← verificar que no se importe en App.jsx antes de eliminar
src/pages/GridScreen_v1.jsx
src/pages/GridScreen_v2.jsx
src/pages/GridScreen_v3.jsx
src/pages/GridScreen_v4.jsx
src/pages/StoreScreen_v1.jsx
src/pages/StoreScreen_v2.jsx
src/pages/StoreScreen_v3.jsx
src/pages/InventoryScreen_v1.jsx
src/pages/ComingSoonScreen.jsx    ← verificar que no se importe antes de eliminar

src/components/BottomNav.jsx      ← verificar que no se importe antes de eliminar
src/components/BottomNav_v1.jsx
src/components/SaleModal_v1.jsx
src/components/InventoryModal_v1.jsx
src/components/InventoryCard_v1.jsx
src/components/StoreEventModal_v1.jsx
src/components/StoreProductModal_v1.jsx
```

### Reglas
- `useToast()` debe funcionar desde cualquier componente sin prop drilling
- `ConfirmDialog` debe ser accesible por teclado (Enter/Escape)
- `FormFields` debe verse visualmente idéntico a los estilos inline actuales
- **No cambiar ningún comportamiento funcional ni lógica de negocio**
- **No cambiar estructura de datos ni SQL**

### Criterio de fase completada
- [ ] `npm run build` sin errores
- [ ] `grep -r "useState.*toast\|setToast" src/` → solo en `Toast.jsx`
- [ ] `grep -r "confirm\|window.confirm" src/` → cero resultados fuera de `ConfirmDialog.jsx`
- [ ] Sin referencias a `_v1`, `_v2` en ningún archivo activo
- [ ] Los 21 archivos eliminados no existen en `src/`
- [ ] Toast, ConfirmDialog y FormFields se ven idénticos a antes visualmente

---

## Fase 2 — Unificar Motor de Pricing

### Objetivo
Reemplazar los 2 engines de pricing separados (`calcPrecio` en `useOrders.js` y `calcPrecioBoutique` en `usePriceList.js`) con un módulo único `src/lib/pricing.js`.

### Precondición
Fase 1 completada y buildeando.

### Problema actual
| Engine | Ubicación | Default costo/hora | Fórmula |
|--------|-----------|-------------------|---------|
| `calcPrecio` | `useOrders.js` | $40 | `(mat + horas×$40) × 1.10 × 1.30` |
| `calcPrecioBoutique` | `usePriceList.js` | $60 | `costoTotal × (1+margen_propio) / (1-margen_boutique)` |
| `COSTING_DEFAULTS` | `constants.js` | costo_hora: 40 | — |
| `PRICING_DEFAULTS` | `constants.js` | pago_por_hora: 60 | — |

### Archivo a CREAR

#### `src/lib/pricing.js`

```js
// Función pura — sin efectos secundarios, sin llamadas a API

export function calcPrecio({ mode, ...params }) {
  if (mode === 'order' || mode === 'costing') {
    // params: { materiales[], horas, costo_hora, overhead_pct, margen_pct }
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
      // Alias para compatibilidad con CostingModal
      costoTotal:       round2(subtotal),
    }
  }

  if (mode === 'boutique') {
    // params: { costo_material, horas, costo_empaque, pago_por_hora, margen_propio, margen_boutique }
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
```

### Archivo a MODIFICAR: `src/lib/constants.js`
- Eliminar `COSTING_DEFAULTS` y `PRICING_DEFAULTS` por separado
- Reemplazar con un único objeto:
```js
export const PRICING_DEFAULTS = {
  costo_hora:      60,   // unificado (era 40 en orders, 60 en price list)
  overhead_pct:    10,
  margen_pct:      30,
  pago_por_hora:   60,
  margen_boutique: 0.35,
  margen_propio:   0.20,
}
```
> ⚠️ El cambio de default `costo_hora` de 40 → 60 solo afecta registros **nuevos**. Los pedidos/costings existentes en DB conservan su valor guardado.

### Archivos a MODIFICAR: Hooks

**`src/hooks/useOrders.js`**
- Eliminar la función `calcPrecio` local
- Importar: `import { calcPrecio } from '../lib/pricing'`
- En todas las llamadas: agregar `mode: 'order'`
- Verificar que los output keys (`costoMateriales`, `costoManoObra`, `subtotal`, `conOverhead`, `precioFinal`) coincidan con lo que consume `OrderModal.jsx`

**`src/hooks/usePriceList.js`**
- Eliminar la función `calcPrecioBoutique` local
- Importar: `import { calcPrecio } from '../lib/pricing'`
- En todas las llamadas: agregar `mode: 'boutique'`
- Verificar que los output keys (`costo_total`, `precio_boutique`, `precio_publico`, `utilidad_tuya`) coincidan con lo que consume `PriceListItemModal.jsx`

**`src/hooks/useStore.js`** (CostingModal usa este hook)
- Eliminar cualquier cálculo de precio inline en `saveCosting`
- Importar `calcPrecio` con `mode: 'costing'`

### Archivos a MODIFICAR: Componentes

**`src/components/OrderModal.jsx`** y **`src/components/CostingModal.jsx`**
- Ajustar si los keys del resultado de `calcPrecio` cambiaron de nombre
- No cambiar el desglose visual ni la lógica del formulario

**`src/components/PriceConfigModal.jsx`**
- Los porcentajes `margen_boutique` y `margen_propio` se almacenan como decimal (0.35, 0.20) en DB
- En la UI mostrar y recibir como entero (35, 20) — hacer la conversión al guardar/cargar
- Verificar que el preview en vivo use `calcPrecio({ mode: 'boutique', ... })`

### Reglas de validación
- `calcPrecio({ mode: 'order', materiales: [{cantidad:1, costo_unit:50}], horas: 2, costo_hora: 60, overhead_pct: 10, margen_pct: 30 })` debe dar exactamente el mismo resultado que la fórmula anterior (con esos mismos parámetros)
- `calcPrecio` es función pura: dado los mismos inputs, siempre devuelve los mismos outputs
- Redondear a 2 decimales con `Math.round((n + Number.EPSILON) * 100) / 100`

### Criterio de fase completada
- [ ] `src/lib/pricing.js` existe con los 2 modos
- [ ] `constants.js` tiene un solo `PRICING_DEFAULTS` con `costo_hora: 60`
- [ ] `useOrders.js` no tiene `calcPrecio` local
- [ ] `usePriceList.js` no tiene `calcPrecioBoutique` local
- [ ] `grep -r "calcPrecio\|calcPrecioBoutique" src/hooks/` → cero resultados
- [ ] `npm run build` sin errores
- [ ] Los módulos Negocio y Precios muestran los mismos números que antes (verificar manualmente con un caso de prueba)

---

## Fase 3 — Fusión CostingModal + PriceListItemModal

### Objetivo
Reemplazar `CostingModal.jsx` y `PriceListItemModal.jsx` con un único `ProductModal.jsx` que puede crear en tienda, en lista de precios, o en ambos desde un mismo formulario.

### Precondición
Fase 2 completada. `calcPrecio` importado desde `src/lib/pricing.js`.

### Archivo a CREAR

#### `src/components/ProductModal.jsx`

Bottom sheet con 3 secciones:

**Sección 1 — Identidad + Costos** (siempre visible)
- Emoji picker, nombre*, categoría, patrón vinculado (opcional, `select` desde `patterns[]`)
- Tabla de materiales dinámica: agregar/quitar filas `{ nombre, cantidad, costo_unit }`
- Horas trabajadas, costo por hora
- Overhead % y margen %
- **Desglose en vivo** (actualiza con cada keystroke, usando `calcPrecio({ mode: 'costing', ... })`):
  ```
  Materiales:     $x.xx
  Mano de obra:   $x.xx
  Overhead (10%): $x.xx
  Ganancia (30%): $x.xx
  ─────────────────────
  Precio sugerido: $x.xx
  ```
- Campo "Precio final" — pre-llenado con sugerido, editable manualmente
  - Si se edita manualmente, mostrar badge "Precio personalizado" + botón "↩ Usar sugerido"

**Sección 2 — 🏪 Crear en Tienda** (toggle, ON por defecto)
- Stock inicial, color de tarjeta (color picker), descripción
- El precio_venta se toma del precio final de Sección 1

**Sección 3 — 💰 Agregar a Lista de Precios** (toggle, OFF por defecto)
- Tamaño (size), costo de empaque, nota
- Desglose boutique en vivo (usando `calcPrecio({ mode: 'boutique', ... })` con config del usuario):
  ```
  Precio boutique: $x.xx
  Precio público:  $x.xx
  Tu utilidad:     $x.xx
  ```

**Props:**
```js
ProductModal({
  visible,
  initial,          // null = crear, objeto = editar
  patterns,         // array de patrones para el selector
  priceConfig,      // config boutique del usuario (para sección 3)
  onClose,
  onSave,           // async fn({ costing?, storeProduct?, priceListItem? })
})
```

**Al guardar:**
- Si toggle Tienda ON → `saveCosting(form, saveProduct)` (mismo flujo que CostingModal actual)
- Si toggle Price List ON → `saveItem(priceListPayload)` (mismo flujo que PriceListItemModal actual)
- Si ambos ON → ejecutar ambas operaciones independientemente (no hay transacción cross-table)
- Si ambos OFF → solo guardar el costing sin crear producto ni price list item

### Archivos a MODIFICAR

**`src/pages/StoreScreen.jsx`**
- Reemplazar import de `CostingModal` por `ProductModal`
- Pasar `priceConfig` como prop (obtenerlo de `usePriceConfig` hook)
- El botón "🧮 Calcular costo" en quick actions abre `ProductModal` con toggle Tienda ON, Price List OFF
- Al editar un producto que tiene costing vinculado, abrir `ProductModal` con datos pre-cargados

**`src/pages/PriceListScreen.jsx`**
- Reemplazar import de `PriceListItemModal` por `ProductModal`
- El FAB abre `ProductModal` con toggle Tienda OFF, toggle Price List ON
- Pasar `priceConfig` como prop

### Archivos a ELIMINAR
```
src/components/CostingModal.jsx
src/components/PriceListItemModal.jsx
```
> Eliminar solo después de verificar que `ProductModal` funciona correctamente en ambas pantallas.

### Reglas
- `StoreProductModal.jsx` se mantiene intacto — es para creación rápida sin costing
- No modificar hooks (`useStore`, `usePriceList`) — solo se consumen desde el nuevo modal
- Si se crea en tienda, el resultado debe ser idéntico al `CostingModal` anterior
- Si se crea en price list, el resultado debe ser idéntico al `PriceListItemModal` anterior
- Todos los `useEffect`, `useCallback`, `useMemo` deben estar **antes** de cualquier `return` condicional (regla de hooks)

### Criterio de fase completada
- [ ] `ProductModal.jsx` creado con las 3 secciones y toggles funcionales
- [ ] `StoreScreen.jsx` usa `ProductModal` en lugar de `CostingModal`
- [ ] `PriceListScreen.jsx` usa `ProductModal` en lugar de `PriceListItemModal`
- [ ] `CostingModal.jsx` y `PriceListItemModal.jsx` eliminados
- [ ] Crear producto en tienda → resultado idéntico al CostingModal anterior
- [ ] Crear item en price list → resultado idéntico al PriceListItemModal anterior
- [ ] `npm run build` sin errores ni warnings de hooks

---

## Fase 4 — Conexión entre Módulos

### Objetivo
Eliminar la necesidad de re-ingresar datos cuando el usuario quiere mover información entre módulos.

### Precondición
Fase 3 completada. `ProductModal` disponible y funcionando.

### Sub-tareas

#### 4a. Patrón → Crear producto (DetailScreen)

**`src/pages/DetailScreen.jsx`**
- Agregar botón "📦 Crear producto" en la pantalla de detalle del patrón
  - Visible siempre (no condicional)
  - Abre `ProductModal` con estos datos pre-cargados:
    ```js
    {
      nombre:    pattern.nombre,
      emoji:     pattern.emoji,
      patron_id: pattern.id,
      patron_nombre: pattern.nombre,
      // Si pattern.materiales existe como texto, mostrarlo en el campo descripción/notas
    }
    ```
  - Toggle Tienda ON, toggle Price List OFF por defecto
- Requiere que `App.jsx` pase `priceConfig` y `onOpenProductModal` como props a `DetailScreen`

#### 4b. Producto de Tienda → Agregar a Price List (StoreScreen)

**`src/pages/StoreScreen.jsx`**
- En cada `ProductCard`, agregar botón "💰" (icono pequeño junto al ✏️)
- Al tocarlo, abre `ProductModal` con datos del producto pre-cargados y toggle Price List ON
  - `nombre`, `emoji`, `precio` desde el store product
  - Toggle Tienda OFF (ya existe), toggle Price List ON

#### 4c. Dashboard con datos reales

**`src/pages/DashboardScreen.jsx`**
> ⚠️ Este archivo ya existe según COMPONENTS.md. Modificar el existente, no crear uno nuevo.

Agregar debajo del grid de módulos una sección de **resumen rápido** con stats reales:
- `patterns.length` → "X patrones"
- `items.filter(i => disponible(i) <= i.alerta_minimo).length` → "X alertas de stock"
- `orders.filter(o => o.estado === 'pendiente' || o.estado === 'en_proceso').length` → "X pedidos activos"
- `products.reduce((s, p) => s + p.stock_inicial - p.stock_vendido, 0)` → "X piezas en tienda"

Y una sección de **alertas activas** (solo si hay datos):
- Stock bajo: items con `disponible <= alerta_minimo`
- Entregas próximas: orders con `fecha_entrega` en ≤ 2 días y estado no completado/cancelado

**`src/App.jsx`**
- Ya instancia `usePatterns`, `useInventory`, `useOrders`, `useStore`
- Pasar `patterns`, `items`, `orders`, `products` como props a `DashboardScreen`
- No hacer queries adicionales — solo pasar lo que ya está en memoria

#### 4d. DetailScreen → Link a Inventario

**`src/pages/DetailScreen.jsx`**
- Si `pattern.materiales` (campo texto) tiene contenido, mostrar un banner o sección:
  ```
  📦 Materiales de este patrón
  [texto de materiales]
  → Ver inventario
  ```
- El botón "→ Ver inventario" llama a `onBack()` y navega a `view: 'inventory'`
- Requiere que `App.jsx` pase `onGoToInventory` como prop a `DetailScreen`

### Archivos a MODIFICAR
```
src/pages/DashboardScreen.jsx   ← stats reales + alertas
src/pages/DetailScreen.jsx      ← botón crear producto + link inventario
src/pages/StoreScreen.jsx       ← botón 💰 por producto
src/App.jsx                     ← pasar props adicionales a Dashboard y Detail
```

### Reglas
- El Dashboard no debe instanciar hooks propios — solo recibir props desde App.jsx
- Los botones de acción rápida solo aparecen cuando hay datos relevantes (no mostrar botón "💰" si ya existe un price_list item para ese product)
- `ProductModal` debe recibir los datos pre-cargados como prop `initial`

### Criterio de fase completada
- [ ] DetailScreen tiene botón "📦 Crear producto" que abre `ProductModal` con nombre y patrón pre-cargados
- [ ] DetailScreen muestra sección de materiales con link a inventario (solo si `pattern.materiales` tiene contenido)
- [ ] StoreScreen tiene botón "💰" por producto para agregar a price list
- [ ] DashboardScreen muestra stats reales: patrones, alertas de stock, pedidos activos, piezas en tienda
- [ ] DashboardScreen muestra alertas de stock bajo y entregas próximas (cuando existen)
- [ ] `npm run build` sin errores

---

## Fase 5 — Consistencia UX y Performance

### Objetivo
Eliminar todas las inconsistencias visuales, estandarizar z-index, animaciones y prop names, y optimizar renders con `useMemo`.

### Precondición
Fase 4 completada.

### Sub-tareas

#### 5a. Constantes globales en `src/lib/constants.js`

Agregar:
```js
export const Z_INDEX = {
  header:        100,
  fab:           300,
  modal:         1000,
  confirmDialog: 1100,
  toast:         9999,
}

export const COLORS_PALETTE = [
  '#FAD2E1','#B5EAD7','#FFDAC1','#C7CEEA',
  '#A8DADC','#F4A261','#E9C46A','#2A9D8F','#264653','#E76F51',
]

export const ANIMATION = {
  slideUp: 'slideUp 0.25s ease',
}
```

#### 5b. Reemplazar `alert()` → toast

> ⚠️ Requiere que `useToast()` esté disponible (Fase 1).

Hacer `grep -r "alert(" src/` y reemplazar cada caso:
- Errores de validación (campo vacío, stock insuficiente, etc.) → toast con color de error o banner inline debajo del campo
- Confirmaciones de éxito → `showToast(mensaje)`
- Errores de red/Supabase → `showToast('Error: ' + e.message)`

#### 5c. Estandarizar z-index

Reemplazar todos los z-index hardcodeados por las constantes de `Z_INDEX`:
- `z-index: 9999` → `Z_INDEX.toast`
- `z-index: 1100` / `z-index: 900` → `Z_INDEX.confirmDialog`
- `z-index: 700`, `z-index: 800` → `Z_INDEX.modal`
- `z-index: 300` → `Z_INDEX.fab`
- `z-index: 100` → `Z_INDEX.header`

#### 5d. Estandarizar animaciones

Todos los bottom sheets / modales deben usar `animation: ANIMATION.slideUp`.
Hacer `grep -r "animation" src/` y corregir los que usen `0.3s` a `0.25s`.

#### 5e. Prop naming

Hacer `grep -r "onPress" src/` y reemplazar por `onClick`.

#### 5f. Color pickers

Todos los selectores de color (en `StoreProductModal`, `InventoryModal`, `CostingModal`/`ProductModal`) deben importar `COLORS_PALETTE` desde `constants.js` en lugar de tener el array hardcodeado local.

#### 5g. Performance con `useMemo`

**`src/pages/PriceListScreen.jsx`**
```js
const stats = useMemo(() => ({
  total:       items.length,
  utilidadTotal: items.reduce((s, i) => s + calcPrecio({ mode: 'boutique', ...i, ...config }).utilidad_tuya, 0),
  precioPromedio: items.length ? items.reduce((s, i) => s + calcPrecio({ mode: 'boutique', ...i, ...config }).precio_publico, 0) / items.length : 0,
}), [items, config])
```

**`src/components/ProductModal.jsx`** y **`src/components/OrderModal.jsx`**
```js
const breakdown = useMemo(() => calcPrecio({ mode: 'costing', ...form }), [
  form.materiales, form.horas, form.costo_hora, form.overhead_pct, form.margen_pct
])
```

### Archivos a MODIFICAR
```
src/lib/constants.js              ← Agregar Z_INDEX, COLORS_PALETTE, ANIMATION
src/components/PatternCard.jsx    ← onPress → onClick
src/components/ProductModal.jsx   ← useMemo para pricing breakdown
src/components/OrderModal.jsx     ← useMemo para pricing breakdown, Z_INDEX
src/components/PatternModal.jsx   ← ANIMATION.slideUp
src/components/InventoryModal.jsx ← ANIMATION.slideUp, COLORS_PALETTE, Z_INDEX
src/components/StoreProductModal.jsx ← ANIMATION.slideUp, COLORS_PALETTE, Z_INDEX
src/components/SaleModal.jsx      ← ANIMATION.slideUp, Z_INDEX
src/components/StoreEventModal.jsx ← ANIMATION.slideUp, Z_INDEX
src/components/PriceConfigModal.jsx ← ANIMATION.slideUp, Z_INDEX
src/pages/PatternsScreen.jsx      ← alert() → toast, Z_INDEX FAB
src/pages/InventoryScreen.jsx     ← alert() → toast, Z_INDEX FAB
src/pages/BusinessScreen.jsx      ← alert() → toast, Z_INDEX FAB
src/pages/PriceListScreen.jsx     ← alert() → toast, Z_INDEX FAB, useMemo stats
src/pages/StoreScreen.jsx         ← alert() → toast
```

### Reglas
- `useMemo` debe listar todas las dependencias correctamente (sin stale closures)
- Al reemplazar `alert()` por toast de error, el flujo debe detenerse igual (no continuar con la operación inválida)
- Cambios de animación no deben modificar el layout de los modales
- `onPress → onClick` es solo rename de prop, no cambio de comportamiento

### Criterio de fase completada
- [ ] `Z_INDEX`, `COLORS_PALETTE`, `ANIMATION` exportados desde `constants.js`
- [ ] `grep -r "alert(" src/` → cero resultados
- [ ] `grep -r "onPress" src/` → cero resultados
- [ ] `grep -r "9999\|1100\|1000\b" src/` → solo en `constants.js`
- [ ] Animaciones 0.25s en todos los modales
- [ ] Color pickers leen de `COLORS_PALETTE`
- [ ] `PriceListScreen` stats memoizados
- [ ] `ProductModal` y `OrderModal` pricing memoizados
- [ ] `npm run build` sin errores ni warnings de hooks (`react-hooks/exhaustive-deps`)

---

## Resumen de Archivos por Fase

| Fase | Crear | Modificar | Eliminar |
|------|-------|-----------|----------|
| **1** — Limpieza | `Toast.jsx`, `ConfirmDialog.jsx`, `FormFields.jsx` | `App.jsx` + 5 screens + 9 modales | 21 archivos `_v1/_v2` |
| **2** — Pricing | `src/lib/pricing.js` | `constants.js`, `useOrders.js`, `usePriceList.js`, `useStore.js`, `OrderModal.jsx`, `CostingModal.jsx`, `PriceConfigModal.jsx` | — |
| **3** — Fusión | `ProductModal.jsx` | `StoreScreen.jsx`, `PriceListScreen.jsx` | `CostingModal.jsx`, `PriceListItemModal.jsx` |
| **4** — Conexión | — | `DashboardScreen.jsx`, `DetailScreen.jsx`, `StoreScreen.jsx`, `App.jsx` | — |
| **5** — Pulido | — | `constants.js` + `PatternCard.jsx` + 5 screens + 7 modales | — |

## Flujo de Implementación

```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
 base     motor    fusión   conexión   pulido
```

**Cada fase:** implementar → `npm run build` → verificar criterios → commit → siguiente fase.