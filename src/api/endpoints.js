import { api } from './client'

/**
 * Funciones de acceso a la API, una por endpoint que usa la app.
 *
 * Cada función encapsula la forma EXACTA que espera el backend. Los detalles
 * que aquí se fijan son los que se pierden al escribir la petición a mano
 * (verificados contra USAER45_Back y USAER45_Web/src/stores/*.ts).
 */

// ─── Auth ───────────────────────────────────────────────────────────────────

/** POST /auth/login → { token, user: { id, name, email, role } }. JWT de 8 h. */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

// ─── Alumnos ────────────────────────────────────────────────────────────────

/** GET /students — el backend ya filtra por el docente del JWT. */
export async function getStudents() {
  const { data } = await api.get('/students')
  return data
}

export async function getStudent(id) {
  const { data } = await api.get(`/students/${id}`)
  return data
}

// ─── Técnicas de enseñanza (variable independiente del estudio) ─────────────

/** GET /techniques — category: VISUAL | LUDICA | REPETICION | OTRA. */
export async function getTechniques() {
  const { data } = await api.get('/techniques')
  return data
}

// ─── Sesiones ───────────────────────────────────────────────────────────────

/** GET /sessions — solo las sesiones del docente del JWT. */
export async function getSessions() {
  const { data } = await api.get('/sessions')
  return data
}

export async function getSession(id) {
  const { data } = await api.get(`/sessions/${id}`)
  return data
}

/**
 * POST /sessions. `teacherId` NO se envía: el backend lo toma del JWT.
 * `sessionDate` es un ISO string.
 */
export async function createSession({ techniqueId, subject, sessionDate, notes }) {
  const { data } = await api.post('/sessions', {
    techniqueId,
    subject,
    sessionDate,
    ...(notes ? { notes } : {}),
  })
  return data
}

// ─── Calificaciones ─────────────────────────────────────────────────────────

/**
 * POST /grades — captura por lote en una sola transacción.
 *
 * OJO: el body va ENVUELTO en { grades: [...] }, no es el array suelto.
 * Cada elemento: { studentId, sessionId, subject, score (number 0-10), period }.
 * En la respuesta, `score` regresa como STRING (Decimal(4,2) de Prisma).
 */
export async function createGrades(grades) {
  const { data } = await api.post('/grades', { grades })
  return data
}

/** GET /grades/student/:id — historial con la sesión anidada. */
export async function getGradesByStudent(studentId, filters) {
  const { data } = await api.get(`/grades/student/${studentId}`, { params: filters })
  return data
}

// ─── Rúbricas de conducta ───────────────────────────────────────────────────

/** GET /rubrics — rúbricas activas con sus criterios C1–C4. */
export async function getRubrics() {
  const { data } = await api.get('/rubrics')
  return data
}

/**
 * POST /rubrics/:rubricId/records — evaluación conductual de un alumno.
 * `rubricId` viaja en la URL, nunca en el body.
 * `scores` es un objeto { C1: 1..4, C2: 1..4, C3: 1..4, C4: 1..4 }.
 */
export async function createBehavioralRecord(rubricId, { studentId, sessionId, scores, observations }) {
  const { data } = await api.post(`/rubrics/${rubricId}/records`, {
    studentId,
    sessionId,
    scores,
    ...(observations ? { observations } : {}),
  })
  return data
}

// ─── ARASAAC ────────────────────────────────────────────────────────────────

/**
 * GET /arasaac/search?term=&skin= — proxy con caché del backend.
 * Devuelve [{ id, keywords[], imageUrl }] con la URL del CDN ya armada.
 * `skin` solo se manda cuando no es el tono por defecto.
 */
export async function searchPictograms(term, skin) {
  const { data } = await api.get('/arasaac/search', {
    params: skin && skin !== 'default' ? { term, skin } : { term },
  })
  return data
}

/** GET /arasaac/materials/search?term= — materiales didácticos. */
export async function searchMaterials(term) {
  const { data } = await api.get('/arasaac/materials/search', { params: { term } })
  return data
}

export async function getMaterial(id) {
  const { data } = await api.get(`/arasaac/materials/${id}`)
  return data
}
