# Architecture

## Folder Structure

```
amipattern-web/
├── public/
│   ├── index.html           # HTML entry + PWA meta tags
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service Worker
│   └── *.png / *.ico        # Favicons & icons
├── src/
│   ├── index.js             # Entry point → <App />
│   ├── App.jsx              # Root: auth, routing (view state), modals, instancia hooks
│   ├── context/
│   │   └── AuthContext.jsx  # Auth provider (Google OAuth)
│   ├── lib/
│   │   ├── supabase.js      # Supabase client singleton
│   │   ├── constants.js     # Colores, dificultades, estados, CATEGORIAS, TIPOS_EVENTO
│   │   ├── pricing.js       # Cálculo de precios (calcPrecio, calcPreciosCanal)
│   │   ├── whatsapp.js      # Links y mensajes WhatsApp (cotización, estado)
│   │   └── offlineQueue.js  # Cola offline para ventas/stock
│   ├── hooks/
│   │   ├── usePatterns.js   # CRUD patrones + image upload
│   │   ├── useInventory.js  # CRUD inventario + stock tracking + stock bajo
│   │   ├── useOrders.js     # CRUD pedidos + pricing + descuento inventario
│   │   ├── usePriceList.js  # Lista de precios + config (legacy → reemplazado por useCommerce)
│   │   └── useCommerce.js   # Módulo Comercial: catálogo, canales, ventas, costings, offline
│   ├── pages/
│   │   ├── LoginScreen.jsx      # Pantalla de login Google
│   │   ├── DashboardScreen.jsx  # Hub: grid de 3 módulos (Patrones, Inv&Pedidos, Comercial)
│   │   ├── PatternsScreen.jsx   # Grid de patrones + búsqueda/filtros + FAB
│   │   ├── DetailScreen.jsx     # Detalle de patrón + contador + crear producto
│   │   ├── InventarioPedidosScreen.jsx  # Fusión: tabs Materiales + Pedidos
│   │   ├── ComercialScreen.jsx  # Módulo Comercial: tabs Vender + Catálogo + Costear
│   │   └── tabs/
│   │       ├── VenderTab.jsx    # Vender con carrito + canales + offline
│   │       ├── CatalogoTab.jsx  # Catálogo con configuración de precios
│   │       └── CostearTab.jsx   # Calculadora de costos + WhatsApp
│   └── components/
│       ├── Badge.jsx            # Chip de estado/dificultad
│       ├── ProgressBar.jsx      # Barra de progreso
│       ├── PatternCard.jsx      # Card de patrón en grid
│       ├── PatternModal.jsx     # Modal crear/editar patrón
│       ├── InventoryCard.jsx    # Card de item + botones usar/reponer
│       ├── InventoryModal.jsx   # Modal crear/editar item
│       ├── OrderCard.jsx        # Card de pedido + avanzar estado + WhatsApp
│       ├── OrderModal.jsx       # Modal pedido con pricing
│       ├── ProductModal.jsx     # Modal de costeo/producto (precios boutique)
│       ├── StoreProductModal.jsx# Modal producto catálogo
│       ├── StoreEventModal.jsx  # Modal canal/evento de venta
│       ├── CarritoPanel.jsx     # Panel de carrito en Vender
│       ├── CanalSelectorModal.jsx # Selector de canal/evento
│       ├── CatalogoProductCard.jsx # Card de producto del catálogo
│       ├── PriceConfigModal.jsx # Modal configuración de precios
│       ├── ConfirmDialog.jsx    # Diálogo de confirmación
│       ├── FormFields.jsx       # Inputs/labels reutilizables
│       ├── Toast.jsx            # Sistema de toasts (ToastProvider + useToast)
│       └── WhatsAppCotizacionModal.jsx # Modal envío de cotización por WhatsApp
```

## Component Tree (App.jsx)

```
<App>
  <AuthProvider>
    ├── (no auth) → <LoginScreen />
    └── (auth) → <AppInner>
      ├── <PatternModal />          (if modal)
      │
      ├── view === 'dashboard'  → <DashboardScreen />
      │   └── Icon grid (3 módulos: Patrones · Inventario & Pedidos · Comercial)
      │
      ├── view === 'patterns'   → <PatternsScreen />
      │   ├── <PatternCard /> grid
      │   ├── Search / Filter
      │   └── FAB (+)
      │
      ├── view === 'detail'     → <DetailScreen />
      │   ├── <Badge />
      │   └── (stitch counter) + ProductModal para costeo
      │
      ├── view === 'inventario_pedidos' → <InventarioPedidosScreen />
      │   ├── tab 'materiales' → <InventoryCard /> + <InventoryModal />
      │   └── tab 'pedidos'    → <OrderCard /> + <OrderModal />   (con WhatsApp)
      │
      └── view === 'comercial' → <ComercialScreen />
            └── (useCommerce) → tab bar interna
                  ├── tab 'vender'   → <VenderTab />      (carrito, canales, offline)
                  ├── tab 'catalogo' → <CatalogoTab />    (catálogo + PriceConfig)
                  └── tab 'costear'  → <CostearTab />     (+ WhatsAppCotizacionModal)
  </AuthProvider>
</App>
```

> **App.jsx** instancia los hooks raíz (`usePatterns`, `useInventory`, `useOrders`, `useCommerce`) y los pasa como props. `ComercialScreen` e `InventarioPedidosScreen` reciben los objetos de hook completos.

## Navigation Pattern

No hay router. La navegación se maneja con el estado `view` en `App.jsx`:

| view | Componente | Descripción |
|------|-----------|-------------|
| `'dashboard'` | `<DashboardScreen />` | Inicio con grid de 3 módulos |
| `'patterns'` | `<PatternsScreen />` | Grid de patrones con búsqueda/filtros |
| `'detail'` | `<DetailScreen />` | Detalle de patrón + contador de puntos |
| `'inventario_pedidos'` | `<InventarioPedidosScreen />` | Materiales + Pedidos (2 tabs) |
| `'comercial'` | `<ComercialScreen />` | Vender + Catálogo + Costear (3 tabs) |

**Navegación:**
- Dashboard → selecciona módulo → cambia `view`
- Cada módulo tiene botón `←` que regresa a `'dashboard'`
- `InventarioPedidosScreen` y `ComercialScreen` usan una **tab bar interna** (no BottomNav global)
- No hay router: el estado `view` en `App.jsx` controla la navegación

## Data Flow

```
User Action → Page Handler → Hook Method → Supabase Query → State Update → Re-render
```

- Cada hook mantiene su propio `data`, `loading`, `error`
- Después de mutate (upsert/delete), el hook actualiza su estado local inmediatamente
- Las páginas reciben los handlers desde App.jsx como props
- App.jsx es el único que instancia los hooks y pasa funciones hacia abajo

## Auth Flow

```
App mount → AuthContext.getSession()
  ├── No session → LoginScreen
  │   └── signInWithGoogle() → Supabase OAuth → redirect
  └── Session → AppInner
      └── user.id → hooks → queries with RLS
```

## Key Design Decisions

- **Denormalized data**: `patron_nombre`, `product_nombre`, `event_nombre` se copian en tablas relacionadas para preservar datos aunque se elimine el registro original
- **Inline styles**: Sin archivos CSS, todo en objetos JS (consistencia via constants.js)
- **Sin router**: Mantiene simplicidad, la app usa `view` state + tab bars internas
- **Hooks por módulo**: `useCommerce` (Módulo 3) centraliza catálogo/canales/ventas/costings con cola offline; `useInventory`/`useOrders` se mantienen para Módulo 2
- **Offline first en ventas**: Ventas y reposiciones de stock se guardan en cola local y sincronizan al reconectar
