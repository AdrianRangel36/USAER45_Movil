import { useCallback, useRef, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import { Button } from '../../../src/components/ui/Button'
import { Card } from '../../../src/components/ui/Card'
import { EmptyState, ErrorMessage, LoadingState } from '../../../src/components/ui/Feedback'
import { Screen } from '../../../src/components/ui/Screen'
import { getSessions } from '../../../src/api/endpoints'
import { getApiErrorMessage } from '../../../src/api/client'
import { formatDateLong } from '../../../src/lib/dates'
import {
  SUBJECT_LABELS,
  TECHNIQUE_CATEGORY_COLORS,
  TECHNIQUE_CATEGORY_LABELS,
} from '../../../src/lib/labels'
import { colors, fontSize, radius, spacing } from '../../../src/theme'

/**
 * Lista de sesiones del docente (GET /sessions; el backend ya filtra por el
 * JWT). Se recarga cada vez que la pantalla recupera el foco, para que la
 * sesión recién creada en "Nueva sesión" aparezca sin pasos extra.
 */
export default function SessionsScreen() {
  const router = useRouter()

  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const loadedOnce = useRef(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await getSessions()
      // Las más recientes primero: es la sesión sobre la que se va a capturar.
      const ordered = [...data].sort(
        (a, b) => new Date(b.sessionDate) - new Date(a.sessionDate),
      )
      setSessions(ordered)
      loadedOnce.current = true
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  // Primera carga: aún no hay nada que mostrar.
  if (!loadedOnce.current && !error) {
    return (
      <Screen scroll={false}>
        <LoadingState label="Cargando tus sesiones…" />
      </Screen>
    )
  }

  // Falló la primera carga: solo el error con reintento.
  if (!loadedOnce.current && error) {
    return (
      <Screen scroll={false} contentStyle={styles.padded}>
        <ErrorMessage message={error} onRetry={load} />
      </Screen>
    )
  }

  return (
    <Screen scroll={false}>
      <FlatList
        data={sessions}
        keyExtractor={(session) => String(session.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Button title="Registrar nueva sesión" onPress={() => router.push('/sesiones/nueva')} />
            <ErrorMessage message={error} onRetry={load} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Todavía no hay sesiones"
            description="Registra la primera con el botón de arriba: es el punto de partida para capturar calificaciones y rúbricas."
          />
        }
        renderItem={({ item }) => <SessionCard session={item} router={router} />}
      />
    </Screen>
  )
}

/**
 * Tarjeta de una sesión: fecha, materia y técnica con el color de su
 * categoría, más las dos acciones que el docente hace sobre una sesión:
 * capturar calificaciones y llenar la rúbrica de conducta.
 */
function SessionCard({ session, router }) {
  const category = session.technique?.category
  const accent = TECHNIQUE_CATEGORY_COLORS[category] ?? colors.otra

  return (
    <Card style={styles.session}>
      <View style={styles.sessionTop}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={styles.sessionBody}>
          <Text style={styles.sessionDate}>{formatDateLong(session.sessionDate)}</Text>
          <Text style={styles.sessionSubject}>
            {SUBJECT_LABELS[session.subject] ?? session.subject}
          </Text>
          <View style={styles.techniqueRow}>
            <Text style={styles.techniqueName} numberOfLines={1}>
              {session.technique?.name ?? 'Técnica sin nombre'}
            </Text>
            {category ? (
              <View style={[styles.categoryBadge, { backgroundColor: accent }]}>
                <Text style={styles.categoryBadgeText}>
                  {TECHNIQUE_CATEGORY_LABELS[category] ?? category}
                </Text>
              </View>
            ) : null}
          </View>
          {session.notes ? (
            <Text style={styles.notes} numberOfLines={2}>
              {session.notes}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.sessionActions}>
        <Button
          title="Calificaciones"
          variant="outline"
          style={styles.sessionAction}
          onPress={() => router.push(`/sesiones/${session.id}/calificaciones`)}
        />
        <Button
          title="Rúbrica"
          variant="outline"
          style={styles.sessionAction}
          onPress={() => router.push(`/sesiones/${session.id}/rubrica`)}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  session: {
    gap: spacing.lg,
  },
  sessionTop: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sessionAction: {
    flex: 1,
  },
  accent: {
    width: 6,
    alignSelf: 'stretch',
    borderRadius: radius.full,
  },
  sessionBody: {
    flex: 1,
    gap: spacing.xs,
  },
  sessionDate: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  sessionSubject: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  techniqueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  techniqueName: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  categoryBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  notes: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
})