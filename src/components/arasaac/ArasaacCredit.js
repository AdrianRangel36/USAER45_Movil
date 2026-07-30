import { StyleSheet, Text } from 'react-native'
import { colors, fontSize, spacing } from '../../theme'

/**
 * Atribución de ARASAAC.
 *
 * NO es decorativa: los pictogramas se distribuyen bajo licencia
 * CC BY-NC-SA, que exige reconocer al autor. Debe quedar visible en toda
 * pantalla que muestre pictogramas.
 */
export function ArasaacCredit({ style, muted = false }) {
  return (
    <Text style={[styles.credit, muted && styles.mutedCredit, style]}>
      Pictogramas: ARASAAC — Gobierno de Aragón — Sergio Palao (CC BY-NC-SA)
    </Text>
  )
}

const styles = StyleSheet.create({
  credit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  mutedCredit: {
    opacity: 0.7,
  },
})
