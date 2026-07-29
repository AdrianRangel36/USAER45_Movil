import * as SecureStore from 'expo-secure-store'
import { create } from 'zustand'
import { configureApiAuth, getApiErrorMessage } from '../api/client'
import * as apiEndpoints from '../api/endpoints'

/**
 * Sesión del usuario.
 *
 * A diferencia de la web (localStorage), aquí el token se guarda en
 * expo-secure-store: Keychain en iOS y Keystore en Android. Se trata de
 * credenciales que dan acceso a datos de menores con NEE, así que aplica el
 * Art. 59 de la LGPDPPSO y el criterio de cifrado en reposo del proyecto.
 */

const TOKEN_KEY = 'usaer45.token'
const USER_KEY = 'usaer45.user'

/** Roles que pueden usar la app móvil (herramienta de captura en aula). */
const ALLOWED_ROLES = ['DOCENTE', 'ADMIN']

const DIRECTIVO_MESSAGE =
  'Esta app está pensada para la captura en el aula. Con el perfil Directivo, consulta la analítica y los reportes en la versión web del sistema.'

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  /** true hasta que se termina de leer la sesión guardada al abrir la app. */
  restoring: true,
  loading: false,
  error: null,

  /** Lee la sesión guardada. Se llama una sola vez, desde app/_layout.js. */
  async restore() {
    try {
      const [token, rawUser] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ])
      if (token && rawUser) {
        set({ token, user: JSON.parse(rawUser) })
      }
    } catch {
      // Un almacén ilegible o corrupto no debe impedir abrir la app: se
      // continúa sin sesión y el usuario simplemente vuelve a entrar.
      await clearStoredSession()
    } finally {
      set({ restoring: false })
    }
  },

  async login(email, password) {
    set({ loading: true, error: null })
    try {
      const data = await apiEndpoints.login(email.trim(), password)

      if (!ALLOWED_ROLES.includes(data.user.role)) {
        set({ loading: false, error: DIRECTIVO_MESSAGE })
        return false
      }

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, data.token),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user)),
      ])
      set({ token: data.token, user: data.user, loading: false, error: null })
      return true
    } catch (error) {
      set({ token: null, user: null, loading: false, error: getApiErrorMessage(error) })
      return false
    }
  },

  async logout() {
    await clearStoredSession()
    set({ token: null, user: null, error: null })
  },

  clearError() {
    set({ error: null })
  },

  hasRole(...roles) {
    const role = get().user?.role
    return role !== undefined && roles.includes(role)
  },
}))

async function clearStoredSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {}),
  ])
}

// Conecta el cliente HTTP con la sesión (evita el ciclo de imports):
// el token se lee en cada petición y un 401 cierra la sesión.
configureApiAuth({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    void useAuthStore.getState().logout()
  },
})
