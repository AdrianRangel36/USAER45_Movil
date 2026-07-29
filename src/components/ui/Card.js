import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, radius, shadow, spacing } from '../../theme'

/** Tarjeta de contenido. Si recibe `onPress` se comporta como botón. */
export function Card({ children, onPress, style, accessibilityLabel }) {
  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  )
}

/** Tarjeta de acción del Inicio: título grande + descripción corta. */
export function ActionCard({ title, description, accent = colors.primary, onPress }) {
  return (
    <Card onPress={onPress} accessibilityLabel={title} style={styles.action}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.actionBody}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.75,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  accent: {
    width: 6,
    alignSelf: 'stretch',
    minHeight: 44,
    borderRadius: radius.full,
  },
  actionBody: {
    flex: 1,
    gap: spacing.xs,
  },
  actionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  actionDescription: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
})
