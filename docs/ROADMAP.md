# Roadmap & Future Work

> Este archivo sirve para trackear el progreso y planificar nuevas features.
> Mantener actualizado con fechas y prioridades.

---

## ✅ Completado

- [x] Auth con Google OAuth (Supabase)
- [x] CRUD de patrones con pasos toggle
- [x] Upload de imágenes a Supabase Storage
- [x] CRUD de inventario (hilos + materiales)
- [x] Alertas de stock bajo con notificaciones browser
- [x] CRUD de pedidos con pricing automático
- [x] Descuento automático de inventario al procesar pedidos
- [x] CRUD de tienda (productos)
- [x] Registro de ventas con descuento de stock
- [x] Gestión de eventos/venues
- [x] Costing tool (cálculo de costos + creación de producto)
- [x] PWA: manifest, service worker, offline
- [x] Navegación tipo bottom tabs
- [x] Contador de puntos flotante en detail screen

---

## 🔜 Siguientes (Prioridad Alta)

### 1. Multi-tienda / Multi-user
- [ ] Diferentes perfiles de negocio (ej: "Tienda física" vs "Online")
- [ ] Roles: admin, colaborador

### 2. Reportes y Analytics
- [ ] Dashboard con gráficos de ventas mensuales
- [ ] Reporte de productos más vendidos
- [ ] Ganancias vs costos por período
- [ ] Exportar a CSV/PDF

### 3. Mejoras en UX
- [ ] Dark mode
- [ ] Pull-to-refresh en todas las pantallas
- [ ] Skeleton loaders mientras carga data
- [ ] Drag & drop para reordenar pasos (actualmente botones up/down)
- [ ] Búsqueda con debounce y más filtros

### 4. Offline First
- [ ] Cache de datos con Service Worker
- [ ] Sincronización cuando se recupera conexión
- [ ] IndexedDB para operaciones offline

---

## 📋 Media Prioridad

### 5. Notificaciones
- [ ] Notificaciones push (Firebase Cloud Messaging)
- [ ] Recordatorios para fechas de entrega
- [ ] Alerta de stock bajo en background

### 6. Compartir y Redes
- [ ] Compartir patrón como imagen/card
- [ ] Vista pública de portafolio (sin auth)
- [ ] Link sharing para clientes

### 7. Mejoras en Tienda
- [ ] Código de barras / QR para productos
- [ ] Múltiples imágenes por producto
- [ ] Variantes (talla, color)
- [ ] Integración con pasarela de pago

### 8. Mejoras en Pedidos
- [ ] Plantillas de pedidos recurrentes
- [ ] Historial de cambios de estado con timestamps
- [ ] Recordatorios automáticos a clientes (vía WhatsApp API)

---

## 💡 Ideas / Baja Prioridad

### 9. Tools Creativas
- [ ] Generador de combinaciones de colores
- [ ] Calculadora de cantidad de hilo por patrón
- [ ] Conversor de tallas (patrones escalables)
- [ ] Temporizador de tejido con registro de sesiones

### 10. Social / Comunidad
- [ ] Feed de patrones públicos
- [ ] Likes y guardados
- [ ] Comentarios y reseñas

### 11. Internacionalización (i18n)
- [ ] Soporte multi-idioma (EN, PT, FR)
- [ ] Moneda configurable

---

## ✅ Completado (nuevo)

- [x] Módulo Lista de Precios Boutique (price_list + price_config)
- [x] Dashboard con grid de íconos (reemplaza BottomNav + tabs)
- [x] Navegación por vistas independientes (cada módulo es un `view`)
- [x] CostingModal: márgenes editables (overhead_pct, margen_pct)
- [x] Defaults centralizados de pricing en `constants.js`

## ✅ Módulo 3 — Comercial (Fases 0–7)

- [x] Fase 1: Reset de patrón ("Repetir")
- [x] Fase 2: WhatsApp desde pedidos (Estado 📱 + Cotización 💬)
- [x] Fase 3: Hook `useCommerce` (catálogo, canales, ventas, config, costings, offline)
- [x] Fase 4: `VenderTab` (carrito, selector de canal)
- [x] Fase 5: `CatalogoTab` + `PriceConfigModal` (márgenes, redondeo, preview)
- [x] Fase 6: `CostearTab` + teléfono manual en WhatsAppCotizacionModal
- [x] Fase 7: `ComercialScreen` ensambla los 3 tabs; retirados `StoreScreen`, `PriceListScreen`, `useStore`

## ✅ Módulo 2 — Inventario & Pedidos (Fase 8)

- [x] Fase 8: `InventarioPedidosScreen` fusiona Inventario + Pedidos en 2 tabs; retirados `InventoryScreen`, `BusinessScreen`

## ✅ Módulo 1 — Limpieza (Fase 9)

- [x] Fase 9: Eliminación de archivos huérfanos (`SaleModal`, `EventsPanel`), verificación de builds y docs actualizadas

## 🛠 Deuda Técnica

- [ ] Migrar de CRA a Vite (más rápido, menor bundle)
- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] Typescript migration
- [ ] CSS modules o Tailwind en lugar de inline styles
- [ ] Component library con Storybook
- [ ] CI/CD pipeline con tests automáticos
- [ ] Code splitting y lazy loading de páginas
- [ ] Manejo de errores más robusto (Error Boundaries)
- [ ] Optimización de imágenes (webp, lazy loading)

---

## 📝 Notas

- Fecha de inicio del proyecto: ~2024
- Última revisión de este doc: Agosto 2026
- Stack: React 18 + Supabase + Vercel
- Sin framework CSS, sin router, sin state manager externo
