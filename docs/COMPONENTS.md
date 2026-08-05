# Components & Hooks Reference

## Context

### `AuthContext.jsx`
- **Props que expone:** `user`, `loading`, `signInWithGoogle()`, `signOut()`
- **Lógica:** `getSession()` al montar, `onAuthStateChange()` listener
- **Provider usado en:** `App.jsx`

---

## Pages

### `DashboardScreen.jsx` (NUEVO)
- **Props:** `user`, `onSelect(moduleId)`, `onSignOut`, `patterns`, `items`, `orders`, `products`
- **Renderiza:** Grid 2×2 con íconos grandes para cada módulo + stats rápidas + alertas activas
- **Módulos:** Patrones 🧶, Inventario & Pedidos 📦, Comercial 💼
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

### `DetailScreen.jsx`
- **Inputs:** `pattern`, `onToggleStep`, `onDelete`, `onBack`, `onResetPattern`, `onGoToInventory`
- **Estados locales:** `confirmDelete`, `confirmReset`, `stitchCount`, `prodModal`
- **Renderiza:** Hero image, badges, info grid, steps con toggle, notas, **stitch counter flotante**
- **Acciones:** botones ✏️ Editar, 🔄 Repetir (reset), 🗑 Eliminar, 📦 Crear (ProductModal → useCommerce.saveCosting)

### `InventarioPedidosScreen.jsx` (NUEVO — fusión Fase 8)
- **Props:** `user`, `inventory` (hook completo), `orders` (hook completo), `onBack`
- **Tabs internos:** Materiales 🧵 / Pedidos 📦 (tab bar estilo ComercialScreen)
- **Materiales:** idéntico al antiguo `InventoryScreen` (stats, filtros, alertas, FAB)
- **Pedidos:** idéntico al antiguo `BusinessScreen` + `OrderCard` con WhatsApp 📱/💬

### `ComercialScreen.jsx` (NUEVO — Fase 7)
- **Props:** `user`, `patterns`, `onBack`
- **Hook:** `useCommerce(user.id)` (catálogo, canales, ventas, config, costings, offline)
- **Tabs internos:** Vender 🛍️ / Catálogo 📚 / Costear 🧮
- **Header:** ← volver + título "Comercial" + indicador offline (con contador pendientes)

---

## Components

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

### `OrderCard.jsx` (con WhatsApp — Fase 2)
- **Props:** `order`, `onEstado`, `onEdit`, `onDelete`
- **Renderiza:** Emoji, nombre patrón, cliente, status badge, urgencia, precio/saldo, fecha entrega
- **Acción:** Botón "Avanzar estado"
- **WhatsApp:** botones 📱 Estado (mensaje de estado) y 💬 Cotización (modal pre-llenado); deshabilitados si el cliente no tiene teléfono

### `OrderModal.jsx`
- **Props:** `order`, `onSave`, `onClose`, `inventoryItems`
- **Campos:** emoji picker, nombre patrón, estado, fechas, materiales del inventario (búsqueda+selección+cantidad), horas, costo_hora, overhead%, margen%
- **Pricing en vivo:** Muestra desglose en tiempo real (materiales, mano de obra, subtotal, overhead, ganancia, sugerido)
- **Opciones:** Precio final (auto o manual), anticipo, notas

### `ProductModal.jsx` (NUEVO — sustituye CostingModal + PriceListItemModal)
- **Props:** `visible`, `initial`, `patterns`, `priceConfig`, `onSave`, `onClose`
- **Secciones:** Datos del producto + materiales dinámicos, desglose costing (overhead/margen), precio final (auto/manual), toggle "Crear en Tienda" (stock + color + descripción), toggle "Agregar a Lista de Precios" (tamaño, costo empaque, nota, precios boutique en vivo)

### `StoreProductModal.jsx`
- **Props:** `visible`, `initial`, `config`, `onSave`, `onClose`
- **Campos:** emoji, nombre, categoría, costo_base, precio_boutique (auto vía calcPreciosCanal o manual), estado_catalogo, tiempo_elaboracion, precio, stock, color, descripción, patrón vinculado

### `StoreEventModal.jsx`
- **Props:** `event`, `onSave`, `onClose`
- **Campos:** nombre, tipo (bazar/tienda/papeleria/mercado/online/otro), fechas inicio/fin, notas

### `CarritoPanel.jsx` (NUEVO — Fase 4)
- **Props:** `visible`, `items`, `canal`, `onChangeQty`, `onRemove`, `onCobrar`, `onClose`
- **Vista:** Bottom sheet con items del carrito, cantidades editables, método de pago, total

### `CanalSelectorModal.jsx` (NUEVO — Fase 4)
- **Props:** `visible`, `channels`, `activeChannel`, `onSelect`, `onNew`, `onClose`
- **Renderiza:** Lista de canales/eventos con emoji de tipo (TIPOS_EVENTO), resaltando el activo

### `CatalogoProductCard.jsx` (NUEVO — Fase 5)
- **Props:** `product`, `config`, `onEdit`, `onDelete`
- **Renderiza:** Emoji, nombre, precio público/boutique, utilidades, stock disponible, estado del catálogo

### `PriceConfigModal.jsx` (NUEVO — Fase 5)
- **Props:** `visible`, `config`, `onSave`, `onClose`
- **Campos:** tarifa_hora, margen_propio, margen_boutique, redondeo (0/5/10)
- **Preview en vivo:** cálculo con costo ejemplo ($100) vía calcPreciosCanal

### `ConfirmDialog.jsx`
- **Props:** `visible`, `title`, `message`, `onConfirm`, `onCancel`
- **Renderiza:** Diálogo de confirmación con botones Cancelar/Confirmar

### `FormFields.jsx`
- **Exports:** `StyledInput`, `StyledLabel`, `StyledTextarea`, `SelectRow`
- **Uso:** Campos de formulario consistentes en todos los modales

### `Toast.jsx`
- **Exports:** `ToastProvider`, `useToast()`
- **Uso:** `showToast(mensaje)` para feedback de acciones

### `WhatsAppCotizacionModal.jsx` (NUEVO — Fases 2/6)
- **Props:** `visible`, `initial` ({nombre, emoji, precio, tiempoEntrega}), `telefono`, `onClose`
- **Campos:** nombre, emoji, precio, tiempo de entrega, mensaje extra
- **Teléfono:** si llega vacío, muestra campo editable requerido (10 dígitos); si viene de un pedido, se muestra en readonly

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

### `useCommerce.js` (NUEVO — reemplaza useStore + useStoreCostings)
```js
const {
  // datos
  products, channels, sales, config, costings,
  loading, error, isOnline, pendingCount,
  // catálogo
  saveProduct, deleteProduct, addStock, statsGlobal,
  // canales
  saveChannel, deleteChannel, setActiveChannel, activeChannel,
  // ventas (offline)
  registerSale, deleteSale, channelStats,
  // pricing
  saveConfig, saveCosting,
  // más
  reload, syncPending,
} = useCommerce(userId)
```
- `registerSale({ product, channel, items, fecha, metodoPago })` → inserta varias ventas + descuenta stock; **offline-first** (cola local + sync)
- `saveCosting(form, { createProduct, updateProduct })` → guarda costeo y crea/actualiza producto
- `activeChannel` se determina por `es_activo_ahora`
