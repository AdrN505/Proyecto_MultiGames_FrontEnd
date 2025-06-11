// src/services/auth.js
import { config } from "../config";

// URL base de la API
const API_URL = `${config.API_BACKEND_URL}/api`;

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param {Object} credentials - Credenciales (email, password)
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Obtener el texto de la respuesta
      const responseText = await response.text();
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Si no es JSON, devolver objeto con error
        return { 
          success: false, 
          message: `Error ${response.status}: ${response.statusText}` 
        };
      }
      
      // Si la respuesta no es exitosa, pero tenemos respuesta JSON válida
      if (!response.ok) {
        // Caso especial para errores de validación (422)
        if (response.status === 422 && data.errors) {
          // Formatea los errores para mostrarlos de manera amigable
          const errorMessages = [];
          for (const field in data.errors) {
            errorMessages.push(data.errors[field][0]);
          }
          // Devolver objeto con mensaje de error
          return { 
            success: false, 
            message: errorMessages.join('\n') 
          };
        }
        
        // Caso especial para credenciales inválidas (401)
        if (response.status === 401) {
          return { 
            success: false, 
            message: 'Correo electrónico o contraseña incorrectos' 
          };
        }
        
        // Para otros tipos de errores, devolver objeto con mensaje de error
        return { 
          success: false, 
          message: data.message || 'Error al iniciar sesión' 
        };
      }

      // Guardar en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Devolver objeto de éxito
      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      // Solo para errores inesperados (de red, etc.)
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },

  /**
   * Registrar usuario
   * @param {Object} userData - Datos del usuario (email, password, username, imagen)
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async register(userData) {
    try {
      let response;
      
      // Si hay una imagen, usamos FormData
      if (userData.imagen) {
        const formData = new FormData();
        formData.append('email', userData.email);
        formData.append('password', userData.password);
        formData.append('username', userData.username);
        formData.append('imagen', userData.imagen);
        
        response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
      }

      // Obtener el texto de la respuesta
      const responseText = await response.text();
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Si no es JSON, lanzar excepción con el mensaje de error HTTP
        return Promise.reject(new Error(`Error ${response.status}: ${response.statusText}`));
      }
      
      // Si la respuesta no es exitosa, pero tenemos respuesta JSON válida
      if (!response.ok) {
        // Caso especial para errores de validación (422)
        if (response.status === 422 && data.errors) {
          // Formatea los errores para mostrarlos de manera amigable
          const errorMessages = [];
          for (const field in data.errors) {
            errorMessages.push(data.errors[field][0]);
          }
          // No lanzar excepción, sino devolver un objeto de resultado con el error
          return { 
            success: false, 
            message: errorMessages.join('\n') 
          };
        }
        
        // Para otros tipos de errores, devolver objeto con mensaje de error
        return { 
          success: false, 
          message: data.message || 'Error al registrarse' 
        };
      }

      // Guardar en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Devolver objeto de éxito
      return { 
        success: true, 
        data: data 
      };
    } catch (error) {
      // Solo registrar errores inesperados (de red, etc.)
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },

  /**
   * Cerrar sesión
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener usuario actual
   * @returns {Object|null} Usuario actual
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Comprobar si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('token') && !!this.getCurrentUser();
  },

  /**
   * Obtener token
   * @returns {string|null} Token de autenticación
   */
  getToken() {
    return localStorage.getItem('token');
  },
  /**
   * Comprobar si el usuario actual es administrador
   * @returns {boolean} True si el usuario es administrador
   */
  isAdmin() {
    const user = this.getCurrentUser();
    // Acepta tanto true como 1 como valores válidos para is_admin
    return user && (user.is_admin === true || user.is_admin === 1);
  }
};