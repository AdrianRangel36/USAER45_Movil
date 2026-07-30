import { StyleSheet, Text, View } from 'react-native'
import { Card } from './Card'
import { formatDateLong } from '../../lib/dates'
import {
  SUBJECT_LABELS,
  TECHNIQUE_CATEGORY_COLORS,
  TECHNIQUE_CATEGORY_LABELS,
} from '../../lib/labels'
import { colors, fontSize, radius, spacing } from '../../theme'

/**
 * Encabezado de solo lectura con los datos de la sesión sobre la que se está
 * capturando. Se muestra en calificaciones y en rúbrica para que el docente
 * confirme de un vistazo que está registrando en la sesión correcta.
 *
 * La materia sale de aquí y no se puede elegir: el backend rechaza una
 * calificación cuya materia no coincida con la de su sesión.
 */
export function SessionHeader({ session }) {
  if (!session) return null

  const category = session.technique?.category
  const accent = TECHNIQUE_CATEGORY_COLORS[category] ?? colors.otra

  return (
    <Card style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <Text style={styles.date}>{formatDateLong(session.sessionDate)}</Text>
        <Text style={styles.subject}>
          {SUBJECT_LABELS[session.subject] ?? session.subject}
        </Text>
        <View style={styles.techniqueRow}>
          <Text style={styles.technique} numberOfLines={1}>
            {session.technique?.name ?? 'Técnica sin nombre'}
          </Text>
          {category ? (
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Text style={styles.badgeText}>
                {TECHNIQUE_CATEGORY_LABELS[category] ?? category}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  accent: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: radius.full,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  date: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  subject: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  technique: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textOnDark,
  },
})
