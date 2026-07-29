import { StyleSheet, Text, View } from 'react-native'
import { Screen } from './Screen'
import { colors, fontSize, radius, spacing } from '../../theme'

/**
 * Marcador de un módulo aún no construido.
 *
 * Las rutas ya existen con su ruta definitiva para que la navegación de la app
 * sea la real desde el primer día; en la Etapa 2 solo se sustituye el cuerpo de
 * cada pantalla.
 */
export function ComingSoon({ title, description, endpoint }) {
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>En construcción</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {endpoint ? <Text style={styles.endpoint}>{endpoint}</Text> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  badge: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.warning,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  endpoint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
})
