import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../src/stores/auth.store'

/**
 * Layout raíz.
 *
 * Dispara la restauración de la sesión guardada, pero SIEMPRE renderiza el
 * navegador: expo-router necesita que el layout raíz monte un navegador desde
 * el primer render, así que la espera se resuelve dentro de cada pantalla
 * (ver StartupScreen en (app)/_layout.js y login.js).
 */
export default function RootLayout() {
  const restore = useAuthStore((state) => state.restore)

  useEffect(() => {
    void restore()
  }, [restore])

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="tablero" options={{ animation: 'fade' }} />
      </Stack>
    </SafeAreaProvider>
  )
}
