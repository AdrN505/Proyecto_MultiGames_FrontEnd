// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '../services/auth'
//import MainApp from '@/components/MainApp.vue'
import Main from '@/components/Main.vue'
import TresEnRaya from '@/components/juegos/TresEnRaya.vue'
import Ahorcado from '@/components/juegos/Ahorcado.vue'
import Buscaminas from '@/components/juegos/Buscaminas.vue'
import Ajedrez from '@/components/juegos/Ajedrez.vue'
import Puzzle from '@/components/juegos/Puzzle.vue'
import Tetris from '@/components/juegos/Tetris.vue'
import Wordle from '@/components/juegos/Wordle.vue'
import Profile from '@/components/auth/Profile.vue'
import GestorDeJuegos from '../components/admin/GestorDeJuegos.vue'

const routes = [
  {
    path: '/',
    name: 'App',
    component: Main
  },
  {
    path: '/admin',
    name: 'GestorDeJuegos',
    component: GestorDeJuegos,
    meta: {
      requiresAuth: true, // Esta ruta no requiere autenticación
      requiresAdmin: true // Solo Admin
    }
  },
  {
    path: '/perfil',
    name: 'Profile',
    component: Profile,
    meta: {
      requiresAuth: true // Esta ruta requiere autenticación
    }
  },
  //
  // JUEGOS -----------------------------------
  //
  {
    path: '/juegos/tres-en-raya',
    name: 'TresEnRaya',
    component: TresEnRaya,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
  {
    path: '/juegos/ahorcado',
    name: 'Ahorcado',
    component: Ahorcado,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
  {
    path: '/juegos/busca-minas',
    name: 'Buscaminas',
    component: Buscaminas,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
  {
    path: '/juegos/tetris',
    name: 'Tetris',
    component: Tetris,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
  {
    path: '/juegos/ajedrez',
    name: 'Ajedrez',
    component: Ajedrez,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
      {
    path: '/juegos/puzzle',
    name: 'Puzzle',
    component: Puzzle,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
  {
    path: '/juegos/wordle',
    name: 'Wordle',
    component: Wordle,
    meta: {
      requiresAuth: false // Esta ruta no requiere autenticación
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guardia de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  // Verificar si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Si no está autenticado, redirigir a la página principal
    if (!authService.isAuthenticated()) {
      next({
        path: '/',
        query: { redirect: to.fullPath }
      });
    } else {
      // Verificar si la ruta requiere privilegios de administrador
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!authService.isAdmin()) {
          // Si no es admin, redirigir a la página principal
          next({ path: '/' });
        } else {
          next(); // Si es admin, permitir acceso
        }
      } else {
        next(); // Si está autenticado y no necesita ser admin, permitir acceso
      }
    }
  } else {
    // Para rutas públicas
    next();
  }
});

export default router
