import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ArasaacCredit } from '../../src/components/arasaac/ArasaacCredit'
import { PictogramGrid, pictogramWord } from '../../src/components/arasaac/PictogramGrid'
import { Button } from '../../src/components/ui/Button'
import { ErrorMessage } from '../../src/components/ui/Feedback'
import { Input } from '../../src/components/ui/Field'
import { Select } from '../../src/components/ui/Select'
import { searchPictograms } from '../../src/api/endpoints'
import { getApiErrorMessage } from '../../src/api/client'
import { SKIN_OPTIONS } from '../../src/lib/board-config'
import { speak, stopSpeaking } from '../../src/lib/speech'
import { colors, spacing } from '../../src/theme'

/**
 * Buscador de pictogramas de ARASAAC (GET /arasaac/search, con caché en el
 * backend). Al tocar un pictograma se pronuncia su palabra: es lo que el
 * docente necesita mientras trabaja con el alumno.
 */
export default function PictogramsScreen() {
  const [term, setTerm] = useState('')
  const [skin, setSkin] = useState('default')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // Término realmente consultado, para poder repetir la búsqueda al reintentar
  // o al cambiar el tono de piel sin depender de lo que haya en el campo.
  const [submitted, setSubmitted] = useState('')

  // Si se sale de la pantalla mientras habla, no debe seguir sonando.
  useEffect(() => () => stopSpeaking(), [])

  const runSearch = useCallback(async (searchTerm, searchSkin) => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return

    setSubmitted(trimmed)
    setLoading(true)
    setError(null)
    try {
      setResults(await searchPictograms(trimmed, searchSkin))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSkinChange = (value) => {
    setSkin(value)
    // Cambiar el tono de piel sin volver a buscar dejaría en pantalla
    // resultados que ya no corresponden a la opción elegida.
    if (submitted) void runSearch(submitted, value)
  }

  return (
    <View style={styles.root}>
      <View style={styles.controls}>
        <Input
          value={term}
          onChangeText={setTerm}
          placeholder="Busca una palabra: comer, feliz, sumar…"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => runSearch(term, skin)}
        />
        <Select value={skin} options={SKIN_OPTIONS} onChange={handleSkinChange} />
        <Button
          title="Buscar"
          onPress={() => runSearch(term, skin)}
          loading={loading}
          disabled={!term.trim()}
        />
        <ErrorMessage
          message={error}
          onRetry={submitted ? () => runSearch(submitted, skin) : undefined}
        />
      </View>

      <PictogramGrid
        pictograms={results ?? []}
        onSelect={(pictogram) => speak(pictogramWord(pictogram))}
        numColumns={3}
        loading={loading}
        emptyTitle={
          results === null ? 'Busca un pictograma' : `Sin resultados para "${submitted}"`
        }
        emptyDescription={
          results === null
            ? 'Escribe una palabra y toca Buscar. Al tocar un pictograma, la app lo pronuncia en voz alta.'
            : 'Prueba con otra palabra, en singular y sin acentos si no aparece nada.'
        }
      />

      <ArasaacCredit />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  controls: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: 0,
  },
})
