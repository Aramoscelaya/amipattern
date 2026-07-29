# AmiPattern — Project Overview

## What is it?

**AmiPattern** es una **Progressive Web App (PWA)** para gestionar un negocio de **amigurumi (crochet)**. Unifica en una sola plataforma el ciclo completo: patrones, inventario, pedidos y tienda/punto de venta.

## Tech Stack

| Tecnología | Uso |
|------------|-----|
| **React 18** | UI Framework |
| **Supabase (PostgreSQL)** | Base de datos, autenticación, storage |
| **Google OAuth** | Login único |
| **Create React App** | Build toolchain |
| **Vercel** | Deploy |
| **PWA (Service Worker + Manifest)** | Instalable offline |

## Core Modules

1. **Patrones** — Catálogo de patrones con pasos, imágenes, materiales
2. **Inventario** — Control de hilos y materiales con alertas de stock bajo
3. **Negocio/Pedidos** — Gestión de pedidos con pricing automático
4. **Tienda** — Productos, eventos, ventas y costing tool

## Convenciones del Proyecto

- **Sin router** — Navegación por estado (`view`, `activeTab`)
- **Sin CSS framework** — Todos los estilos son inline (`style={{}}`)
- **Sin icons library** — Emojis como íconos
- **Sin form library** — Estado manual en componentes
- **Custom Hooks** — Toda la lógica de datos vive en hooks
- **Archivos `_v1`, `_v2`** — Versiones anteriores archivadas

## Dependencias Clave

```json
{
  "react": "^18.3.1",
  "@supabase/supabase-js": "^2.45.0",
  "react-scripts": "5.0.1"
}
```

## URLs Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Deploy:** Vercel (ver `vercel.json`)
- **Variables de entorno:** `.env.local` (REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY)
