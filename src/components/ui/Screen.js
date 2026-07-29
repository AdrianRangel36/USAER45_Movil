import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '../../theme'

/**
 * Contenedor base de cada pantalla: aplica el fondo, el área segura inferior
 * (barra de gestos de Android/iOS) y, cuando `scroll` está activo, evita que
 * el teclado tape los campos del formulario.
 *
 * El área segura superior no se aplica aquí porque las pantallas con header de
 * expo-router ya la reciben del navegador.
 */
export function Screen({ children, scroll = true, contentStyle, edges = ['bottom'] }) {
  const insets = useSafeAreaInsets()

  const padding = {
    paddingTop: edges.includes('top') ? insets.top + spacing.lg : spacing.lg,
    paddingBottom: edges.includes('bottom') ? insets.bottom + spacing.lg : spacing.lg,
  }

  if (!scroll) {
    return (
      <View style={[styles.root, padding, contentStyle]}>{children}</View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, padding, contentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
})
