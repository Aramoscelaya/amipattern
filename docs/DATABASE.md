# Database Schema

**Platform:** Supabase (PostgreSQL)
**RLS:** Todas las tablas tienen RLS con `user_id = auth.uid()`

---

## `patterns`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `nombre` | text | Nombre del patrón |
| `emoji` | text | Emoji representativo |
| `dificultad` | text | fácil / media / difícil |
| `estado` | text | no_iniciado / en_progreso / completado / abandonado |
| `talla` | text | Tamaño del amigurumi |
| `aguja` | text | Número de aguja |
| `hilos` | text[] | Array de colores de hilo |
| `materiales` | text | Lista de materiales (texto libre) |
| `pasos` | jsonb | Array de objetos `{ id, texto, completado }` |
| `imagen_url` | text | URL de imagen en Supabase Storage |
| `color` | text | Color hexadecimal (tag visual) |
| `fecha` | date | Fecha de creación |

---

## `inventory`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `tipo` | text | "hilo" o "material" |
| `nombre` | text | Nombre del producto |
| `marca` | text | Marca |
| `color` | text | Nombre del color |
| `color_hex` | text | Código hexadecimal |
| `subtipo` | text | Categoría (ej: "ojos", "peluche", "aguja") |
| `grosor_mm` | numeric | Grosor del hilo en mm |
| `tipo_gancho` | text | Tipo de gancho recomendado |
| `unidad` | text | gr / pz / m / etc |
| `stock_inicial` | numeric | Stock inicial (se setea una vez al crear) |
| `entradas` | numeric | Reposiciones acumuladas |
| `stock_usado` | numeric | Consumido acumulado |
| `alerta_minimo` | numeric | Umbral para alerta de stock bajo |
| `costo_unitario` | numeric | Costo por unidad |
| `notas` | text | |

**Fórmula:** `disponible = stock_inicial + entradas - stock_usado`

---

## `orders`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `cliente_nombre` | text | |
| `cliente_telefono` | text | |
| `cliente_email` | text | |
| `patron_nombre` | text | Denormalizado |
| `patron_emoji` | text | Denormalizado |
| `materiales` | jsonb | Array de `{ id_inventario, nombre, cantidad, costo_unit }` |
| `horas` | numeric | Horas de trabajo estimadas |
| `costo_hora` | numeric | Costo por hora |
| `overhead_pct` | numeric | % de overhead |
| `margen_pct` | numeric | % de margen de ganancia |
| `precio_venta` | numeric | Precio final (auto o manual) |
| `precio_manual` | boolean | TRUE si el precio fue ingresado manualmente |
| `estado` | text | pendiente / en_proceso / completado / entregado / cancelado |
| `inventario_descontado` | boolean | Flag para evitar doble descuento |
| `fecha_pedido` | date | |
| `fecha_entrega` | date | |
| `anticipo` | numeric | Adelanto recibido |
| `notas` | text | |

---

## `store_products`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `nombre` | text | |
| `emoji` | text | |
| `categoria` | text | |
| `descripcion` | text | |
| `precio_venta` | numeric | |
| `stock_inicial` | numeric | |
| `stock_vendido` | numeric | |
| `patron_id` | uuid FK → patterns (nullable) | |
| `patron_nombre` | text | Denormalizado |
| `activo` | boolean | Para ocultar sin eliminar |
| `color_hex` | text | |

**Fórmula:** `stock_disponible = stock_inicial - stock_vendido`

---

## `store_events`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `nombre` | text | |
| `tipo` | text | bazaar / store / stationery / market / online / other |
| `fecha_inicio` | date | |
| `fecha_fin` | date | |
| `activo` | boolean | |
| `notas` | text | |

---

## `store_sales`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `product_id` | uuid FK → store_products | |
| `event_id` | uuid FK → store_events | |
| `product_nombre` | text | Denormalizado |
| `product_emoji` | text | Denormalizado |
| `event_nombre` | text | Denormalizado |
| `cantidad` | numeric | |
| `precio_unit` | numeric | |
| `total` | numeric | cantidad × precio_unit |
| `fecha` | date | |

---

## `store_costings`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `product_id` | uuid FK → store_products (nullable) | |
| `patron_id` | uuid FK → patterns (nullable) | |
| `nombre` | text | |
| `materiales` | jsonb | Array de `{ nombre, cantidad, costo_unit }` |
| `horas` | numeric | |
| `costo_hora` | numeric | |
| `costo_total` | numeric | Costo total calculado |
| `precio_sugerido` | numeric | Precio sugerido por la fórmula |
| `precio_final` | numeric | Precio final |
| `precio_manual` | boolean | TRUE si se ingresó manualmente |

---

## Storage

**Bucket:** `pattern-images` (público)
**Uso:** Almacenar imágenes de referencia de patrones
**Subida:** Client-side resize a 1200px, JPEG calidad 0.82
**URL:** Pública (accesible sin auth)

---

---

## `price_config` (NUEVA — Módulo Precios)

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | uuid PK | gen_random_uuid() | |
| `user_id` | uuid FK → auth.users | | |
| `pago_por_hora` | numeric | 60 | Pago por hora de trabajo |
| `margen_boutique` | numeric | 0.35 | Margen que aplica la boutique (35%) |
| `margen_propio` | numeric | 0.20 | Margen de ganancia propio mínimo (20%) |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |

**Nota:** 1 fila por usuario (constraint `unique(user_id)`).

---

## `price_list` (NUEVA — Módulo Precios)

| Columna | Tipo | Default | Descripción |
|---------|------|---------|-------------|
| `id` | uuid PK | gen_random_uuid() | |
| `user_id` | uuid FK → auth.users | | |
| `nombre` | text | | Nombre del producto |
| `emoji` | text | '🧸' | |
| `size` | text | | Tamaño (ej: "4 - 6 cm") |
| `costo_material` | numeric | 0 | Costo de materiales |
| `horas` | numeric | 0 | Horas de trabajo |
| `costo_empaque` | numeric | 0 | Costo de empaque |
| `nota` | text | | Nota / inventario (ej: "Lleva 1") |
| `patron_id` | bigint FK → patterns | null | Patrón vinculado (opcional) |
| `orden` | integer | 0 | Orden de visualización |
| `activo` | boolean | true | |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |

**Campos calculados** (no se almacenan, se calculan al mostrar):
- `costo_total = costo_material + (horas × pago_por_hora) + costo_empaque`
- `precio_boutique = costo_total × (1 + margen_propio)`
- `precio_publico = precio_boutique / (1 - margen_boutique)`
- `utilidad_tuya = precio_boutique - costo_total`

---

## Storage

**Bucket:** `pattern-images` (público)
**Uso:** Almacenar imágenes de referencia de patrones
**Subida:** Client-side resize a 1200px, JPEG calidad 0.82
**URL:** Pública (accesible sin auth)

---

## RLS Policy Pattern

```sql
CREATE POLICY "User can manage own records"
ON {table}
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

Todas las tablas siguen este mismo patrón.
