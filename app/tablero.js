import { StyleSheet, Text, View } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '../src/components/ui/Button'
import { useAuthStore } from '../src/stores/auth.store'
import { colors, fontSize, radius, spacing } from '../src/theme'

/**
 * Tablero de comunicación.
 *
 * Vive fuera de las pestañas (igual que en la web, donde está fuera del
 * AppLayout) porque se usa a pantalla completa frente al alumno: cualquier
 * elemento de navegación visible invita a tocarlo por error.
 */
export default function BoardScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const token = useAuthStore((state) => state.token)

  if (!token) return <Redirect href="/login" />

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>En construcción</Text>
        </View>
        <Text style={styles.title}>Tablero de comunicación</Text>
        <Text style={styles.description}>
          Cuadrícula de pictogramas ARASAAC por categoría, constructor de frases y voz en
          español con expo-speech.
        </Text>
      </View>

      <Button title="Salir del tablero" variant="outline" onPress={() => router.back()} />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
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
})
