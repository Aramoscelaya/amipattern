# Components & Hooks Reference

## Context

### `AuthContext.jsx`
- **Props que expone:** `user`, `loading`, `signInWithGoogle()`, `signOut()`
- **Lógica:** `getSession()` al montar, `onAuthStateChange()` listener
- **Provider usado en:** `App.jsx`

---

## Pages

### `DashboardScreen.jsx` (NUEVO)
- **Props:** `user`, `onSelect(moduleId)`, `onSignOut`
- **Renderiza:** Grid 2×2 (y 1 abajo) con íconos grandes para cada módulo
- **Módulos:** Patrones 🧶, Inventario 🧵, Negocio 💼, Precios 💰, Tienda 🏪
- **Header:** Logo + saludo + avatar con menú desplegable (sign out)
- **Footer:** "Creado por Minué Crochet"

### `LoginScreen.jsx`
- **Inputs:** Auth context (signInWithGoogle)
- **Estados:** `loading` (mientras auth)
- **Salida:** Botón de Google OAuth con logo SVG

### `PatternsScreen.jsx` (refactor de GridScreen)
- **Inputs:** `patterns`, `onSelect`, `onNew`, `onBack`, `loading`, `error`, `user`, `onSignOut`
- **Estados:** `searchTerm`, `filterStatus`
- **Renderiza:** Stats cards, search bar, filter chips, PatternCards grid, FAB
- **Header sticky:** Back button + logo + avatar con menú de sign out
- **Nota:** Ya no tiene tabs ni BottomNav — cada módulo es vista independiente

### `DetailScreen.jsx`
- **Inputs:** `pattern`, `onToggleStep`, `onDelete`, `onBack`
- **Estados locales:** `confirmDelete`, `stitchCount`
- **Renderiza:** Hero image, badges, info grid, steps con toggle, notas, **stitch counter flotante**
- **Stitch counter:** +1 / -1 / reset, posición fixed

### `InventoryScreen.jsx`
- **Inputs:** `items`, handlers de CRUD
- **Estados:** `searchTerm`, `filterType` (all/threads/materials/alerts), `confirmDelete`
- **Funcionalidad:** Notificaciones browser para stock bajo, FAB button

### `BusinessScreen.jsx`
- **Inputs:** `orders`, handlers CRUD
- **Estados:** `searchTerm`, `filterStatus`, `confirmDelete`
- **Funcionalidad:** Banner de entregas urgentes, notificaciones browser, stats cards

### `StoreScreen.jsx`
- **Inputs:** `products`, `events`, handlers
- **Estados:** `searchTerm`, `filterStock`, `filterCategory`, 6 modales booleanos
- **Funcionalidad:** StockBar inline, quick actions, stats cards

---

## Components

### `BottomNav.jsx`
- **Props:** `activeTab`, `onChange`
- **Tabs:** 0=Patrones, 1=Inventario, 2=Negocio, 3=Tienda
- **Estilo:** Fixed bottom, safe-area padding, indicador activo tipo pill

### `Badge.jsx`
- **Props:** `text`, `type` (status/difficulty)
- **Renderiza:** Chip coloreado con texto (colores desde constants.js)

### `ProgressBar.jsx`
- **Props:** `completed`, `total`
- **Renderiza:** Barra de progreso (verde si 100%, naranja si no)

### `PatternCard.jsx`
- **Props:** `pattern`, `onClick`
- **Renderiza:** Imagen/placeholder, nombre (2-line clamp), status badge, progress bar
- **Animación:** Hover scale

### `PatternModal.jsx`
- **Props:** `pattern` (null si create), `onSave`, `onClose`
- **Form fields:** emoji picker, nombre, color picker, dificultad, estado, talla, aguja, fecha, hilos (add/remove), materiales, pasos (add/reorder/delete), notas, image upload con preview
- **Estilo:** Bottom sheet fullscreen

### `InventoryCard.jsx`
- **Props:** `item`, `onUpdateUsed`, `onAddEntrada`, `onEdit`, `onDelete`
- **Renderiza:** Emoji, nombre, marca/color, stock bar, disponible, costo, badges de alerta
- **Acciones:** Botones "Usar" y "Reponer" con expansión a input de cantidad + confirmación

### `InventoryModal.jsx`
- **Props:** `item`, `onSave`, `onClose`
- **Tabs:** "Hilo" / "Material"
- **Campos dinámicos:** color picker, nombre, subtipo, marca, stock (inicial/entradas/usado), alerta mínima, costo unitario, notas
- **Muestra:** Disponible calculado al editar

### `OrderCard.jsx`
- **Props:** `order`, `onAdvanceStatus`, `onEdit`, `onDelete`
- **Renderiza:** Emoji, nombre patrón, cliente, status badge, urgencia, precio/saldo, fecha entrega, link WhatsApp
- **Acción:** Botón "Avanzar estado"

### `OrderModal.jsx`
- **Props:** `order`, `onSave`, `onClose`, `inventory`
- **Campos:** emoji picker, nombre patrón, estado, fechas, materiales del inventario (búsqueda+selección+cantidad), horas, costo_hora, overhead%, margen%
- **Pricing en vivo:** Muestra desglose en tiempo real (materiales, mano de obra, subtotal, overhead, ganancia, sugerido)
- **Opciones:** Precio final (auto o manual), anticipo, notas

### `StoreProductModal.jsx`
- **Props:** `product`, `onSave`, `onClose`
- **Campos:** emoji, nombre, categoría, precio, stock, color, descripción, patrón vinculado (opcional)

### `SaleModal.jsx`
- **Props:** `product`, `events`, `onSave`, `onClose`
- **Campos:** cantidad, precio unitario (total auto), evento, fecha, notas
- **Validación:** No vender más que stock disponible

### `StoreEventModal.jsx`
- **Props:** `event`, `onSave`, `onClose`
- **Campos:** nombre, tipo (bazaar/store/stationery/market/online/other), fechas inicio/fin, notas

### `EventsPanel.jsx`
- **Props:** `events`, `sales`, `products`, handlers
- **Vista:** Pantalla completa con lista de eventos expandibles
- **Cada evento:** Nombre, tipo, fechas, ingresos totales, piezas vendidas
- **Expandido:** Ventas individuales del evento con totales

### `PriceListScreen.jsx` (NUEVO)
- **Inputs:** `user`, `patterns`, `onBack`
- **Hooks:** `usePriceList`, `usePriceConfig`
- **Estados:** `search`, `showConfig`, `itemModal`, `editingItem`, `confirmId`, `toast`
- **Renderiza:** Header con back + ⚙️, barra de config (pago/hora, márgenes), stats (total, utilidad, precio prom.), search, grid de PriceCards, FAB
- **Modales:** `PriceConfigModal`, `PriceListItemModal`
- **Cada card** muestra: emoji, nombre, tamaño, 4 precios inline (costo, utilidad, boutique, público)

### `PriceConfigModal.jsx` (NUEVO)
- **Props:** `visible`, `config`, `onSave`, `onClose`
- **Campos:** pago por hora ($), margen boutique (%), margen propio mínimo (%)
- **Preview en vivo:** Muestra cálculo con valores ejemplo (ami. mediano)
- **Diseño:** Bottom sheet

### `PriceListItemModal.jsx` (NUEVO)
- **Props:** `visible`, `item`, `config`, `patterns`, `onSave`, `onClose`
- **Campos:** emoji picker, nombre, tamaño, costo material, horas, costo empaque, patrón vinculado (opcional), nota
- **Desglose en vivo:** costo total, precio boutique, precio público, utilidad tuya
- **Diseño:** Bottom sheet

### `CostingModal.jsx`
- **Props:** `patterns`, `onSave`, `onClose`
- **Campos:** Materiales dinámicos (nombre, cantidad, costo_unit), horas labor, costo_hora
- **Desglose en vivo:** Materiales, mano de obra, total, overhead%, ganancia%, sugerido
- **Actions:** Precio final (auto/manual), stock, color, vincular patrón
- **Resultado:** Crea registro de costing + producto de tienda

---

### `usePriceList.js` (NUEVO)

```js
// Hook para lista de precios (CRUD items)
const { items, loading, error, saveItem, deleteItem, reload } = usePriceList(userId)

// Hook para configuración global de pricing
const { config, loading, saveConfig, reload } = usePriceConfig(userId)

// Función de cálculo pura (sin hook)
const calc = calcPrecioBoutique({ costo_material, horas, costo_empaque, pago_por_hora, margen_propio, margen_boutique })
// Returns: { costo_total, precio_boutique, precio_publico, utilidad_tuya }
```

## Hooks (Data Layer)

### `usePatterns.js`
```js
const { patterns, loading, error,
  savePattern, deletePattern, toggleStep, uploadImage, reload } = usePatterns(userId)
```

### `useInventory.js`
```js
const { items, loading, error,
  stockBajoItems, valorTotal,
  saveItem, deleteItem, updateUsed, addEntrada, reload } = useInventory(userId)
```

### `useOrders.js`
```js
const { orders, loading, error,
  proximosVencer, stats,
  saveOrder, deleteOrder, updateEstado, reload } = useOrders(userId, items)
```

### `useStore.js`
```js
// Store
const { products, events, sales, statsGlobal,
  saveProduct, deleteProduct, saveEvent, deleteEvent,
  registerSale, deleteSale, addStock, eventStats } = useStore(userId)

// Costings
const { costings, saveCosting, saveCostingAndProduct } = useStoreCostings(userId)
```
