import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import { Button } from '../../../src/components/ui/Button'
import { ErrorMessage, LoadingState } from '../../../src/components/ui/Feedback'
import { Field, Input } from '../../../src/components/ui/Field'
import { Screen } from '../../../src/components/ui/Screen'
import { Select } from '../../../src/components/ui/Select'
import { createSession, getTechniques } from '../../../src/api/endpoints'
import { getApiErrorMessage } from '../../../src/api/client'
import { formatDateWithWeekday } from '../../../src/lib/dates'
import { SUBJECT_LABELS, TECHNIQUE_CATEGORY_COLORS, TECHNIQUE_CATEGORY_LABELS } from '../../../src/lib/labels'
import { colors, fontSize, radius, spacing, touchTarget } from '../../../src/theme'

const SUBJECT_OPTIONS = Object.entries(SUBJECT_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/**
 * Alta de sesión (POST /sessions). `teacherId` no se envía: el backend lo toma
 * del JWT. Si el guardado falla, el error se muestra dentro de la pantalla y
 * el formulario conserva todo lo capturado para reintentar.
 */
export default function NewSessionScreen() {
  const router = useRouter()

  // Catálogo de técnicas (variable independiente del estudio).
  const [techniques, setTechniques] = useState(null)
  const [techniquesError, setTechniquesError] = useState(null)

  // Datos del formulario.
  const [techniqueId, setTechniqueId] = useState(null)
  const [subject, setSubject] = useState(null)
  const [date, setDate] = useState(() => new Date())
  const [notes, setNotes] = useState('')

  // Estado de la interacción.
  const [showPicker, setShowPicker] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const loadTechniques = useCallback(async () => {
    setTechniquesError(null)
    try {
      setTechniques(await getTechniques())
    } catch (err) {
      setTechniquesError(getApiErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    void loadTechniques()
  }, [loadTechniques])

  const techniqueOptions = useMemo(
    () =>
      (techniques ?? []).map((technique) => ({
        value: technique.id,
        label: technique.name,
        description: TECHNIQUE_CATEGORY_LABELS[technique.category] ?? technique.category,
        color: TECHNIQUE_CATEGORY_COLORS[technique.category] ?? colors.otra,
      })),
    [techniques],
  )

  const handleDateChange = (event, selectedDate) => {
    // En Android el picker es un diálogo: se cierra tanto al aceptar como al
    // cancelar. En iOS es un calendario inline que se deja abierto.
    if (Platform.OS === 'android') setShowPicker(false)
    if (event.type !== 'dismissed' && selectedDate) setDate(selectedDate)
  }

  const handleSave = async () => {
    setAttempted(true)
    if (!techniqueId || !subject) return

    setSaving(true)
    setSaveError(null)
    try {
      const session = await createSession({
        techniqueId,
        subject,
        sessionDate: date.toISOString(),
        notes: notes.trim() || undefined,
      })
      // Se encadena directo a capturar calificaciones (como hace la web): es
      // lo que el docente va a hacer enseguida al terminar la clase. Con
      // `replace`, el botón de atrás regresa a la lista y no al formulario ya
      // enviado.
      router.replace(`/sesiones/${session.id}/calificaciones`)
    } catch (err) {
      // El formulario conserva lo capturado: solo se muestra el error.
      setSaveError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (techniques === null && !techniquesError) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Cargando técnicas de enseñanza…" />
      </Screen>
    )
  }

  return (
    <Screen>
      <ErrorMessage message={techniquesError} onRetry={loadTechniques} />

      <Field
        label="Técnica de enseñanza"
        error={attempted && !techniqueId ? 'Elige la técnica que aplicaste en la clase' : null}
      >
        <Select
          value={techniqueId}
          options={techniqueOptions}
          onChange={setTechniqueId}
          placeholder="Selecciona la técnica"
          disabled={!techniques?.length}
        />
      </Field>

      <Field
        label="Materia"
        error={attempted && !subject ? 'Elige la materia de la sesión' : null}
      >
        <Select
          value={subject}
          options={SUBJECT_OPTIONS}
          onChange={setSubject}
          placeholder="Selecciona la materia"
        />
      </Field>

      <Field label="Fecha de la sesión" hint="Por defecto es hoy. Tócala para cambiarla.">
        <Pressable
          onPress={() => setShowPicker((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel={`Fecha de la sesión: ${formatDateWithWeekday(date)}`}
          style={({ pressed }) => [styles.dateTrigger, pressed && styles.pressed]}
        >
          <Text style={styles.dateText}>{formatDateWithWeekday(date)}</Text>
          <Text style={styles.dateAction}>{showPicker && Platform.OS === 'ios' ? 'Listo' : 'Cambiar'}</Text>
        </Pressable>
        {showPicker ? (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            // La sesión se registra al terminar la clase: no hay fechas futuras.
            maximumDate={new Date()}
            onChange={handleDateChange}
            themeVariant="light"
            accentColor={colors.primary}
            locale="es-MX"
          />
        ) : null}
      </Field>

      <Field label="Notas (opcional)" hint="Observaciones generales de la clase">
        <Input
          value={notes}
          onChangeText={setNotes}
          placeholder="Ej. Se trabajó con material concreto…"
          multiline
          numberOfLines={4}
          style={styles.notes}
        />
      </Field>

      <ErrorMessage message={saveError} onRetry={handleSave} />

      <Button title="Guardar sesión" onPress={handleSave} loading={saving} />
      <Button title="Cancelar" variant="outline" onPress={() => router.back()} disabled={saving} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  dateTrigger: {
    minHeight: touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  dateAction: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
  notes: {
    minHeight: touchTarget * 2,
    textAlignVertical: 'top',
  },
})
