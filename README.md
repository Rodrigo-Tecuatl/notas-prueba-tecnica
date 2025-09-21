# 📒 Backend de Notas con Autenticación (Node.js + Express + MongoDB)

Este backend provee un API REST para registro/login de usuarios y CRUD de notas con soporte para imágenes. Está diseñado para usarse con una app cliente (por ejemplo, tu app Expo).

---

## 🚀 Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [pnpm](https://pnpm.io/es/) (v9 o superior)
- [MongoDB](https://www.mongodb.com/) en ejecución local o en la nube (por ejemplo, MongoDB Atlas)
- Red local compartida con tu dispositivo móvil (si pruebas desde Expo en un teléfono físico)

---

## 📂 Estructura de carpetas
```
src/
├── controllers/   # Lógica de negocio (auth, notes)
├── middleware/    # Middlewares (auth, manejo de errores)
├── models/        # Modelos Mongoose (User, Note)
├── routes/        # Rutas Express (auth, notes, sync)
├── seeds/         # Datos de ejemplo para inicializar la DB
├── uploads/       # Carpeta donde se guardan las imágenes
└── server.ts      # Punto de entrada del servidor

```

## 🌱 Ejecutar seeds (datos de prueba)

En src/seeds/seed.ts incluye datos de ejemplo de usuarios y notas. Para ejecutarlo:

```npm run seed```

(Asegúrate de que MongoDB esté corriendo y que el .env esté configurado antes de correr los seeds).

## ▶️ Levantar el servidor

Modo desarrollo con nodemon:

```pnpm run dev```


El servidor escuchará en todas las interfaces (0.0.0.0) y mostrará en consola las IPs accesibles desde la red local, por ejemplo:

Accesible desde LAN en: http://192.168.1.42:3000
Ruta ping -> GET /ping

# 📱 App Expo - Notas con Autenticación y Sincronización

Esta es la aplicación cliente en **React Native** usando **Expo** para consumir el backend de notas con autenticación. Permite iniciar sesión, gestionar notas (crear, editar, eliminar) y sincronizar datos con el servidor.

---

## 🚀 Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior  
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)  
- [Expo CLI](https://docs.expo.dev/) (se instala automáticamente con `npx expo start`)  
- Dispositivo físico o emulador con la app **Expo Go** instalada.  
- Backend corriendo y accesible en la misma red Wi-Fi.  

---

## 📂 Estructura de carpetas (relevante)

```
conf/
└── conf.ts # Configuración del endpoint y modo offline
src/
├── components/ # Componentes UI
├── context/ # Providers (Auth)
├── services/ # Lógica de red (AuthService, NoteService)
├── app/ # Pantallas principales
```


---

## ⚙️ Configuración del endpoint

En la raíz del proyecto tienes el archivo:

```ts
// conf/conf.ts
// base del endpoint
export const baseUrl = (uri: string) => `http://0.0.0.0:1234${uri}`

// marcar true, si quiere utilizar la aplicación sin la api,
// con esto puedes acceder con cualquier usuario y contraseña
export const useWithoutApi = false
```

## ▶️ Levantar el proyecto
```
npx expo start
```