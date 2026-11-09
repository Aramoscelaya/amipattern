export const YARN_COLORS = [
  '#F4A261','#E76F51','#2A9D8F','#264653',
  '#E9C46A','#A8DADC','#FAD2E1','#B5EAD7',
  '#FFDAC1','#C7CEEA',
];

export const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado'];
export const ESTADOS = ['En progreso', 'Completado'];

export const COLORS = {
  bg:            '#14141C',
  card:          '#1E1E2B',
  header:        '#4A3628',
  headerAccent:  '#D9B08C',
  accent:        '#FAD2E1',
  teal:          '#2A9D8F',
  orange:        '#F4A261',
  textPrimary:   '#F2F2F7',
  textSecondary: '#B4B4C7',
  textMuted:     '#8A8AA3',
  border:        '#363650',
  surface2:      '#272738',
  onAccent:      '#1A1A2E',
  successSolid:  '#059669',
  dangerSolid:   '#EF4444',
  warningSolid:  '#F59E0B',
  infoSolid:     '#3B82F6',
  whatsapp:      '#25D366',
  success: { bg: 'rgba(16,185,129,0.15)', fg: '#6EE7B7', border: 'rgba(16,185,129,0.35)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',  fg: '#FCA5A5', border: 'rgba(239,68,68,0.35)'  },
  warning: { bg: 'rgba(245,158,11,0.15)', fg: '#FCD34D', border: 'rgba(245,158,11,0.35)' },
  info:    { bg: 'rgba(59,130,246,0.15)', fg: '#93C5FD', border: 'rgba(59,130,246,0.35)' },
};

export const BADGE_COLORS = {
  'Completado':   COLORS.success,
  'En progreso':  COLORS.warning,
  'Principiante': COLORS.success,
  'Intermedio':   COLORS.warning,
  'Avanzado':     COLORS.danger,
};

export const Z_INDEX = {
  header:        100,
  fab:           300,
  modal:         1000,
  confirmDialog: 1100,
  toast:         9999,
};

export const COLORS_PALETTE = [
  '#FAD2E1','#B5EAD7','#FFDAC1','#C7CEEA',
  '#A8DADC','#F4A261','#E9C46A','#2A9D8F','#264653','#E76F51',
];

export const ANIMATION = {
  slideUp: 'slideUp 0.25s ease',
};

// ── Módulo Comercial ────────────────────────────────────────
export const CATEGORIAS = [
  { id: 'amigurumi', label: 'Amigurumi',  emoji: '🧸' },
  { id: 'flor',      label: 'Flor',       emoji: '🌸' },
  { id: 'llavero',   label: 'Llavero',    emoji: '🔑' },
  { id: 'otro',      label: 'Otro',       emoji: '🎀' },
];

export const TIPOS_EVENTO = [
  { id: 'bazar',      label: 'Bazar',      emoji: '🏪' },
  { id: 'tienda',     label: 'Tienda',     emoji: '🏬' },
  { id: 'papeleria',  label: 'Papelería',  emoji: '📚' },
  { id: 'mercado',    label: 'Mercado',    emoji: '🛒' },
  { id: 'online',     label: 'En línea',   emoji: '💻' },
  { id: 'otro',       label: 'Otro',       emoji: '📍' },
];

// ── Pricing defaults unificados ─────────────────────────────
export const PRICING_DEFAULTS = {
  costo_hora:      60,
  overhead_pct:    10,
  margen_pct:      30,
  pago_por_hora:   60,
  margen_boutique: 0.35,
  margen_propio:   0.20,
};
