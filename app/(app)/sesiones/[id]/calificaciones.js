import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { ErrorMessage, LoadingState } from '../../../../src/components/ui/Feedback'
import { Field, Input } from '../../../../src/components/ui/Field'
import { Screen } from '../../../../src/components/ui/Screen'
import { SessionHeader } from '../../../../src/components/ui/SessionHeader'
import { createGrades, getSession, getStudents } from '../../../../src/api/endpoints'
import { getApiErrorMessage } from '../../../../src/api/client'
import { periodFromDate } from '../../../../src/lib/dates'
import { colors, fontSize, spacing } from '../../../../src/theme'

/**
 * Captura de calificaciones de una sesión (POST /grades, por lote).
 *
 * La materia NO se elige: viene de la sesión, y el backend valida que cada
 * calificación coincida con la materia de su sesión.
 */
export default function GradeCaptureScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const [session, setSession] = useState(null)
  const [students, setStudents] = useState(null)
  const [loadError, setLoadError] = useState(null)

  // { [studentId]: '8.5' } — se guarda como texto para no pelear con el
  // teclado mientras el docente escribe (un "8." intermedio no es un número).
  const [scores, setScores] = useState({})
  const [period, setPeriod] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      const [sessionData, studentsData] = await Promise.all([
        getSession(id),
        getStudents(),
      ])
      setSession(sessionData)
      setStudents(studentsData)
      // El periodo se propone a partir de la fecha de la sesión.
      setPeriod((current) => current || periodFromDate(sessionData.sessionDate))
    } catch (err) {
      setLoadError(getApiErrorMessage(err))
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const entries = useMemo(
    () =>
      Object.entries(scores)
        .map(([studentId, raw]) => ({ studentId, raw: raw.trim() }))
        .filter((entry) => entry.raw !== ''),
    [scores],
  )

  const invalidCount = entries.filter((entry) => !isValidScore(entry.raw)).length

  const handleSave = async () => {
    setAttempted(true)
    setSaveError(null)

    if (entries.length === 0 || invalidCount > 0 || !period.trim()) return

    setSaving(true)
    try {
      await createGrades(
        entries.map((entry) => ({
          studentId: entry.studentId,
          sessionId: session.id,
          subject: session.subject,
          score: Number(entry.raw),
          period: period.trim(),
        })),
      )
      Alert.alert(
        'Calificaciones guardadas',
        `Se registraron ${entries.length} ${entries.length === 1 ? 'calificación' : 'calificaciones'}.`,
        [{ text: 'Entendido', onPress: () => router.back() }],
      )
    } catch (err) {
      // El formulario conserva lo capturado: solo se muestra el error.
      setSaveError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!session && !loadError) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Cargando la sesión y tus alumnos…" />
      </Screen>
    )
  }

  if (loadError && !session) {
    return (
      <Screen scroll={false} contentStyle={styles.padded}>
        <ErrorMessage message={loadError} onRetry={load} />
      </Screen>
    )
  }

  return (
    <Screen>
      <SessionHeader session={session} />

      <Field
        label="Periodo"
        hint="Se propone a partir de la fecha de la sesión. Cámbialo si necesitas otro."
        error={attempted && !period.trim() ? 'Indica el periodo' : null}
      >
        <Input
          value={period}
          onChangeText={setPeriod}
          placeholder="Ej. 2026-7"
          autoCapitalize="none"
          error={attempted && !period.trim()}
        />
      </Field>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Alumnos</Text>
        <Text style={styles.sectionHint}>
          Escala de 0 a 10. Deja en blanco a quien no hayas evaluado en esta sesión.
        </Text>
      </View>

      {students?.length ? (
        students.map((student) => (
          <StudentScoreRow
            key={student.id}
            student={student}
            value={scores[student.id] ?? ''}
            onChange={(text) => setScores((prev) => ({ ...prev, [student.id]: text }))}
          />
        ))
      ) : (
        <Card>
          <Text style={styles.emptyTitle}>No tienes alumnos asignados</Text>
          <Text style={styles.emptyText}>
            El administrador asigna los alumnos desde la versión web. Sin alumnos asignados no
            es posible capturar calificaciones.
          </Text>
        </Card>
      )}

      {attempted && entries.length === 0 && students?.length ? (
        <Text style={styles.formError} accessibilityRole="alert">
          Captura al menos una calificación.
        </Text>
      ) : null}

      {invalidCount > 0 ? (
        <Text style={styles.formError} accessibilityRole="alert">
          Hay {invalidCount} {invalidCount === 1 ? 'calificación' : 'calificaciones'} fuera del
          rango de 0 a 10.
        </Text>
      ) : null}

      <ErrorMessage message={saveError} onRetry={handleSave} />

      <Button
        title={
          entries.length > 0
            ? `Guardar ${entries.length} ${entries.length === 1 ? 'calificación' : 'calificaciones'}`
            : 'Guardar calificaciones'
        }
        onPress={handleSave}
        loading={saving}
        disabled={!students?.length}
      />
      <Button
        title="Cancelar"
        variant="outline"
        onPress={() => router.back()}
        disabled={saving}
      />
    </Screen>
  )
}

function StudentScoreRow({ student, value, onChange }) {
  const trimmed = value.trim()
  const invalid = trimmed !== '' && !isValidScore(trimmed)

  return (
    <Card style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={2}>
          {student.fullName}
        </Text>
        <Text style={styles.studentGrade}>{student.grade}</Text>
      </View>
      <Input
        value={value}
        onChangeText={onChange}
        placeholder="0–10"
        keyboardType="decimal-pad"
        error={invalid}
        style={styles.scoreInput}
        accessibilityLabel={`Calificación de ${student.fullName}`}
      />
    </Card>
  )
}

/** Acepta 0 a 10, con hasta dos decimales (lo que valida el backend). */
function isValidScore(raw) {
  const normalized = raw.replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return false
  const value = Number(normalized)
  return value >= 0 && value <= 10
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: spacing.lg,
  },
  listHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  studentInfo: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  studentGrade: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  scoreInput: {
    width: 92,
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  formError: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
})
