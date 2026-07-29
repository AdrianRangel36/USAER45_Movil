import { ComingSoon } from '../../src/components/ui/ComingSoon'

export default function PictogramsScreen() {
  return (
    <ComingSoon
      title="Pictogramas ARASAAC"
      description="Buscador de pictogramas con selector de tono de piel, para apoyar las sesiones con técnica visual."
      endpoint="GET /arasaac/search?term="
    />
  )
}
