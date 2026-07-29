# USAER 45J — App móvil

Cliente móvil (React Native + Expo + JavaScript) del *Sistema informático orientado al
análisis de resultados de alumnos de educación especial*, programa **USAER 45J**, primaria
"Niños Héroes", Santiago Papasquiaro, Durango.

Está pensada para el **trabajo de campo del docente**: registrar la sesión, capturar
calificaciones y rúbricas de conducta desde el aula, y tener a la mano los pictogramas y el
tablero de comunicación de ARASAAC.

Consume la **misma API REST** que la web del proyecto; no requiere cambios en el backend.

---

## Requisitos

- **Node.js 20+** (probado con 24.15).
- La app **Expo Go** instalada en tu teléfono ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) · [iOS](https://apps.apple.com/app/expo-go/id982107779)).
- Teléfono y computadora **en la misma red Wi-Fi**.

> ### ⚠️ Por qué el proyecto está fijado en Expo SDK 54
>
> Expo Go **solo puede abrir proyectos del SDK para el que fue compilado**, y la versión de
> Expo Go que instalas puede no ser la más nueva: las tiendas sirven la última versión
> compatible con el sistema operativo de cada teléfono. En los equipos del proyecto, el Expo
> Go instalado es de **SDK 54**, así que el proyecto está fijado ahí.
>
> **Antes de subir el SDK**, comprueba en el propio Expo Go qué versión soporta (aparece en
> su pantalla de inicio o en Ajustes). Si el proyecto usa un SDK más nuevo que el de tu Expo
> Go, dirá *"versión incompatible"* y puede que **no exista actualización** que lo arregle:
> ya sea porque tu iOS/Android no admite la versión más reciente, o porque Expo todavía no la
> publica en las tiendas.
>
> Alternativa a futuro, si el equipo necesita un SDK más nuevo: crear un *development build*
> (`npx expo run:ios` / `run:android` o EAS Build), que no depende de Expo Go.

## Cómo correr la app

```powershell
cd USAER45_Movil
npm install
Copy-Item .env.example .env   # solo la primera vez
npx expo start
```

Se abre una terminal con un **código QR**:

- **Android:** ábrelo desde la propia app Expo Go ("Scan QR code").
- **iOS:** escanéalo con la cámara del sistema.

Si el teléfono no logra conectarse (redes que aíslan a los clientes entre sí, como muchas
Wi-Fi escolares), arranca con un túnel:

```powershell
npx expo start --tunnel
```

Y si algo se comporta raro después de cambiar dependencias o variables de entorno:

```powershell
npx expo start --clear
```


## Configuración

Todo vive en `.env` (ver `.env.example`). Solo las variables con prefijo `EXPO_PUBLIC_`
llegan al bundle.

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del backend. Por defecto, producción en Railway. |

Para apuntar a un backend local, usa la **IP de tu computadora en la LAN**, nunca
`localhost`: desde el teléfono, `localhost` es el propio teléfono.

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

> Después de editar `.env` hay que reiniciar el servidor de Expo.

## Estructura

```
app/                        Rutas (expo-router, file-based)
├── _layout.js              Restaura la sesión guardada y monta el Stack raíz
├── login.js                /login
├── tablero.js              /tablero — pantalla completa, fuera de las pestañas
└── (app)/                  Área autenticada (guard de sesión + pestañas)
    ├── _layout.js
    ├── index.js            Inicio: accesos de captura
    ├── sesiones/           Pestaña Sesiones (pila propia)
    ├── pictogramas.js
    └── cuenta.js

src/
├── api/
│   ├── client.js           Axios + JWT + manejo de errores
│   └── endpoints.js        Una función por endpoint del backend
├── stores/auth.store.js    Sesión (Zustand + expo-secure-store)
├── components/ui/          Sistema de componentes propio
├── theme/index.js          Colores, espaciados, tipografía
└── lib/labels.js           Etiquetas en español de los enums
```

## Notas de desarrollo

- **La sesión se guarda en `expo-secure-store`** (Keychain/Keystore), no en AsyncStorage:
  el token da acceso a datos de menores con NEE (LGPDPPSO Art. 59).
- **El JWT dura 8 horas.** Al expirar, el backend responde 401, el interceptor de
  `src/api/client.js` cierra la sesión y la app vuelve al login sola.
- **`POST /grades` recibe el arreglo envuelto**: `{ grades: [...] }`. Ya está encapsulado en
  `createGrades()`; no armes la petición a mano.
- **`score` regresa como string** en las respuestas (`Decimal(4,2)` de Prisma): conviértelo
  antes de hacer cuentas.
- **CORS no aplica** en el teléfono (es un concepto del navegador). Solo aparecería al usar
  Expo Web, que no es el objetivo de este cliente.
- **`teacherId` nunca se envía** al crear una sesión: el backend lo toma del JWT.

## Estado actual

Listo:

- Proyecto configurado (Expo SDK 54, React Native 0.81.5, expo-router 6, variables de entorno).
- Capa de API con JWT, manejo de 401 y mensajes de error en español.
- Sesión persistente y cifrada, con restricción por perfil.
- Login, Inicio (con datos reales del backend), Cuenta y navegación por pestañas.

Pendiente (Etapa 2), con las rutas ya creadas como marcadores:

- Lista y alta de sesiones · Captura de calificaciones · Rúbrica de conducta ·
  Buscador de pictogramas · Tablero de comunicación con voz.

## Documentos del proyecto

| Archivo | Para qué sirve |
|---|---|
| [CONTEXTO_APP_MOVIL.md](CONTEXTO_APP_MOVIL.md) | **Traspaso completo**: arquitectura, decisiones, contratos de la API y trabajo pendiente. Léelo antes de tocar código. |
| [PROMPT_PARA_CONTINUAR.md](PROMPT_PARA_CONTINUAR.md) | Prompt listo para continuar el desarrollo con un asistente de IA. |
| [LICENSE.md](LICENSE.md) | Autoría, licencias de terceros y atribución de ARASAAC. |
