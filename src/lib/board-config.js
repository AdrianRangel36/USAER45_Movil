/**
 * Configuración del tablero de comunicación y del buscador de pictogramas.
 * Portado de USAER45_Web/src/components/arasaac/board-config.ts para que ambos
 * clientes ofrezcan las mismas categorías y tonos de piel.
 */

/** `term` es el término real de búsqueda en ARASAAC (verificado con resultados). */
export const BOARD_CATEGORIES = [
  { id: 'emociones', label: 'Emociones', term: 'emociones' },
  { id: 'acciones', label: 'Acciones', term: 'acciones' },
  { id: 'numeros', label: 'Números', term: 'números' },
  { id: 'colores', label: 'Colores', term: 'colores' },
  { id: 'lectura', label: 'Lectura', term: 'lectura' },
  { id: 'matematicas', label: 'Matemáticas', term: 'matemáticas' },
]

/** Tonos de piel que acepta GET /arasaac/search?skin= ("assian" es la grafía de ARASAAC). */
export const SKIN_OPTIONS = [
  { value: 'default', label: 'Piel: por defecto' },
  { value: 'white', label: 'Piel clara' },
  { value: 'black', label: 'Piel oscura' },
  { value: 'assian', label: 'Piel asiática' },
  { value: 'mulatto', label: 'Piel media' },
  { value: 'aztec', label: 'Piel morena' },
]

/**
 * Tablero acotado: pocos objetivos y grandes. Una búsqueda puede traer más de
 * 170 pictogramas, que frente a un alumno con NEE es ruido, no ayuda.
 */
export const MAX_BOARD_PICTOGRAMS = 24
