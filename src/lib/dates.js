/**
 * Formato de fechas en español, sin depender de `Intl` para que el resultado
 * sea idéntico en iOS y Android (Hermes no siempre trae los locales completos).
 */

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

/** "12 de julio de 2026". Acepta Date o ISO string; regresa '—' si no es válida. */
export function formatDateLong(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`
}

/** "lunes 12 de julio de 2026", para confirmar la fecha elegida en el alta. */
export function formatDateWithWeekday(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${WEEKDAYS[date.getDay()]} ${formatDateLong(date)}`
}
