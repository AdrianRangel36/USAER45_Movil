import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, radius, spacing } from '../../theme'
import { Button } from './Button'

/**
 * Mensaje de error de la API con reintento opcional.
 *
 * En el aula la conexión falla seguido, así que el error se muestra sin sacar
 * al docente de la pantalla: los datos que ya capturó siguen en el formulario
 * y basta con volver a tocar "Reintentar".
 */
export function ErrorMessage({ message, onRetry }) {
  if (!message) return null

  return (
    <View style={styles.error} accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <Button title="Reintentar" variant="outline" onPress={onRetry} /> : null}
    </View>
  )
}

export function LoadingState({ label = 'Cargando…' }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.mutedText}>{label}</Text>
    </View>
  )
}

export function EmptyState({ title, description }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.mutedText}>{description}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.danger,
    fontWeight: '500',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  mutedText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
