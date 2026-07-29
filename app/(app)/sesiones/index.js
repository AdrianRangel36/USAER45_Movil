import { ComingSoon } from '../../../src/components/ui/ComingSoon'

export default function SessionsScreen() {
  return (
    <ComingSoon
      title="Lista de sesiones"
      description="Aquí verás tus sesiones registradas y, desde cada una, podrás capturar las calificaciones y la rúbrica de conducta."
      endpoint="GET /sessions"
    />
  )
}
