import { authService } from './auth';
import { config } from "../config";

const API_URL = `${config.API_BACKEND_URL}/api`;

/**
 * Servicio de usuario
 */
export const userService = {
  /**
   * Obtener datos actualizados del perfil desde el servidor
   * @returns {Promise<Object>} Datos actualizados del usuario
   */
  async refreshUserProfile() {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Obtener respuesta como texto
      const responseText = await response.text();
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { 
          success: false, 
          message: `Error ${response.status}: ${response.statusText}` 
        };
      }
      
      // Si la respuesta no es exitosa
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Error al obtener el perfil' 
        };
      }
      
      // Actualizar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { 
        success: true, 
        user: data.user 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Actualizar la imagen de perfil
   * @param {File} imageFile - Archivo de imagen
   * @returns {Promise<Object>} Resultado de la operación
   */
  async updateProfileImage(imageFile) {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('imagen', imageFile);
      
      const response = await fetch(`${API_URL}/user/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      // Obtener respuesta como texto
      const responseText = await response.text();
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { 
          success: false, 
          message: `Error ${response.status}: ${response.statusText}` 
        };
      }
      
      // Si la respuesta no es exitosa
      if (!response.ok) {
        // Manejar errores de validación
        if (response.status === 422 && data.errors) {
          const errorMessages = [];
          for (const field in data.errors) {
            errorMessages.push(data.errors[field][0]);
          }
          return { 
            success: false, 
            message: errorMessages.join('\n') 
          };
        }
        
        return { 
          success: false, 
          message: data.message || 'Error al actualizar la imagen de perfil' 
        };
      }
      
      // Actualizar usuario en localStorage con TODOS los datos devueltos por el servidor
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { 
        success: true, 
        data: data,
        user: data.user
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Verificar si la imagen de perfil es válida y refrescar si es necesario
   * @param {string} imageUrl - URL de la imagen a verificar
   * @returns {Promise<boolean>} True si la imagen se verificó correctamente
   */
  async verifyProfileImage(imageUrl) {
    try {
      if (!imageUrl) {
        return false;
      }
      
      // Intentar cargar la imagen para verificar si existe
      const imageExists = await this.checkImageExists(imageUrl);
      
      // Si la imagen no existe, refrescar el perfil desde el servidor
      if (!imageExists) {
        const refreshResult = await this.refreshUserProfile();
        return refreshResult.success;
      }
      
      return true;
    } catch (error) {
      console.error('Error al verificar la imagen de perfil:', error);
      return false;
    }
  },
  
  /**
   * Comprobar si una URL de imagen existe y es accesible
   * @param {string} url - URL de la imagen
   * @returns {Promise<boolean>} True si la imagen existe
   */
  async checkImageExists(url) {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Agregar timestamp para evitar caché
      img.src = `${url}?t=${new Date().getTime()}`;
      
      // Establecer un timeout por si la conexión se queda colgada
      setTimeout(() => resolve(false), 5000);
    });
  },
  /**
   * Eliminar cuenta de usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteAccount() {
    try {
      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Obtener respuesta como texto
      const responseText = await response.text();
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        return { 
          success: false, 
          message: `Error ${response.status}: ${response.statusText}` 
        };
      }
      
      // Si la respuesta no es exitosa
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Error al eliminar la cuenta' 
        };
      }
      
      // Limpiar localStorage ya que la cuenta ha sido eliminada
      authService.logout();
      
      return { 
        success: true, 
        message: data.message || 'Cuenta eliminada correctamente'
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
};