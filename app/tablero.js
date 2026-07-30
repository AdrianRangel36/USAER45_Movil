import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArasaacCredit } from '../src/components/arasaac/ArasaacCredit'
import { PictogramGrid, pictogramWord } from '../src/components/arasaac/PictogramGrid'
import { ErrorMessage } from '../src/components/ui/Feedback'
import { searchPictograms } from '../src/api/endpoints'
import { getApiErrorMessage } from '../src/api/client'
import { BOARD_CATEGORIES, MAX_BOARD_PICTOGRAMS } from '../src/lib/board-config'
import { speak, stopSpeaking } from '../src/lib/speech'
import { useAuthStore } from '../src/stores/auth.store'
import { colors, fontSize, radius, spacing, touchTarget } from '../src/theme'

/**
 * Tablero de comunicación.
 *
 * Vive fuera de las pestañas (igual que en la web, donde está fuera del
 * AppLayout) porque se usa a pantalla completa frente al alumno: cualquier
 * elemento de navegación visible invita a tocarlo por error.
 */
export default function BoardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const token = useAuthStore((state) => state.token)

  const [categoryId, setCategoryId] = useState(BOARD_CATEGORIES[0].id)
  const [pictograms, setPictograms] = useState([])
  const [phrase, setPhrase] = useState([])
  const [large, setLarge] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const category = BOARD_CATEGORIES.find((c) => c.id === categoryId) ?? BOARD_CATEGORIES[0]

  const load = useCallback(async (term) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchPictograms(term)
      // Tablero acotado: pocos objetivos y grandes.
      setPictograms(data.slice(0, MAX_BOARD_PICTOGRAMS))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(category.term)
  }, [category.term, load])

  // Al salir del tablero no debe quedar nada sonando.
  useEffect(() => () => stopSpeaking(), [])

  if (!token) return <Redirect href="/login" />

  const handleSelect = (pictogram) => {
    const word = pictogramWord(pictogram)
    speak(word)
    setPhrase((prev) => [...prev, { key: `${pictogram.id}-${Date.now()}`, word }])
  }

  const handleExit = () => {
    stopSpeaking()
    router.back()
  }

  const theme = highContrast ? darkTheme : lightTheme

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.background, paddingTop: insets.top + spacing.sm },
      ]}
    >
      {/* Frase construida + salida */}
      <View style={[styles.phraseBar, { borderBottomColor: theme.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.phraseScroll}
        >
          {phrase.length === 0 ? (
            <Text style={[styles.phraseHint, { color: theme.textMuted }]}>
              Toca pictogramas para formar una frase
            </Text>
          ) : (
            phrase.map((item, index) => (
              <Pressable
                key={item.key}
                onPress={() => setPhrase((prev) => prev.filter((_, i) => i !== index))}
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${item.word}`}
                style={[styles.phraseChip, { backgroundColor: theme.chip }]}
              >
                <Text style={[styles.phraseWord, { color: theme.text }]}>{item.word}</Text>
                <Text style={[styles.phraseRemove, { color: theme.textMuted }]}>✕</Text>
              </Pressable>
            ))
          )}
        </ScrollView>

        <Pressable
          onPress={handleExit}
          accessibilityRole="button"
          style={({ pressed }) => [styles.exitButton, pressed && styles.pressed]}
        >
          <Text style={styles.exitText}>Salir</Text>
        </Pressable>
      </View>

      {phrase.length > 0 ? (
        <View style={styles.phraseActions}>
          <BoardButton
            label="Decir la frase"
            theme={theme}
            primary
            onPress={() => speak(phrase.map((item) => item.word).join(' '))}
          />
          <BoardButton label="Limpiar" theme={theme} onPress={() => setPhrase([])} />
        </View>
      ) : null}

      {/* Categorías */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {BOARD_CATEGORIES.map((item) => {
          const isActive = item.id === categoryId
          return (
            <Pressable
              key={item.id}
              onPress={() => setCategoryId(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.category,
                { backgroundColor: isActive ? colors.primary : theme.chip },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isActive ? colors.onPrimary : theme.text },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* Opciones de presentación */}
      <View style={styles.options}>
        <BoardButton
          label={large ? 'Tamaño: grande' : 'Tamaño: mediano'}
          theme={theme}
          onPress={() => setLarge((value) => !value)}
        />
        <BoardButton
          label={highContrast ? 'Fondo: alto contraste' : 'Fondo: normal'}
          theme={theme}
          onPress={() => setHighContrast((value) => !value)}
        />
      </View>

      {error ? (
        <View style={styles.errorWrapper}>
          <ErrorMessage message={error} onRetry={() => load(category.term)} />
        </View>
      ) : null}

      <PictogramGrid
        pictograms={pictograms}
        onSelect={handleSelect}
        numColumns={large ? 2 : 3}
        loading={loading}
        loadingLabel="Cargando pictogramas…"
        dark={highContrast}
        emptyTitle={error ? undefined : 'Sin pictogramas en esta categoría'}
      />

      <ArasaacCredit style={{ color: theme.textMuted }} />
    </View>
  )
}

function BoardButton({ label, onPress, theme, primary = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.boardButton,
        {
          backgroundColor: primary ? colors.primary : theme.chip,
          borderColor: primary ? colors.primary : theme.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.boardButtonText, { color: primary ? colors.onPrimary : theme.text }]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const lightTheme = {
  background: colors.background,
  chip: colors.surface,
  border: colors.border,
  text: colors.text,
  textMuted: colors.textMuted,
}

const darkTheme = {
  background: '#09090B',
  chip: '#18181B',
  border: '#3F3F46',
  text: '#FAFAFA',
  textMuted: '#A1A1AA',
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  phraseBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  phraseScroll: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.sm,
    minHeight: touchTarget,
  },
  phraseHint: {
    fontSize: fontSize.sm,
  },
  phraseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: touchTarget,
  },
  phraseWord: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  phraseRemove: {
    fontSize: fontSize.sm,
  },
  exitButton: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
  },
  exitText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  phraseActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  categories: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  category: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  categoryText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  boardButton: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  boardButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  errorWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
})
