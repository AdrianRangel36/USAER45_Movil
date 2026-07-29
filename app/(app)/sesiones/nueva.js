import { ComingSoon } from '../../../src/components/ui/ComingSoon'

export default function NewSessionScreen() {
  return (
    <ComingSoon
      title="Nueva sesión"
      description="Formulario para registrar la técnica de enseñanza aplicada, la materia, la fecha y las notas de la clase."
      endpoint="POST /sessions"
    />
  )
}
