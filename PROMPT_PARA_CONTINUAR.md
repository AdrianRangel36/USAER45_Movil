# Prompt para continuar el desarrollo

Copia el bloque de abajo y pégalo como primer mensaje en Claude Code (u otro asistente),
teniendo abierta la carpeta `USAER45_Movil`.

> **Antes de pegarlo:** ajusta la línea marcada con `👉` para elegir qué módulo vas a
> construir. Si vas a hacer el primero, déjala como está.

---

```
Voy a continuar el desarrollo de una app móvil en React Native + Expo + JavaScript que ya
está funcionando. Es el cliente móvil del Sistema USAER 45J, un proyecto escolar (Proyecto
Integrador II, UTD 6°B BIS) para que docentes de educación especial capturen datos desde el
aula.

PRIMERO lee el archivo CONTEXTO_APP_MOVIL.md que está en la raíz de este proyecto. Tiene todo
lo que necesitas: la arquitectura, las decisiones ya tomadas, los contratos exactos de la API
(verificados contra el backend real), lo que ya está hecho y lo que falta. No repitas esa
investigación.

Después revisa el código existente para entender las convenciones antes de escribir nada:
- src/api/endpoints.js  (todas las llamadas al backend ya están encapsuladas aquí)
- src/api/client.js     (axios + JWT + manejo de errores)
- src/components/ui/    (el sistema de componentes propio)
- src/theme/index.js    (los tokens de color, espaciado y tipografía)
- app/(app)/index.js    (una pantalla ya terminada, úsala como modelo de estilo)

👉 TAREA: implementa la pantalla "Lista de sesiones" (app/(app)/sesiones/index.js) y luego
"Alta de sesión" (app/(app)/sesiones/nueva.js). Ahora mismo las dos son marcadores con el
componente ComingSoon; hay que sustituir su contenido.

Reglas que debes respetar (ya están decididas, no las cambies):
- JavaScript puro, NADA de TypeScript.
- Estilos con StyleSheet y los tokens de src/theme. Sin librerías de UI ni NativeWind.
- Reutiliza los componentes de src/components/ui en vez de crear otros nuevos, salvo que de
  verdad falte alguno (por ejemplo, un Select propio: ese sí hay que crearlo).
- Usa las funciones de src/api/endpoints.js. No armes peticiones HTTP a mano.
- Expo SDK 54: NO actualices el SDK ni las dependencias. Está fijado a propósito porque es la
  versión que soporta el Expo Go de nuestros teléfonos.
- Comentarios y textos de la interfaz en español.
- La app se usa de pie dentro del salón: áreas táctiles grandes (mínimo 48 dp), y si un
  guardado falla, muestra el error SIN perder lo que el usuario ya capturó.
- No muestres la dirección del servidor en ninguna pantalla (se quitó a propósito).

Antes de programar, dime tu plan. Cuando termines, verifica que compila con:
  npx expo export --platform ios --output-dir .tmp-check
y avísame para que yo lo pruebe en el teléfono con `npx expo start`.
```

---

## Cómo seguir después

Para cada módulo siguiente, reusa el mismo prompt cambiando **solo** la línea de `👉 TAREA`.
El orden recomendado (está explicado en `CONTEXTO_APP_MOVIL.md`, sección 6):

1. **Lista de sesiones + Alta de sesión** — todo lo demás depende de que exista una sesión.
   ```
   👉 TAREA: implementa la pantalla "Lista de sesiones" (app/(app)/sesiones/index.js) y luego
   "Alta de sesión" (app/(app)/sesiones/nueva.js).
   ```

2. **Captura de calificaciones** — hay que crear la ruta.
   ```
   👉 TAREA: crea la pantalla de captura de calificaciones en
   app/(app)/sesiones/[id]/calificaciones.js, a la que se llega desde una sesión. Ojo con el
   contrato de POST /grades descrito en CONTEXTO_APP_MOVIL.md (el body va envuelto en
   { grades: [...] }).
   ```

3. **Rúbrica de conducta** — hay que crear la ruta.
   ```
   👉 TAREA: crea la pantalla de rúbrica de conducta en app/(app)/sesiones/[id]/rubrica.js.
   Los 4 niveles de la escala deben ser botones grandes en fila, no un desplegable.
   ```

4. **Buscador de pictogramas**
   ```
   👉 TAREA: implementa el buscador de pictogramas ARASAAC en app/(app)/pictogramas.js.
   Incluye la atribución obligatoria de ARASAAC (licencia CC BY-NC-SA).
   ```

5. **Tablero de comunicación**
   ```
   👉 TAREA: implementa el tablero de comunicación en app/tablero.js: cuadrícula de
   pictogramas por categoría, constructor de frases y voz en español con expo-speech.
   Incluye la atribución obligatoria de ARASAAC.
   ```

## Recordatorios para quien continúe

- **Para probar la captura hacen falta alumnos.** La base de producción tiene 0 registrados;
  se dan de alta desde la web (`https://usaer-45-web.vercel.app`) con el usuario `admin`.
- **Verifica en la web** que el dato que guardaste desde el teléfono aparezca allá. Es la
  prueba de que llegó bien a la base de datos.
- Si Expo Go dice *"versión incompatible"*, **no subas el SDK**: revisa la sección del SDK 54
  en `CONTEXTO_APP_MOVIL.md`.
