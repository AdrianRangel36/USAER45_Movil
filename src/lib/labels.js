/**
 * Etiquetas en español de los enums del backend.
 * Espejo de USAER45_Web/src/lib/labels.ts para que ambos clientes muestren
 * exactamente los mismos textos al docente.
 */

import { colors } from '../theme'

export const ROLE_LABELS = {
  ADMIN: 'Administrador(a)',
  DOCENTE: 'Docente',
  DIRECTIVO: 'Directivo(a)',
}

export const NEE_LABELS = {
  DEFICIT_ATENCION: 'Déficit de atención',
  DIFICULTAD_APRENDIZAJE: 'Dificultad de aprendizaje',
  DISCAPACIDAD_INTELECTUAL: 'Discapacidad intelectual',
  TRASTORNO_LENGUAJE: 'Trastorno del lenguaje',
  OTRO: 'Otro',
}

export const SUBJECT_LABELS = {
  LECTURA: 'Lectura',
  MATEMATICAS: 'Matemáticas',
}

export const TECHNIQUE_CATEGORY_LABELS = {
  VISUAL: 'Visual',
  LUDICA: 'Lúdica',
  REPETICION: 'Repetición',
  OTRA: 'Otra',
}

/** Color de acento por categoría de técnica, para distinguirlas de un vistazo. */
export const TECHNIQUE_CATEGORY_COLORS = {
  VISUAL: colors.visual,
  LUDICA: colors.ludica,
  REPETICION: colors.repeticion,
  OTRA: colors.otra,
}

/**
 * Escala Likert de 4 puntos de las rúbricas de conducta (Actividad 3.2).
 * Es par a propósito: sin opción neutra, para evitar el sesgo de tendencia
 * central detectado en la bitácora de campo. Se usa como respaldo cuando un
 * criterio no trae su propio objeto `escala.etiquetas`.
 */
export const RUBRIC_SCALE_FALLBACK = {
  1: 'Nunca',
  2: 'Rara vez',
  3: 'Frecuentemente',
  4: 'Siempre',
}
