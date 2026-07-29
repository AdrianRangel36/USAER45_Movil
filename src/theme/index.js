/**
 * Tokens de diseño de la app móvil USAER 45J.
 *
 * Proyecto Integrador II · UTD 6°B BIS · "Estrategas de la Recolección"
 * Jonathan René Guerrero Flores · José Sinohe Galván Ríos ·
 * Luis Adrián Rangel Vázquez · Diego Rodríguez Núñez · Jesús Vázquez Hernández
 *
 * La app se usa de pie dentro del aula, con una mano y a veces con poca luz:
 * por eso los tamaños táctiles son grandes (mínimo 48 dp, recomendación de
 * accesibilidad de Android/iOS) y el texto base es más grande que el habitual.
 */

export const colors = {
  // Azul institucional, tomado de la web del proyecto.
  primary: '#1D4ED8',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  onPrimary: '#FFFFFF',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',

  text: '#0F172A',
  textMuted: '#64748B',
  textOnDark: '#F8FAFC',

  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  success: '#15803D',
  successLight: '#DCFCE7',
  warning: '#B45309',
  warningLight: '#FEF3C7',

  // Categorías de técnica de enseñanza (variable independiente del estudio).
  visual: '#7C3AED',
  ludica: '#EA580C',
  repeticion: '#0891B2',
  otra: '#64748B',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
}

/** Altura mínima de cualquier elemento tocable. */
export const touchTarget = 48

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
}

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
}
