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
│   ├── App.jsx              # Root: auth, routing (view state), modals
│   ├── context/
│   │   └── AuthContext.jsx  # Auth provider (Google OAuth)
│   ├── lib/
│   │   ├── supabase.js      # Supabase client singleton
│   │   └── constants.js     # Colors, difficulties, statuses, palette
│   ├── hooks/
│   │   ├── usePatterns.js   # CRUD patrones + image upload
│   │   ├── useInventory.js  # CRUD inventario + stock tracking
│   │   ├── useOrders.js     # CRUD pedidos + pricing + descuento inventario
│   │   ├── useStore.js      # CRUD productos/eventos/ventas/costings
│   │   └── use*_v1.js       # Versiones anteriores archivadas
│   ├── pages/
│   │   ├── LoginScreen.jsx      # Pantalla de login Google
│   │   ├── GridScreen.jsx       # Hub principal con tabs
│   │   ├── DetailScreen.jsx     # Detalle de patrón + contador
│   │   ├── InventoryScreen.jsx  # Gestión de inventario
│   │   ├── BusinessScreen.jsx   # Gestión de pedidos
│   │   ├── StoreScreen.jsx      # Tienda/ventas/eventos
│   │   └── ComingSoonScreen.jsx # Placeholder
│   └── components/
│       ├── BottomNav.jsx        # Barra inferior (4 tabs)
│       ├── Badge.jsx            # Chip de estado/dificultad
│       ├── ProgressBar.jsx      # Barra de progreso
│       ├── PatternCard.jsx      # Card de patrón en grid
│       ├── PatternModal.jsx     # Modal crear/editar patrón
│       ├── InventoryCard.jsx    # Card de item + botones usar/reponer
│       ├── InventoryModal.jsx   # Modal crear/editar item
│       ├── OrderCard.jsx        # Card de pedido + avanzar estado
│       ├── OrderModal.jsx       # Modal pedido con pricing
│       ├── StoreProductModal.jsx
│       ├── SaleModal.jsx
│       ├── StoreEventModal.jsx
│       ├── EventsPanel.jsx      # Panel completo de eventos
│       └── CostingModal.jsx     # Calculadora de costos
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
      │   └── Icon grid (5 módulos)
      │
      ├── view === 'patterns'   → <PatternsScreen />
      │   ├── <PatternCard /> grid
      │   ├── Search / Filter
      │   └── FAB (+)
      │
      ├── view === 'detail'     → <DetailScreen />
      │   ├── <Badge />
      │   ├── <ProgressBar />
      │   └── (stitch counter)
      │
      ├── view === 'inventory'  → <InventoryScreen />
      │   ├── <InventoryCard />
      │   └── <InventoryModal />
      │
      ├── view === 'business'   → <BusinessScreen />
      │   ├── <OrderCard />
      │   └── <OrderModal />
      │
      ├── view === 'prices'     → <PriceListScreen />      ← NUEVO
      │   ├── <PriceListItemModal />
      │   └── <PriceConfigModal />
      │
      └── view === 'store'      → <StoreScreen />
            ├── <StoreProductModal />
            ├── <SaleModal />
            ├── <StoreEventModal />
            ├── <EventsPanel />
            └── <CostingModal />
  </AuthProvider>
</App>
```

## Navigation Pattern

No hay router. La navegación se maneja con el estado `view` en `App.jsx`:

| view | Componente | Descripción |
|------|-----------|-------------|
| `'dashboard'` | `<DashboardScreen />` | Pantalla de inicio con grid de íconos |
| `'patterns'` | `<PatternsScreen />` | Grid de patrones con búsqueda/filtros |
| `'detail'` | `<DetailScreen />` | Detalle de patrón + contador de puntos |
| `'inventory'` | `<InventoryScreen />` | Gestión de inventario |
| `'business'` | `<BusinessScreen />` | Gestión de pedidos |
| `'prices'` | `<PriceListScreen />` | Lista de precios boutique |
| `'store'` | `<StoreScreen />` | Tienda, ventas y eventos |

**Navegación:**
- Dashboard → selecciona módulo → cambia `view`
- Cada módulo tiene botón `←` que regresa a `'dashboard'`
- No hay BottomNav, no hay tabs internos

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
- **Sin router**: Mantiene simplicidad, la app tiene solo 2 vistas principales
- **Archivos `_v1`**: Se conservan como referencia/historial, no se usan en producción
