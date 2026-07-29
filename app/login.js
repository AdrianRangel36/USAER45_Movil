import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Redirect, useRouter } from 'expo-router'
import { Button } from '../src/components/ui/Button'
import { Field, Input } from '../src/components/ui/Field'
import { ErrorMessage } from '../src/components/ui/Feedback'
import { Screen } from '../src/components/ui/Screen'
import { StartupScreen } from '../src/components/ui/StartupScreen'
import { useAuthStore } from '../src/stores/auth.store'
import { colors, fontSize, spacing } from '../src/theme'

export default function LoginScreen() {
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const restoring = useAuthStore((state) => state.restoring)
  const loading = useAuthStore((state) => state.loading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const clearError = useAuthStore((state) => state.clearError)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)

  if (restoring) return <StartupScreen />
  // Si ya hay sesión (por ejemplo, al volver atrás), no se muestra el login.
  if (token) return <Redirect href="/" />

  const missingFields = !email.trim() || !password

  async function handleSubmit() {
    setTouched(true)
    if (missingFields) return

    const ok = await login(email, password)
    if (ok) router.replace('/')
  }

  return (
    <Screen contentStyle={styles.content} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>USAER 45J</Text>
        <Text style={styles.subtitle}>
          Captura de sesiones, calificaciones y rúbricas en el aula
        </Text>
      </View>

      <View style={styles.form}>
        <Field
          label="Correo electrónico"
          error={touched && !email.trim() ? 'Escribe tu correo' : null}
        >
          <Input
            value={email}
            onChangeText={(value) => {
              setEmail(value)
              if (error) clearError()
            }}
            placeholder="docente@usaer45j.edu.mx"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            textContentType="emailAddress"
            error={touched && !email.trim()}
          />
        </Field>

        <Field
          label="Contraseña"
          error={touched && !password ? 'Escribe tu contraseña' : null}
        >
          <Input
            value={password}
            onChangeText={(value) => {
              setPassword(value)
              if (error) clearError()
            }}
            placeholder="••••••••"
            secure
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            onSubmitEditing={handleSubmit}
            returnKeyType="go"
            error={touched && !password}
          />
        </Field>

        <ErrorMessage message={error} />

        <Button
          title="Entrar"
          onPress={handleSubmit}
          loading={loading}
          disabled={touched && missingFields}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Los datos de los alumnos están protegidos conforme a la LGPDPPSO. Tu sesión se
          guarda cifrada en este dispositivo y caduca a las 8 horas.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
})
