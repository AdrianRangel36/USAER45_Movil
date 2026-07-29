import { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '../../src/components/ui/Button'
import { Card } from '../../src/components/ui/Card'
import { Screen } from '../../src/components/ui/Screen'
import { useAuthStore } from '../../src/stores/auth.store'
import { ROLE_LABELS } from '../../src/lib/labels'
import { colors, fontSize, spacing } from '../../src/theme'

export default function AccountScreen() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [signingOut, setSigningOut] = useState(false)

  function confirmLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir? Tendrás que escribir tu correo y contraseña para volver a entrar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true)
            await logout()
            router.replace('/login')
          },
        },
      ],
    )
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <Row label="Nombre" value={user?.name} />
        <Row label="Correo" value={user?.email} />
        <Row label="Perfil" value={ROLE_LABELS[user?.role] ?? user?.role} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.note}>
          La sesión se guarda cifrada en este dispositivo y caduca a las 8 horas. Al cerrar
          sesión se borra por completo.
        </Text>
      </Card>

      <Button
        title="Cerrar sesión"
        variant="danger"
        onPress={confirmLogout}
        loading={signingOut}
      />
    </Screen>
  )
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? '—'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  row: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
})
