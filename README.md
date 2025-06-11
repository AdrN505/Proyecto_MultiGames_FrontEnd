# 🎮 MultiGames Frontend & Socket.IO Server

Una aplicación frontend completa en Vue.js 3 con servidor Socket.IO para una plataforma de juegos sociales en tiempo real. Incluye sistema de autenticación, chat en tiempo real, gestión social y múltiples juegos interactivos.

## 📋 Tabla de Contenidos

* [Descripción](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-descripci%C3%B3n)
* [Requisitos del Sistema](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#%EF%B8%8F-requisitos-del-sistema)
* [Instalación Paso a Paso](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-instalaci%C3%B3n-paso-a-paso)
* [Configuración](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-configuraci%C3%B3n)
* [Estructura del Proyecto](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-estructura-del-proyecto)
* [Scripts Disponibles](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-scripts-disponibles)
* [Servidor Socket.IO](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-servidor-socketio)
* [Componentes Principales](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-componentes-principales)
* [Testing](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-testing)
* [Despliegue](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-despliegue)
* [Solución de Problemas](https://claude.ai/chat/bfdfcc05-91b8-499b-aa10-79eae8b1b2d7#-soluci%C3%B3n-de-problemas)

## 🎯 Descripción

**MultiGames Frontend** es una aplicación web moderna construida con Vue.js 3 que ofrece:

* **Múltiples juegos interactivos** (Tres en Raya, Ahorcado, Buscaminas, Ajedrez, Tetris, Puzzle, Wordle)
* **Chat en tiempo real** con Socket.IO
* **Sistema social completo** (amigos, bloqueos, solicitudes)
* **Estadísticas y perfiles** de usuario
* **Diseño responsive** optimizado para móviles
* **Autenticación segura** con tokens
* **UI moderna** con Vuetify 3

## ⚙️ Requisitos del Sistema

### Software Necesario

* **Node.js** : 18.x o superior
* **npm** : 9.x o superior (o yarn 1.22+)
* **Git** : Para clonar el repositorio

### Verificar Instalación

```bash
# Verificar versiones
node --version    # v18.0.0+
npm --version     # 9.0.0+
git --version     # 2.0.0+
```

## 🚀 Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

```bash
# Clonar repositorio
git clone [URL_DEL_REPOSITORIO] multigames-frontend
cd multigames-frontend

# O descomprimir ZIP en carpeta 'multigames-frontend'
```

### 2. Instalar Dependencias del Frontend

```bash
# Instalar dependencias
npm install

# O con yarn
yarn install

npm install @mdi/font \
cors \
express \
jsonwebtoken \
mysql2 \
socket.io \
socket.io-client \
vue-router \
vuetify
```

**Si hay errores de dependencias:**

```bash
# Limpiar cache y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# O forzar resolución
npm install --legacy-peer-deps
```

### 3. Configurar URLs del Frontend

#### Crear archivo de configuración:

```bash
# Crear directorio config si no existe
mkdir -p src/config

# Crear archivo de configuración
touch src/config/index.js
```

#### Configurar `src/config/index.js`:

```javascript
// src/config/index.js
export const config = {
  IP_PROPIA: 'http://IP_LOCAL',           // Tu IP local
  API_BACKEND_URL: 'http://localhost:8000',   // Backend Laravel
  API_SOCKET_URL: 'http://localhost:3001',    // Servidor Socket.IO
  API_FRONTEND_URL: 'http://localhost:5173',  // Frontend Vue.js
};
```

**📝 Importante:** Cambia `IP_LOCAL` por tu IP local real o localhost.

### 4. Instalar y Configurar Servidor Socket.IO

#### Crear directorio del servidor:

```bash
# Desde la raíz del proyecto
mkdir socket-server
cd socket-server
```

#### Inicializar proyecto Node.js:

```bash
npm init -y
```

#### Instalar dependencias del servidor:

```bash
npm install express socket.io cors
npm install --save-dev nodemon
```

### 5. Crear Estructura de Archivos del Frontend

#### Estructura principal:

```
multigames-frontend/
├── src/
│   ├── components/
│   │   ├── Header.vue                 # Navegación principal
│   │   ├── Main.vue                   # Página principal
│   │   ├── GameCard.vue               # Tarjetas de juegos
│   │   ├── WelcomeBanner.vue          # Banner de bienvenida
│   │   ├── auth/
│   │   │   └── Profile.vue            # Perfil de usuario
│   │   ├── chat/
│   │   │   └── PrivateChat.vue        # Chat en tiempo real
│   │   ├── common/buttons/
│   │   │   ├── BotonLogin.vue         # Botón de login/registro
│   │   │   └── UsersBoton.vue         # Gestión de usuarios
│   |	├── config/                      # Configuración centralizada
│   |	|	└── index.js                      # Configuración centralizada
│   │   ├── juegos/
│   │   │   ├── TresEnRaya.vue         # Tres en Raya
│   │   │   ├── Ahorcado.vue           # Ahorcado
│   │   │   ├── Buscaminas.vue         # Buscaminas
│   │   │   ├── Ajedrez.vue            # Ajedrez
│   │   │   ├── Tetris.vue             # Tetris
│   │   │   ├── Puzzle.vue             # Puzzle
│   │   │   └── Wordle.vue             # Wordle
│   │   └── admin/
│   │       └── GestorDeJuegos.vue     # Panel admin
│   ├── services/
│   │   ├── auth.js                    # Servicio de autenticación
│   │   ├── user.js                    # Servicio de usuarios
│   │   ├── chat.js                    # Servicio de chat
│   │   ├── games.js                   # Servicio de juegos
│   │   ├── gameService.js             # Estadísticas de juegos
│   │   └── relationships.js           # Gestión social
│   ├── router/
│   │   └── index.js                   # Configuración de rutas
│   ├── assets/
│   │   └── styles/
│   │       ├── main.css               # Estilos principales
│   │       └── profile.css            # Estilos del perfil
│   ├── App.vue                        # Componente raíz
│   └── main.js                        # Punto de entrada
├── server.js                      # Servidor Socket.IO
├── public/
├── package.json
├── vite.config.js
├── .env.local
└── README.md
```

### 6. Crear Archivos de Configuración

#### vite.config.js:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true, // Para acceso desde la red local
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

#### Crear config/index.js:

```javascript
// src/config/index.js
export const config = {
  IP_PROPIA: 'http://192.168.0.33',           // Tu IP local
  API_BACKEND_URL: 'http://localhost:8000',   // Backend Laravel
  API_SOCKET_URL: 'http://localhost:3001',    // Servidor Socket.IO
  API_FRONTEND_URL: 'http://localhost:5173',  // Frontend Vue.js
}
```

#### main.js:

```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  }
})

// Router
import router from './router'

createApp(App).use(vuetify).use(router).mount('#app')
```

### 7. Iniciar los Servidores

#### Terminal 1 - Frontend:

```bash
# Desde la raíz del proyecto
npm run dev

#En caso de ejecutar host
npm run dev -- --host

# Estará disponible en: http://localhost:5173
```

#### Terminal 2 - Servidor Socket.IO:

```bash
# Cambiar al directorio del servidor
cd socket-server

# Iniciar en modo desarrollo
npm run dev

# Estará disponible en: http://localhost:3001
```

## 🔧 Configuración

### Archivo de Configuración Centralizada

#### Frontend (src/config/index.js):

```javascript
// src/config/index.js
export const config = {
  IP_PROPIA: 'http://192.168.0.33',           // Tu IP local
  API_BACKEND_URL: 'http://localhost:8000',   // URL del backend Laravel
  API_SOCKET_URL: 'http://localhost:3001',    // URL del servidor Socket.IO
  API_FRONTEND_URL: 'http://localhost:5173',  // URL del frontend Vue.js
};
```

**📝 Notas importantes:**

* Cambia `192.168.0.33` por tu IP local real
* El puerto del Socket.IO es `3001` para evitar conflictos
* Todas las URLs deben incluir el protocolo `http://`

### Obtener tu IP Local

```bash
# Linux/Mac
hostname -I | awk '{print $1}'

# Windows
ipconfig | findstr "IPv4" | head -1

# Alternativa universal
node -e "console.log(require('os').networkInterfaces().en0?.find(i => i.family === 'IPv4')?.address || 'localhost')"
```

## Scripts Disponibles

### Frontend

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo con hot-reload
npm run build            # Compilar para producción
npm run preview          # Vista previa de la build de producción
npm run lint             # Linter (si está configurado)

# Utilidades
npm run type-check       # Verificar tipos TypeScript (si aplica)
npm run test:unit        # Tests unitarios (si están configurados)
```

### Servidor Socket.IO

```bash
# Desarrollo
npm run dev              # Servidor con auto-reload (nodemon)
npm start                # Servidor en modo producción
npm test                 # Tests (cuando estén implementados)

# Utilidades
npm run logs             # Ver logs del servidor
npm run health           # Verificar estado del servidor
```

### Scripts Combinados (package.json raíz)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev\" \"cd socket-server && npm run dev\"",
    "dev:frontend": "vite",
    "dev:socket": "cd socket-server && npm run dev",
    "build": "vite build",
    "preview": "vite preview",
    "install:all": "npm install && cd socket-server && npm install",
    "clean": "rm -rf node_modules dist socket-server/node_modules"
  }
}
```

## 🔌 Servidor Socket.IO

### Características Principales

* **Autenticación con tokens**
* **Salas de chat privadas**
* **Indicadores de escritura**
* **Estado en línea/offline**
* **Reconexión automática**
* **Gestión de errores**

### Eventos Principales

```javascript
// Eventos del cliente
socket.emit('join-chat', { chatId, otherUserId })
socket.emit('send-message', { chatId, message, otherUserId })
socket.emit('typing-start', { chatId, otherUserId })
socket.emit('typing-stop', { chatId, otherUserId })
socket.emit('mark-as-read', { chatId, otherUserId })

// Eventos del servidor
socket.on('new-message', messageData)
socket.on('user-typing', userData)
socket.on('user-stopped-typing', userData)
socket.on('user-online', userData)
socket.on('user-offline', userData)
```

### Configuración de Producción

```javascript
// socket-server/server.js - Configuración para producción
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1000000
});
```

## 🧩 Componentes Principales

### Header.vue

* **Navegación principal** con logo y título
* **Barra de búsqueda** para filtrar juegos
* **Sistema de autenticación** (login/registro)
* **Avatar y menú de usuario**
* **Integración con chat** y gestión social

### PrivateChat.vue

* **Chat en tiempo real** con Socket.IO
* **Lista de conversaciones** activas
* **Indicadores de mensajes** no leídos
* **Estado de escritura** y usuarios en línea
* **Eliminación de chats**

### UsersBoton.vue

* **Panel lateral** de gestión social
* **Sistema de amistades** (solicitudes, aceptación)
* **Bloqueo de usuarios**
* **Búsqueda de jugadores**
* **Verificación automática** de solicitudes

### Profile.vue

* **Información del usuario** y avatar
* **Estadísticas detalladas** por juego
* **Historial de partidas** con filtros
* **Gestión de cuenta** (eliminar, cerrar sesión)

## 🧪 Testing

### Verificar Instalación

```bash
# Verificar frontend
curl http://localhost:5173

# Verificar Socket.IO
curl http://localhost:3001/health

# Verificar conexión Socket.IO
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log(' Socket.IO conectado'));
socket.on('connect_error', (err) => console.log('❌ Error:', err.message));
"
```

### Tests de Funcionalidad

```bash
# Test completo del sistema
# 1. Abrir http://localhost:5173
# 2. Registrar usuario
# 3. Probar chat en tiempo real
# 4. Verificar gestión social
# 5. Jugar algunos juegos
```

## 🚀 Despliegue

### Build de Producción

```bash
# Frontend
npm run build

# Los archivos estarán en dist/
```

### Configuración para Producción

```javascript
// src/config/index.js - Para producción
export const config = {
  IP_PROPIA: 'https://tu-dominio.com',
  API_BACKEND_URL: 'https://api.tu-dominio.com',
  API_SOCKET_URL: 'https://socket.tu-dominio.com',
  API_FRONTEND_URL: 'https://tu-dominio.com',
};
```

### Docker (Opcional)

#### Dockerfile para Frontend:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Dockerfile para Socket Server:

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY socket-server/package*.json ./
RUN npm ci --only=production

COPY socket-server/ .

EXPOSE 3000
CMD ["node", "server.js"]
```

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Error "Cannot resolve dependency"

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

#### 2. Socket.IO no conecta

```bash
# Verificar que el servidor Socket.IO esté corriendo
curl http://localhost:3001/health

# Verificar configuración del frontend
cat src/config/index.js

```

#### 3. Imágenes no se cargan

```bash
# Verificar que el backend tenga storage:link
cd ../multigames-api
php artisan storage:link

# Verificar permisos
sudo chmod -R 755 storage/app/public
```

### Comandos de Limpieza

```bash
# Limpiar todo
npm run clean
npm cache clean --force

# Reinstalar todo
npm run install:all

# Reiniciar servidores de desarrollo
npm run dev
```

## 🔧 Personalización

### Cambiar Colores del Tema

```css
/* src/assets/styles/main.css */
:root {
  --primary-color: #BCC628;
  --secondary-color: #E63737;
  --accent-color: #830CE8;
  --background-color: #F3FE63;
}
```

### Añadir Nuevo Juego

1. **Crear componente** en `src/components/juegos/`
2. **Añadir ruta** en `src/router/index.js`
3. **Actualizar servicio** `src/services/games.js`
4. **Añadir al catálogo** en `Main.vue`

### Configurar para Red Local

```bash
# Obtener IP local
ip addr show | grep "inet " | grep -v 127.0.0.1

# Actualizar src/config/index.js
export const config = {
  IP_PROPIA: 'http://TU_IP_AQUI',
  API_BACKEND_URL: 'http://localhost:8000',
  API_SOCKET_URL: 'http://localhost:3001',
  API_FRONTEND_URL: 'http://TU_IP_AQUI:5173',
};

# Reiniciar servidores
npm run dev
```

## 📞 Soporte

### Verificaciones Básicas

1. **¿Están todos los servidores corriendo?**
   * Frontend: http://localhost:5173
   * Socket.IO: http://localhost:3001
   * Backend: http://localhost:8000
2. **¿La configuración está correcta?**
   * `src/config/index.js` en el frontend
   * `.env` en socket-server
3. **¿Las dependencias están instaladas?**
   ```bash
   npm list --depth=0
   cd socket-server && npm list --depth=0
   ```

### Logs Importantes

```bash
# Frontend (en navegador) y Socket.IO Server
- Console errors
- Network tab (failed requests)

# Backend
tail -f ../multigames-api/storage/logs/laravel.log
```

---

**🎮 ¡Tu MultiGames Frontend está listo para la acción!**

Ahora tienes una plataforma completa con:

* Frontend en http://localhost:5173
* Socket.IO en http://localhost:3001
* Chat en tiempo real
* Sistema social completo
* Múltiples juegos interactivos
