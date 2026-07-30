import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, radius, spacing, touchTarget } from '../../theme'

/**
 * Escala Likert de 4 puntos como botones grandes en fila.
 *
 * La web usa un desplegable; en el aula, con el teléfono en una mano, marcar
 * un nivel debe ser un solo toque sobre un objetivo grande y con su etiqueta
 * visible, sin abrir ningún menú.
 *
 * `levels`: [{ value: 1..4, label: 'Nunca' }] — vienen de `escala.etiquetas`
 * de la rúbrica, que es la fuente de verdad.
 */
export function ScaleSelector({ levels, value, onChange }) {
  return (
    <View style={styles.row}>
      {levels.map((level) => {
        const isSelected = level.value === value
        return (
          <Pressable
            key={level.value}
            onPress={() => onChange(level.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${level.value}, ${level.label}`}
            style={({ pressed }) => [
              styles.level,
              isSelected && styles.levelSelected,
              pressed && !isSelected && styles.pressed,
            ]}
          >
            <Text style={[styles.number, isSelected && styles.numberSelected]}>
              {level.value}
            </Text>
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={2}
            >
              {level.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  level: {
    flex: 1,
    minHeight: touchTarget + 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  levelSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  number: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  numberSelected: {
    color: colors.onPrimary,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
})
