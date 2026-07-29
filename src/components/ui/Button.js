import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { colors, fontSize, radius, spacing, touchTarget } from '../../theme'

/**
 * Botón táctil grande (mín. 48 dp de alto) en tres variantes.
 * Mientras `loading` está activo el botón queda deshabilitado, para que un
 * doble toque nervioso no duplique un registro en la base de datos.
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  primaryLabel: { color: colors.onPrimary },
  outlineLabel: { color: colors.text },
  dangerLabel: { color: colors.danger },
})
