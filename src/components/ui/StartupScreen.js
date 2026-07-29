import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, spacing } from '../../theme'

/**
 * Pantalla que se muestra mientras se lee la sesión guardada del
 * almacenamiento seguro. Evita que la app parpadee hacia el login cuando el
 * docente ya tenía sesión iniciada.
 */
export function StartupScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>USAER 45J</Text>
      <ActivityIndicator color={colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
})
