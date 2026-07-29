import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { StartupScreen } from '../../src/components/ui/StartupScreen'
import { useAuthStore } from '../../src/stores/auth.store'
import { colors, fontSize } from '../../src/theme'

/**
 * Área autenticada. Actúa como guard: sin token no se monta ninguna pantalla
 * de captura. Cuando el JWT expira (8 h), el interceptor del cliente HTTP
 * limpia la sesión y este layout redirige solo al login.
 */
export default function AppLayout() {
  const token = useAuthStore((state) => state.token)
  const restoring = useAuthStore((state) => state.restoring)

  // Sin esperar a que termine la restauración, un usuario con sesión válida
  // vería el login por un instante antes de que se cargue su token.
  if (restoring) return <StartupScreen />
  if (!token) return <Redirect href="/login" />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: '600' },
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontSize: fontSize.lg },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sesiones"
        options={{
          title: 'Sesiones',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pictogramas"
        options={{
          title: 'Pictogramas',
          tabBarIcon: ({ color, size }) => <Ionicons name="images" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
