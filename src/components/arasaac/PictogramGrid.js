import { memo } from 'react'
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { EmptyState, LoadingState } from '../ui/Feedback'
import { colors, fontSize, radius, spacing } from '../../theme'

/**
 * Cuadrícula de pictogramas de ARASAAC, compartida por el buscador y el
 * tablero de comunicación.
 *
 * Usa FlatList (virtualizada) porque una búsqueda puede traer más de 170
 * resultados y renderizarlos todos de golpe hace que la app se sienta trabada
 * en un teléfono modesto.
 *
 * `dark` activa el modo de alto contraste del tablero.
 */
export function PictogramGrid({
  pictograms,
  onSelect,
  numColumns = 3,
  loading = false,
  loadingLabel = 'Buscando pictogramas…',
  emptyTitle,
  emptyDescription,
  dark = false,
  ListHeaderComponent,
  ListFooterComponent,
}) {
  if (loading) return <LoadingState label={loadingLabel} />

  return (
    <FlatList
      data={pictograms}
      // `numColumns` no se puede cambiar en caliente sin remontar la lista.
      key={`cols-${numColumns}`}
      numColumns={numColumns}
      keyExtractor={(item) => String(item.id)}
      // Sin flex explícito, la lista crece con su contenido y empuja fuera de
      // pantalla lo que venga debajo (la atribución de ARASAAC).
      style={styles.list}
      // `columnWrapperStyle` solo es válido con más de una columna.
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={
        emptyTitle ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null
      }
      renderItem={({ item }) => (
        <PictogramCard pictogram={item} onSelect={onSelect} dark={dark} />
      )}
    />
  )
}

/** Palabra principal del pictograma; si no trae keywords, se usa su id. */
export function pictogramWord(pictogram) {
  return pictogram?.keywords?.[0] ?? String(pictogram?.id ?? '')
}

const PictogramCard = memo(function PictogramCard({ pictogram, onSelect, dark }) {
  const word = pictogramWord(pictogram)

  return (
    <Pressable
      onPress={() => onSelect?.(pictogram)}
      accessibilityRole="button"
      accessibilityLabel={word}
      style={({ pressed }) => [
        styles.card,
        dark && styles.cardDark,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: pictogram.imageUrl }}
          style={styles.image}
          resizeMode="contain"
          // Las imágenes vienen del CDN público de ARASAAC.
          accessibilityIgnoresInvertColors
        />
      </View>
      <Text style={[styles.word, dark && styles.wordDark]} numberOfLines={2}>
        {word}
      </Text>
    </Pressable>
  )
})

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.xs,
    alignItems: 'center',
  },
  cardDark: {
    backgroundColor: '#18181B',
    borderColor: '#3F3F46',
  },
  pressed: {
    opacity: 0.65,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  word: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  wordDark: {
    color: colors.textOnDark,
  },
})
