# Contexto: App móvil USAER 45J — estado actual y trabajo pendiente

> Documento de traspaso. Describe **qué existe ya**, **cómo está construido** y **qué falta**,
> para que otra persona (o un asistente de IA) continúe el desarrollo sin volver a investigar
> el backend.
>
> Última actualización: julio de 2026. Base ya funcionando y probada en iPhone con Expo Go.

---

## 1. Qué es este proyecto

Cliente **móvil** (React Native + Expo + **JavaScript**, sin TypeScript) del *Sistema
informático orientado al análisis de resultados de alumnos de educación especial*, del
programa **USAER 45J**, primaria "Niños Héroes", Santiago Papasquiaro, Durango.

Es parte del **Proyecto Integrador II** (UTD 6°B BIS, equipo "Estrategas de la Recolección").
El sistema completo es el instrumento de recolección de un estudio mixto que compara tres
técnicas de enseñanza (**Visual / Lúdica / Repetición**) midiendo rendimiento académico
(calificaciones 0–10 en Lectura y Matemáticas) y conducta (rúbricas de 4 criterios).

**Para qué sirve la app móvil:** que el docente capture datos **desde el aula**, con el
teléfono, justo al terminar la clase — en vez de tener que sentarse en una laptop. Y que
tenga a la mano los pictogramas y el tablero de comunicación de ARASAAC.

### Relación con el resto del sistema

La app es **un cliente más de la misma API REST**; **no requiere cambios en el backend**.

| Repo | Qué es | Dónde está desplegado |
|---|---|---|
| `backend` | NestJS 11 + Prisma 6.19.2 + PostgreSQL. La API que consume esta app. | `https://usaer45back-production.up.railway.app` (Swagger en `/api/docs`) |
| `analytics-service` | FastAPI (pandas/scipy). Estadística interna. **La app móvil NO lo llama.** | Railway |
| `USAER45_Web` | React 19 + Vite + Tailwind + shadcn/ui. Web ya terminada. | Vercel |
| `USAER45_Movil` | **Este proyecto.** | — (desarrollo local con Expo Go) |

> `USAER45_Web` es la mejor referencia de cómo se consume cada endpoint. Ver
> `src/lib/api.ts`, `src/stores/*.ts` y `src/types/index.ts`. Varias pantallas de esta app son
> la versión móvil de una pantalla que ya existe ahí.

---

## 2. Cómo correrlo

```powershell
cd USAER45_Movil
npm install
Copy-Item .env.example .env    # solo la primera vez
npx expo start
```

Escanear el QR con **Expo Go** (en iPhone, con la cámara del sistema; en Android, desde la
propia app Expo Go). Teléfono y computadora en la misma Wi-Fi; si la red aísla clientes,
`npx expo start --tunnel`.

### ⚠️ El SDK está fijado en Expo 54 a propósito

Expo Go **solo abre proyectos del SDK para el que fue compilado**, y las tiendas sirven la
última versión compatible con el sistema operativo de cada teléfono — que no siempre es la
más reciente. En los equipos de este proyecto, el Expo Go instalado es de **SDK 54**.

Ya se intentó SDK 57 y 56: **ninguno abría**. No subas el SDK sin comprobar antes qué versión
soporta el Expo Go de los teléfonos donde se va a probar. Si algún día hace falta un SDK más
nuevo, la salida es un *development build* (`npx expo run:ios`), que no depende de Expo Go.

Detalle relacionado: **`expo-status-bar` no lleva entrada en `plugins`** de `app.json`. En SDK
54 ese paquete no tiene config plugin y, si se agrega, `expo start` falla con
`PluginError: Unable to resolve a valid config plugin`.

### Usuarios de prueba

Contraseña de los tres: `Usaer45J!2026`

| Correo | Perfil | En la app móvil |
|---|---|---|
| `docente@usaer45j.edu.mx` | DOCENTE | Acceso completo de captura |
| `admin@usaer45j.edu.mx` | ADMIN | Acceso completo de captura (ve a todos los alumnos) |
| `directivo@usaer45j.edu.mx` | DIRECTIVO | **Bloqueado**: la app se lo dice y lo manda a la web |

> **Dato real, no es un bug:** la base de datos de producción tiene **0 alumnos** registrados
> (solo las 4 técnicas de enseñanza sembradas). Por eso el Inicio muestra `0 alumnos
> asignados`. Los alumnos se dan de alta desde la **web** con perfil ADMIN. Si necesitas datos
> para probar la captura, créalos primero ahí.

---

## 3. Decisiones ya tomadas (respétalas salvo que haya buena razón)

| Tema | Decisión |
|---|---|
| Lenguaje | **JavaScript puro.** Sin TypeScript, sin migrar a `.ts`. |
| Roles | Solo **DOCENTE y ADMIN**. `DIRECTIVO` se rechaza en el login. Sin gestión de usuarios ni alta de alumnos: eso es de la web. |
| UI | **Sistema propio con `StyleSheet`** y tokens en `src/theme/`. Sin librerías de UI (nada de Paper, NativeWind, etc.). |
| Navegación | **expo-router** (rutas basadas en archivos). |
| Estado | **Zustand** para la sesión. El resto es estado local de pantalla (`useState`). |
| Red | **Solo en línea.** Si un guardado falla se muestra el error y **el formulario conserva lo capturado** para reintentar. No hay cola offline. |
| Sesión | **`expo-secure-store`** (Keychain/Keystore), no AsyncStorage: son credenciales de acceso a datos de menores (LGPDPPSO Art. 59). |
| Backend | Producción de Railway por defecto, configurable con `EXPO_PUBLIC_API_URL` en `.env`. |

### Criterios de diseño de la interfaz

La app se usa **de pie, con una mano, dentro del salón**:

- Área táctil mínima de **48 dp** (`touchTarget` en `src/theme/index.js`).
- Texto base más grande de lo habitual.
- Los botones se deshabilitan mientras se guarda, para que un doble toque nervioso no
  duplique un registro.
- Los errores se muestran **dentro** de la pantalla, sin sacar al usuario ni perder lo escrito.
- **No se muestra la dirección del servidor en la interfaz** (se quitó a propósito del login y
  de la pantalla de Cuenta). No la vuelvas a agregar.

---

## 4. Estructura del proyecto

```
app/                         Rutas (expo-router, file-based)
├── _layout.js               Dispara restore() de la sesión y monta el Stack raíz
├── login.js                 /login
├── tablero.js               /tablero — pantalla completa, FUERA de las pestañas
└── (app)/                   Área autenticada (guard de sesión + pestañas)
    ├── _layout.js           Guard + <Tabs>
    ├── index.js             Inicio: accesos de captura
    ├── sesiones/
    │   ├── _layout.js       Stack de la pestaña
    │   ├── index.js         Lista de sesiones        ← PENDIENTE
    │   └── nueva.js         Alta de sesión           ← PENDIENTE
    ├── pictogramas.js       Buscador ARASAAC         ← PENDIENTE
    └── cuenta.js            Datos del usuario + cerrar sesión

src/
├── api/
│   ├── client.js            Axios + JWT + interceptor 401 + getApiErrorMessage
│   └── endpoints.js         Una función por endpoint del backend
├── stores/auth.store.js     Sesión (Zustand + expo-secure-store)
├── components/ui/           Screen · Button · Field/Input · Card/ActionCard ·
│                            Feedback (ErrorMessage/LoadingState/EmptyState) ·
│                            StartupScreen · ComingSoon
├── theme/index.js           colors · spacing · radius · fontSize · touchTarget · shadow
└── lib/labels.js            Etiquetas en español de los enums + escala de rúbrica
```

### Cómo funciona la sesión (importante)

1. `app/_layout.js` llama a `restore()` una sola vez; lee el token de SecureStore.
2. Mientras tanto, `restoring === true` y las pantallas muestran `<StartupScreen />`. Esto
   evita que la app parpadee hacia el login cuando ya había sesión.
3. `app/(app)/_layout.js` es el guard: sin token, `<Redirect href="/login" />`.
4. `src/api/client.js` inyecta el JWT en cada petición leyéndolo del store **en el momento de
   la petición** (no al crear el cliente).
5. Si el backend responde **401** con sesión activa, el interceptor llama a `logout()` y el
   guard manda al login solo. Así se maneja el vencimiento del JWT de 8 h.
6. `client.js` y `auth.store.js` se conectan con `configureApiAuth()` para **evitar un ciclo
   de imports**. No importes el store dentro de `client.js`.

---

## 5. Contratos de la API (verificados contra el backend real)

Base URL en `EXPO_PUBLIC_API_URL`. Todo requiere `Authorization: Bearer <token>` salvo el
login. **Todo esto ya está encapsulado en `src/api/endpoints.js`: úsalo, no armes las
peticiones a mano.**

### Detalles que se pierden si se adivinan

- **`POST /grades`** — el body va **envuelto**: `{ grades: [ {...}, {...} ] }`, no el arreglo
  suelto. Es captura por lote, en una sola transacción.
- **`score`** se **envía** como `number` (0–10) pero **regresa como `string`** (es un
  `Decimal(4,2)` de Prisma). Conviértelo antes de hacer cuentas.
- **`POST /sessions`** — **nunca envíes `teacherId`**: el backend lo toma del JWT.
- **`POST /rubrics/:rubricId/records`** — `rubricId` va **en la URL**, no en el body.
- **`GET /students` y `GET /sessions`** — el backend **ya filtra** por el docente del token.
  No filtres otra vez en el cliente.
- **Rúbricas:** el criterio `escala` puede llegar como **objeto** `{min, max, etiquetas}` o
  como **string**. Hay que soportar ambas formas (la web lo hace en
  `src/components/rubrics/RubricCriterionScale.tsx`). Si viene string, usa
  `RUBRIC_SCALE_FALLBACK` de `src/lib/labels.js`.
- **`GET /arasaac/search?term=&skin=`** — devuelve `{ id, keywords[], imageUrl }` con la URL
  del CDN ya armada; se pinta directo con `<Image>`. Manda `skin` solo si no es el valor por
  defecto.
- Los campos de las respuestas son **camelCase** (`fullName`, `sessionDate`, `consentSigned`).
- Las fechas (`sessionDate`, `birthDate`, `consentDate`) son **ISO strings**.

### Endpoints disponibles

| Método | Ruta | Notas |
|---|---|---|
| `POST` | `/auth/login` | Público. → `{ token, user: { id, name, email, role } }`. JWT de 8 h. |
| `GET` | `/students` · `/students/:id` | ADMIN, DOCENTE |
| `GET` | `/techniques` | Las 4 sembradas: Visual, Lúdica, Repetición, Otra |
| `GET`/`POST` | `/sessions` · `/sessions/:id` | ADMIN, DOCENTE |
| `POST` | `/grades` | Lote. `GET /grades/student/:id` para el historial |
| `GET` | `/rubrics` | Rúbricas activas con criterios C1–C4 |
| `POST` | `/rubrics/:id/records` | Evaluación conductual |
| `POST` | `/interviews` | Entrevista semiestructurada |
| `GET` | `/arasaac/search` · `/arasaac/materials/search` · `/arasaac/materials/:id` | Proxy con caché |
| `GET` | `/analytics/summary` | Todos los roles |
| `POST` | `/analytics/comparison` | ADMIN, DIRECTIVO — la app móvil no lo usa |

### Enums

```
Role              ADMIN | DOCENTE | DIRECTIVO
Subject           LECTURA | MATEMATICAS
TechniqueCategory VISUAL | LUDICA | REPETICION | OTRA
NeeType           DEFICIT_ATENCION | DIFICULTAD_APRENDIZAJE |
                  DISCAPACIDAD_INTELECTUAL | TRASTORNO_LENGUAJE | OTRO
```

### Rúbrica de conducta

Escala **Likert de 4 puntos, par a propósito** (sin opción neutra, para evitar el sesgo de
tendencia central que se detectó en el trabajo de campo):

`1 Nunca · 2 Rara vez · 3 Frecuentemente · 4 Siempre`

Criterios sembrados: **C1** Atención sostenida · **C2** Conducta disruptiva ·
**C3** Participación activa · **C4** Seguimiento de instrucciones.

> **C2 es de escala invertida** (más puntaje = más conducta disruptiva). En la app **solo se
> muestra y se guarda tal cual**; la interpretación estadística la hace el analytics-service.
> No inviertas el valor al guardar.

---

## 6. Estado actual

### Ya terminado y probado en teléfono

- Proyecto Expo SDK 54 configurado (expo-router, variables de entorno, plugins).
- Capa de API con JWT, cierre de sesión automático en 401, timeout de 15 s y mensajes de error
  en español (incluido "No se pudo conectar con el servidor").
- Sesión persistente y cifrada, con bloqueo del perfil DIRECTIVO.
- **Login** funcionando contra la API de producción.
- **Inicio** con datos reales (`GET /students`) y accesos a las cuatro tareas del aula.
- **Cuenta** con datos del usuario y cerrar sesión (con confirmación).
- Navegación por pestañas: Inicio · Sesiones · Pictogramas · Cuenta.
- Sistema de componentes propio y tokens de tema.

### Pendiente — las rutas ya existen con un marcador "En construcción"

Están en su **ruta definitiva**, así que solo hay que sustituir el cuerpo de cada pantalla; la
navegación no se toca.

| # | Pantalla | Archivo | Endpoint |
|---|---|---|---|
| 1 | Lista de sesiones | `app/(app)/sesiones/index.js` | `GET /sessions` |
| 2 | Alta de sesión | `app/(app)/sesiones/nueva.js` | `POST /sessions` |
| 3 | Captura de calificaciones | *por crear:* `app/(app)/sesiones/[id]/calificaciones.js` | `POST /grades` |
| 4 | Rúbrica de conducta | *por crear:* `app/(app)/sesiones/[id]/rubrica.js` | `GET /rubrics` + `POST /rubrics/:id/records` |
| 5 | Buscador de pictogramas | `app/(app)/pictogramas.js` | `GET /arasaac/search` |
| 6 | Tablero de comunicación | `app/tablero.js` | `GET /arasaac/search` + `expo-speech` |

**Orden recomendado:** 1 y 2 primero (todo lo demás cuelga de tener una sesión), luego 3, 4,
5 y 6.

### Detalles de cada pantalla pendiente

**1–2. Sesiones.** La lista muestra fecha, materia y técnica (con color por categoría, ver
`TECHNIQUE_CATEGORY_COLORS`), y desde cada sesión se entra a capturar calificaciones o
rúbrica. El alta necesita un **selector** (técnica y materia) y un **selector de fecha**:
`@react-native-community/datetimepicker` ya está instalado, con hoy por defecto. Al guardar,
encadenar directo a calificaciones, como hace la web. Falta crear un componente `Select`
propio (modal con opciones grandes) en `src/components/ui/`.

**3. Calificaciones.** Lista de alumnos con teclado numérico por alumno
(`keyboardType="decimal-pad"`), validación 0–10 en vivo, campo de periodo (formato `2026-1`).
Enviar solo los alumnos con calificación capturada. Referencia:
`USAER45_Web/src/pages/GradeCapturePage.tsx`.

**4. Rúbrica.** En móvil, los 4 niveles van como **botones grandes en fila**, no como un
desplegable: es más rápido y menos propenso a error con el dedo. Observaciones opcionales.

**5–6. ARASAAC.** Las imágenes vienen de URLs públicas del CDN y se cargan con `<Image>`. El
tablero va **a pantalla completa, fuera de las pestañas** (ya está así), con categorías,
constructor de frases y voz con **`expo-speech`**:
`Speech.speak(palabra, { language: 'es-MX', rate: 0.9 })`. Las categorías y opciones de tono
de piel están en `USAER45_Web/src/components/arasaac/board-config.ts`.
La web usa Web Speech API — **eso no existe en móvil**, por eso `expo-speech`.

---

## 7. Cómo verificar tu trabajo

```powershell
npx expo-doctor                              # debe dar 18/18
npx expo export --platform ios --output-dir .tmp-check   # debe compilar sin errores
npx expo start                               # y probar en el teléfono
```

Para cada módulo nuevo: **crear un registro real desde el teléfono** y confirmarlo en la web
(`https://usaer-45-web.vercel.app`) con el mismo usuario. Si aparece en la web, el dato llegó
bien a la base.

---

## 8. Trampas conocidas

- **CORS** no aplica en el teléfono (es del navegador). Solo saldría con Expo Web, que no es
  el objetivo de este cliente.
- **`localhost` no sirve** para apuntar a un backend local: desde el teléfono, `localhost` es
  el propio teléfono. Usa la IP del equipo en la LAN.
- Después de editar `.env` hay que **reiniciar** el servidor de Expo.
- Si algo se comporta raro tras cambiar dependencias: `npx expo start --clear`.
- **No actualices Prisma** en el backend: está fijado en 6.19.2 a propósito. (La app móvil no
  usa Prisma, pero si tocas el backend, respétalo.)
- Las variables `EXPO_PUBLIC_*` **quedan incrustadas en el bundle**. No pongas ahí nada
  secreto: la URL de la API está bien, una contraseña no.

---

## 9. Cumplimiento legal (no es adorno: es parte de la calificación)

El proyecto trata **datos personales de menores con NEE**. Lo que ya se cumple y hay que
mantener:

- **LGPDPPSO Art. 16–18 y 59:** token en almacenamiento cifrado, HTTPS, control de acceso por
  rol, consentimiento del tutor obligatorio para dar de alta a un alumno.
- **Anonimato:** en los instrumentos del estudio los alumnos se identifican como `ALUM-01` a
  `ALUM-10`. No agregues pantallas que expongan diagnósticos junto al nombre sin necesidad.
- **ARASAAC (CC BY-NC-SA):** debe quedar visible la atribución
  *"Pictogramas: ARASAAC — Gobierno de Aragón — Sergio Palao"* en las pantallas que muestren
  pictogramas. **Falta agregarla** en las pantallas 5 y 6.
- **LFDA Art. 101:** autoría declarada en `LICENSE.md`.
