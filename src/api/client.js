import axios from 'axios'

/**
 * Cliente HTTP del backend NestJS (USAER45_Back).
 * Port de USAER45_Web/src/lib/api.ts: misma lógica de interceptores para que
 * ambos clientes se comporten igual frente a la API.
 */

const DEFAULT_API_URL = 'https://usaer45back-production.up.railway.app'

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // La red de la escuela es lenta e intermitente: sin timeout, una petición
  // colgada deja el botón "Guardando…" girando para siempre.
  timeout: 15000,
})

/**
 * El store de sesión se registra aquí en lugar de importarse, para evitar el
 * ciclo client -> auth.store -> client. Igual que en la web, el token se lee
 * en el momento de cada petición y no al crear el cliente, para que siempre
 * refleje la sesión vigente.
 */
let getToken = () => null
let onUnauthorized = () => {}

export function configureApiAuth({ getToken: read, onUnauthorized: handle }) {
  getToken = read
  onUnauthorized = handle
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Un 401 con sesión activa significa que el JWT (8 h) expiró: se cierra la
// sesión y el guard de (app)/_layout.js redirige al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest && getToken()) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)

/**
 * Extrae el mensaje de error que envía NestJS ({ message: string | string[] })
 * o devuelve uno genérico. Los errores de red son los más frecuentes en el
 * aula, así que tienen su propio mensaje en lugar del críptico "Network Error".
 */
export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
    if (error.code === 'ECONNABORTED') {
      return 'El servidor tardó demasiado en responder. Revisa tu conexión e inténtalo de nuevo.'
    }
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión a internet.'
    }
  }
  return 'Ocurrió un error inesperado'
}
