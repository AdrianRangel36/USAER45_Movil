import { Stack } from 'expo-router'
import { colors, fontSize } from '../../../src/theme'

/** Pila de la pestaña Sesiones: lista → nueva sesión → captura por sesión. */
export default function SessionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontSize: fontSize.lg },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Sesiones' }} />
      <Stack.Screen name="nueva" options={{ title: 'Nueva sesión' }} />
    </Stack>
  )
}
