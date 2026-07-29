import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, fontSize, radius, spacing, touchTarget } from '../../theme'

/** Etiqueta + control + mensaje de error, con el espaciado uniforme de la app. */
export function Field({ label, error, hint, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  )
}

/**
 * Campo de texto. `secure` agrega el botón Mostrar/Ocultar, necesario en móvil
 * porque escribir una contraseña a ciegas en una pantalla táctil es propenso a
 * errores.
 */
export function Input({ secure = false, error = false, style, ...props }) {
  const [hidden, setHidden] = useState(secure)

  const input = (
    <TextInput
      style={[styles.input, error && styles.inputError, secure && styles.inputWithAction, style]}
      placeholderTextColor={colors.textMuted}
      secureTextEntry={hidden}
      {...props}
    />
  )

  if (!secure) return input

  return (
    <View style={styles.inputRow}>
      {input}
      <Pressable
        onPress={() => setHidden((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
        style={styles.inputAction}
      >
        <Text style={styles.inputActionText}>{hidden ? 'Mostrar' : 'Ocultar'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  inputRow: {
    justifyContent: 'center',
  },
  input: {
    minHeight: touchTarget,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputWithAction: {
    paddingRight: 92,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputAction: {
    position: 'absolute',
    right: spacing.xs,
    height: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  inputActionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
})
