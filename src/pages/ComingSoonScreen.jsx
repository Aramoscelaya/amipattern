import React from 'react';
import { COLORS } from '../lib/constants';

const CONFIGS = {
  inventario: {
    emoji: '🧵',
    titulo: 'Inventario de Hilos',
    descripcion: 'Registra tus ovillos, controla cuántos gramos te quedan y recibe alertas cuando el stock esté bajo.',
    color: '#2DD4BF',
    features: [
      '📦 Alta de hilos con marca, grosor y tipo',
      '📊 Gramos disponibles vs. usados por patrón',
      '⚠️ Alerta automática de stock bajo',
      '💰 Costo por ovillo para calcular precios',
    ],
  },
  negocio: {
    emoji: '💼',
    titulo: 'Mi Negocio',
    descripcion: 'Calcula el costo real de cada pieza, establece tu precio de venta y lleva un registro de pedidos.',
    color: '#C9A96E',
    features: [
      '🧮 Costo de materiales automático',
      '💵 Precio de venta sugerido con tu margen',
      '⏱️ Tiempo invertido por pieza',
      '📋 Registro de pedidos y clientes',
    ],
  },
  organizar: {
    emoji: '🏷️',
    titulo: 'Organizar',
    descripcion: 'Etiquetas personalizadas, colecciones y filtros avanzados para encontrar cualquier patrón en segundos.',
    color: '#A78BFA',
    features: [
      '🏷️ Etiquetas personalizadas',
      '📁 Colecciones (regalos, navidad, pedidos…)',
      '🔍 Filtros avanzados por talla, aguja, hilo',
      '⭐ Patrones favoritos',
    ],
  },
};

export default function ComingSoonScreen({ section }) {
  const cfg = CONFIGS[section] || CONFIGS.inventario;

  return (
    <div style={{
      minHeight: '80vh', backgroundColor: COLORS.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', fontFamily: 'inherit',
    }}>
      {/* Ícono principal */}
      <div style={{
        width: 96, height: 96, borderRadius: 28,
        backgroundColor: cfg.color + '22',
        border: `2px solid ${cfg.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48, marginBottom: 24,
      }}>
        {cfg.emoji}
      </div>

      {/* Título */}
      <h2 style={{
        fontSize: 24, fontWeight: 900, color: COLORS.textPrimary,
        margin: '0 0 10px', textAlign: 'center',
      }}>
        {cfg.titulo}
      </h2>
      <p style={{
        fontSize: 14, color: COLORS.textSecondary, textAlign: 'center',
        maxWidth: 320, lineHeight: 1.6, margin: '0 0 32px',
      }}>
        {cfg.descripcion}
      </p>

      {/* Features list */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 18,
        padding: '20px 24px', width: '100%', maxWidth: 380,
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        marginBottom: 32,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: COLORS.textMuted,
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14,
        }}>
          Próximamente incluirá
        </div>
        {cfg.features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 0',
            borderBottom: i < cfg.features.length - 1 ? '1px solid #F3F4F6' : 'none',
            fontSize: 14, color: COLORS.textPrimary,
          }}>
            {f}
          </div>
        ))}
      </div>

      {/* Badge "En desarrollo" */}
      <div style={{
        backgroundColor: cfg.color + '20',
        border: `1.5px solid ${cfg.color}60`,
        borderRadius: 99, padding: '8px 20px',
        fontSize: 13, fontWeight: 800,
        color: COLORS.textSecondary,
      }}>
        🚧 En desarrollo
      </div>
    </div>
  );
}
