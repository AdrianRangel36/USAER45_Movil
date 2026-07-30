import { useState } from 'react'
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, radius, shadow, spacing, touchTarget } from '../../theme'

/**
 * Selector propio: un botón grande que abre un modal con las opciones.
 *
 * Se prefiere sobre un <Picker> nativo porque en el aula se usa de pie y con
 * una mano: cada opción ocupa al menos 48 dp y se ve completa (nombre y
 * descripción), sin la letra chica de los desplegables del sistema.
 *
 * options: [{ value, label, description?, color? }]
 *   - `color` pinta un punto de acento (p. ej. la categoría de la técnica).
 */
export function Select({ value, options, onChange, placeholder = 'Selecciona una opción', disabled = false }) {
  const [open, setOpen] = useState(false)

  const selected = options.find((option) => option.value === value)

  const handleSelect = (option) => {
    setOpen(false)
    onChange(option.value)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityLabel={selected ? selected.label : placeholder}
        style={({ pressed }) => [
          styles.trigger,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        {selected?.color ? <View style={[styles.dot, { backgroundColor: selected.color }]} /> : null}
        <Text
          style={[styles.triggerText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Tocar fuera de la hoja cierra el modal sin cambiar la selección. */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <FlatList
              data={options}
              keyExtractor={(option) => String(option.value)}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const isSelected = item.value === value
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {item.color ? <View style={[styles.dot, { backgroundColor: item.color }]} /> : null}
                    <View style={styles.optionBody}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text style={styles.optionDescription}>{item.description}</Text>
                      ) : null}
                    </View>
                    {isSelected ? <Text style={styles.check}>✓</Text> : null}
                  </Pressable>
                )
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  triggerText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  placeholder: {
    color: colors.textMuted,
  },
  chevron: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxHeight: '70%',
    overflow: 'hidden',
    ...shadow.card,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  option: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionBody: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  optionDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  check: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
})
