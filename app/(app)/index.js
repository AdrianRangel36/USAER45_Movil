import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ActionCard, Card } from '../../src/components/ui/Card'
import { ErrorMessage } from '../../src/components/ui/Feedback'
import { Screen } from '../../src/components/ui/Screen'
import { getStudents } from '../../src/api/endpoints'
import { getApiErrorMessage } from '../../src/api/client'
import { useAuthStore } from '../../src/stores/auth.store'
import { ROLE_LABELS } from '../../src/lib/labels'
import { colors, fontSize, spacing } from '../../src/theme'

/**
 * Inicio: accesos directos a las cuatro tareas que el docente hace en el aula.
 *
 * Además consulta GET /students, que sirve como comprobación real de que el
 * JWT viaja bien en las peticiones y de que el backend responde.
 */
export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [students, setStudents] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStudents(await getStudents())
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStudents()
  }, [loadStudents])

  return (
    <Screen>
      <View style={styles.greeting}>
        <Text style={styles.hello}>Hola, {user?.name?.split(' ')[0] ?? 'docente'}</Text>
        <Text style={styles.role}>{ROLE_LABELS[user?.role] ?? ''}</Text>
      </View>

      <Card style={styles.summary}>
        <Text style={styles.summaryLabel}>Alumnos asignados</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.summaryValue}>{students?.length ?? '—'}</Text>
        )}
        <Text style={styles.summaryHint}>{summaryHint(user?.role, students)}</Text>
      </Card>

      <ErrorMessage message={error} onRetry={loadStudents} />

      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>Captura en el aula</Text>

        <ActionCard
          title="Nueva sesión"
          description="Registra la técnica aplicada, la materia y la fecha de la clase"
          accent={colors.primary}
          onPress={() => router.push('/sesiones/nueva')}
        />
        <ActionCard
          title="Calificaciones"
          description="Elige una sesión y captura los resultados de 0 a 10"
          accent={colors.ludica}
          onPress={() => router.push('/sesiones')}
        />
        <ActionCard
          title="Rúbrica de conducta"
          description="Evalúa los cuatro criterios de comportamiento de la sesión"
          accent={colors.visual}
          onPress={() => router.push('/sesiones')}
        />
        <ActionCard
          title="Tablero de comunicación"
          description="Pictogramas ARASAAC a pantalla completa, con voz"
          accent={colors.repeticion}
          onPress={() => router.push('/tablero')}
        />
      </View>
    </Screen>
  )
}

/**
 * Un cero aquí no es un error de la app: el alta de alumnos es tarea del
 * administrador desde la web, así que conviene decirlo en vez de dejar el
 * número solo.
 */
function summaryHint(role, students) {
  if (students === null) return 'Consultando el servidor…'
  if (students.length === 0) {
    return role === 'ADMIN'
      ? 'Todavía no hay alumnos registrados en el sistema. Se dan de alta desde la web.'
      : 'Aún no tienes alumnos asignados. El administrador los asigna desde la web.'
  }
  return role === 'ADMIN'
    ? 'Como administrador ves a todos los alumnos del programa.'
    : 'Solo se muestran los alumnos que tienes asignados.'
}

const styles = StyleSheet.create({
  greeting: {
    gap: spacing.xs,
  },
  hello: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  summary: {
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  summaryHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
