import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '../../../../src/components/ui/Button'
import { Card } from '../../../../src/components/ui/Card'
import { ErrorMessage, LoadingState } from '../../../../src/components/ui/Feedback'
import { Field, Input } from '../../../../src/components/ui/Field'
import { ScaleSelector } from '../../../../src/components/ui/ScaleSelector'
import { Screen } from '../../../../src/components/ui/Screen'
import { Select } from '../../../../src/components/ui/Select'
import { SessionHeader } from '../../../../src/components/ui/SessionHeader'
import {
  createBehavioralRecord,
  getRubrics,
  getSession,
  getStudents,
} from '../../../../src/api/endpoints'
import { getApiErrorMessage } from '../../../../src/api/client'
import { rubricCriterionLevels } from '../../../../src/lib/labels'
import { colors, fontSize, radius, spacing } from '../../../../src/theme'

/**
 * Rúbrica de conducta de un alumno en una sesión
 * (POST /rubrics/:rubricId/records).
 *
 * Solo hay una rúbrica activa en el sistema, así que se selecciona sola y no
 * se muestra un selector de rúbrica (la web hace lo mismo).
 */
export default function RubricScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()

  const [session, setSession] = useState(null)
  const [students, setStudents] = useState(null)
  const [rubric, setRubric] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const [studentId, setStudentId] = useState(null)
  const [scores, setScores] = useState({})
  const [observations, setObservations] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const load = useCallback(async () => {
    setLoadError(null)
    try {
      const [sessionData, studentsData, rubricsData] = await Promise.all([
        getSession(id),
        getStudents(),
        getRubrics(),
      ])
      setSession(sessionData)
      setStudents(studentsData)
      setRubric(rubricsData.find((item) => item.isActive) ?? rubricsData[0] ?? null)
    } catch (err) {
      setLoadError(getApiErrorMessage(err))
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  const studentOptions = useMemo(
    () =>
      (students ?? []).map((student) => ({
        value: student.id,
        label: student.fullName,
        description: student.grade,
      })),
    [students],
  )

  const criteria = rubric?.criteria ?? []
  const missingCriteria = criteria.filter((c) => scores[c.id] === undefined)

  const resetForm = () => {
    setStudentId(null)
    setScores({})
    setObservations('')
    setAttempted(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    setAttempted(true)
    setSaveError(null)

    if (!rubric || !studentId || missingCriteria.length > 0) return

    setSaving(true)
    try {
      await createBehavioralRecord(rubric.id, {
        studentId,
        sessionId: session.id,
        // Se guardan tal cual, incluido C2: invertir la escala es tarea del
        // servicio de analítica, no del cliente de captura.
        scores,
        observations: observations.trim() || undefined,
      })

      const evaluated = students.find((s) => s.id === studentId)
      Alert.alert(
        'Evaluación guardada',
        `Se registró la conducta de ${evaluated?.fullName ?? 'el alumno'}.`,
        [
          // En el aula se evalúa a varios alumnos seguidos: volver a navegar
          // cada vez es fricción innecesaria.
          { text: 'Evaluar a otro alumno', onPress: resetForm },
          { text: 'Terminar', style: 'cancel', onPress: () => router.back() },
        ],
      )
    } catch (err) {
      setSaveError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!session && !loadError) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Cargando la rúbrica…" />
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

  if (!rubric) {
    return (
      <Screen scroll={false} contentStyle={styles.padded}>
        <ErrorMessage
          message="No hay ninguna rúbrica de conducta activa en el sistema."
          onRetry={load}
        />
      </Screen>
    )
  }

  return (
    <Screen>
      <SessionHeader session={session} />

      <Text style={styles.rubricName}>{rubric.name}</Text>

      <Field
        label="Alumno"
        error={attempted && !studentId ? 'Elige al alumno que vas a evaluar' : null}
      >
        <Select
          value={studentId}
          options={studentOptions}
          onChange={setStudentId}
          placeholder="Selecciona un alumno"
          disabled={!studentOptions.length}
        />
      </Field>

      {!studentOptions.length ? (
        <Card>
          <Text style={styles.emptyTitle}>No tienes alumnos asignados</Text>
          <Text style={styles.emptyText}>
            El administrador asigna los alumnos desde la versión web.
          </Text>
        </Card>
      ) : null}

      {criteria.map((criterion) => (
        <CriterionCard
          key={criterion.id}
          criterion={criterion}
          value={scores[criterion.id]}
          onChange={(value) => setScores((prev) => ({ ...prev, [criterion.id]: value }))}
          showError={attempted && scores[criterion.id] === undefined}
        />
      ))}

      <Field label="Observaciones (opcional)" hint="Algo que ayude a interpretar la evaluación">
        <Input
          value={observations}
          onChangeText={setObservations}
          placeholder="Ej. Se distrajo al cambiar de actividad…"
          multiline
          numberOfLines={4}
          style={styles.observations}
        />
      </Field>

      <ErrorMessage message={saveError} onRetry={handleSave} />

      <Button
        title="Guardar evaluación"
        onPress={handleSave}
        loading={saving}
        disabled={!studentOptions.length}
      />
      <Button title="Cancelar" variant="outline" onPress={() => router.back()} disabled={saving} />
    </Screen>
  )
}

function CriterionCard({ criterion, value, onChange, showError }) {
  const levels = rubricCriterionLevels(criterion)
  // El backend marca la escala invertida dentro de la propia descripción.
  const isInverted = /invertida/i.test(criterion.descripcion ?? '')

  return (
    <Card style={styles.criterion}>
      <View style={styles.criterionHeader}>
        <Text style={styles.criterionName}>{criterion.nombre}</Text>
        {isInverted ? (
          <View style={styles.invertedBadge}>
            <Text style={styles.invertedText}>Escala invertida</Text>
          </View>
        ) : null}
      </View>

      {criterion.descripcion ? (
        <Text style={styles.criterionDescription}>{criterion.descripcion}</Text>
      ) : null}

      <ScaleSelector levels={levels} value={value} onChange={onChange} />

      {showError ? (
        <Text style={styles.criterionError} accessibilityRole="alert">
          Falta marcar este criterio
        </Text>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: spacing.lg,
  },
  rubricName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  criterion: {
    gap: spacing.md,
  },
  criterionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  criterionName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  invertedBadge: {
    backgroundColor: colors.warningLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  invertedText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.warning,
    textTransform: 'uppercase',
  },
  criterionDescription: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  criterionError: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  observations: {
    minHeight: 96,
    textAlignVertical: 'top',
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
