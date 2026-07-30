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
 * central detectado en la bitácora de campo.
 *
 * Solo es un respaldo para cuando un criterio no trae su propio objeto
 * `escala.etiquetas`. Las etiquetas de aquí son las de la rúbrica realmente
 * sembrada en la base (la documentación del estudio decía "Frecuentemente",
 * pero el dato real es "Casi siempre").
 */
export const RUBRIC_SCALE_FALLBACK = {
  1: 'Nunca',
  2: 'Rara vez',
  3: 'Casi siempre',
  4: 'Siempre',
}

/**
 * Niveles de un criterio de rúbrica, listos para <ScaleSelector>.
 *
 * `escala` normalmente llega como objeto { min, max, etiquetas }, pero el DTO
 * del backend también permite un string suelto: en ese caso se usa el respaldo
 * de arriba.
 */
export function rubricCriterionLevels(criterion) {
  const scale = criterion?.escala
  const labels =
    scale && typeof scale === 'object' && scale.etiquetas
      ? scale.etiquetas
      : RUBRIC_SCALE_FALLBACK

  return Object.entries(labels)
    .map(([value, label]) => ({ value: Number(value), label }))
    .sort((a, b) => a.value - b.value)
}
