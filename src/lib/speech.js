import * as Speech from 'expo-speech'

/**
 * Síntesis de voz en español para el tablero de comunicación y el buscador de
 * pictogramas.
 *
 * Equivalente nativo de USAER45_Web/src/lib/speech.ts: la web usa la Web Speech
 * API del navegador, que no existe en móvil.
 */

/** Ligeramente pausado, pensado para alumnos con trastorno del lenguaje. */
const RATE = 0.9
const LANGUAGE = 'es-MX'

/** Pronuncia `text`, cancelando cualquier locución en curso. */
export function speak(text) {
  const trimmed = String(text ?? '').trim()
  if (!trimmed) return
  // Sin el stop() previo, tocar varios pictogramas seguidos encola las palabras
  // y el alumno escucha la anterior en vez de la que acaba de tocar.
  Speech.stop()
  Speech.speak(trimmed, { language: LANGUAGE, rate: RATE })
}

export function stopSpeaking() {
  Speech.stop()
}
