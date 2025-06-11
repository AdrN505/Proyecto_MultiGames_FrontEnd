import { authService } from './auth';
import { config } from "../config";

const API_URL = `${config.API_BACKEND_URL}/api`;

/**
 * Servicio para gestionar relaciones entre usuarios (amistades y bloqueos)
 */
export const relationshipsService = {
  /**
   * Obtener lista de amigos
   * @returns {Promise<Object>} Lista de amigos
   */
  async getFriends() {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/friends`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await this._parseResponse(response);
      
      if (!data.success) {
        return data;
      }
      
      return {
        success: true,
        friends: data.data
      };
    } catch (error) {
      console.error('Error al obtener amigos:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Obtener solicitudes de amistad pendientes
   * @returns {Promise<Object>} Lista de solicitudes pendientes
   */
  async getPendingFriendRequests() {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/friends/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await this._parseResponse(response);
      
      if (!data.success) {
        return data;
      }
      
      return {
        success: true,
        pendingRequests: data.data
      };
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Enviar solicitud de amistad
   * @param {number} userId - ID del usuario al que enviar la solicitud
   * @returns {Promise<Object>} Resultado de la operación
   */
  async sendFriendRequest(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/friends/request/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al enviar solicitud de amistad:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Aceptar solicitud de amistad
   * @param {number} userId - ID del usuario que envió la solicitud
   * @returns {Promise<Object>} Resultado de la operación
   */
  async acceptFriendRequest(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/friends/accept/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al aceptar solicitud de amistad:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Rechazar solicitud de amistad
   * @param {number} userId - ID del usuario que envió la solicitud
   * @returns {Promise<Object>} Resultado de la operación
   */
  async rejectFriendRequest(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/friends/reject/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al rechazar solicitud de amistad:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Eliminar amistad
   * @param {number} userId - ID del usuario amigo
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeFriend(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/friends/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al eliminar amistad:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Obtener usuarios bloqueados
   * @returns {Promise<Object>} Lista de usuarios bloqueados
   */
  async getBlockedUsers() {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/users/blocked`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await this._parseResponse(response);
      
      if (!data.success) {
        return data;
      }
      
      return {
        success: true,
        blockedUsers: data.data
      };
    } catch (error) {
      console.error('Error al obtener usuarios bloqueados:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Bloquear usuario
   * @param {number} userId - ID del usuario a bloquear
   * @returns {Promise<Object>} Resultado de la operación
   */
  async blockUser(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/users/block/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al bloquear usuario:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Desbloquear usuario
   * @param {number} userId - ID del usuario a desbloquear
   * @returns {Promise<Object>} Resultado de la operación
   */
  async unblockUser(userId) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/users/unblock/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al desbloquear usuario:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Parsear respuesta del servidor
   * @private
   * @param {Response} response - Respuesta del servidor
   * @returns {Promise<Object>} Datos parseados
   */
  async _parseResponse(response) {
    // Obtener el texto de la respuesta
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
        message: data.message || 'Error en la operación' 
      };
    }
    
    return { 
      success: true, 
      data: data,
      message: data.message || 'Operación exitosa'
    };
  }
};