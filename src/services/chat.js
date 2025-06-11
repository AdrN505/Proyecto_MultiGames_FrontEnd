// src/services/chat.js
// Servicio para comunicación con la API de chat

import { authService } from './auth';
import { config } from "../config";

const API_URL = `${config.API_BACKEND_URL}/api`;

/**
 * Servicio de chat para comunicación con la API de Laravel
 */
export const chatService = {
  
  /**
   * Obtener todos los chats del usuario autenticado
   */
  async getChats() {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        }
      });

      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al obtener chats:', error);
      return { success: false, message: 'Error de conexión al obtener chats' };
    }
  },

  /**
   * Iniciar un nuevo chat con un usuario
   * @param {Object|Number} user - Usuario o ID del usuario
   */
  async startChat(user) {
    try {
      // 🔧 CORREGIDO: Extraer ID del usuario correctamente
      const userId = typeof user === 'object' ? user.id : user;
      
      console.log('Iniciando chat con usuario ID:', userId);

      if (!userId) {
        return { success: false, message: 'ID de usuario no válido' };
      }

      const response = await fetch(`${API_URL}/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          other_user_id: userId  // Enviar solo el ID como espera el backend
        })
      });

      const result = await this._parseResponse(response);
      console.log('Respuesta de startChat:', result);
      
      return result;
    } catch (error) {
      console.error('Error al iniciar chat:', error);
      return { success: false, message: 'Error de conexión al iniciar chat' };
    }
  },

  /**
   * Obtener mensajes de un chat específico
   * @param {Number} chatId - ID del chat
   * @param {Number} page - Página para paginación
   * @param {Number} perPage - Mensajes por página
   */
  async getChatMessages(chatId, page = 1, perPage = 50) {
    try {
      const url = new URL(`${API_URL}/chat/${chatId}/messages`);
      url.searchParams.append('page', page);
      url.searchParams.append('per_page', perPage);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        }
      });

      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      return { success: false, message: 'Error de conexión al obtener mensajes' };
    }
  },

  /**
   * Enviar un mensaje
   * @param {Number} chatId - ID del chat
   * @param {String} message - Mensaje a enviar
   */
  async sendMessage(chatId, message) {
    try {
      if (!message || !message.trim()) {
        return { success: false, message: 'El mensaje no puede estar vacío' };
      }

      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          message: message.trim()
        })
      });

      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return { success: false, message: 'Error de conexión al enviar mensaje' };
    }
  },

  /**
   *  Marcar mensajes como leídos - MÉTODO PRINCIPAL
   * @param {Number} chatId - ID del chat
   */
  async markAsRead(chatId) {
    try {
      console.log('Marcando mensajes como leídos para chat:', chatId);
      
      const response = await fetch(`${API_URL}/chat/${chatId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        }
      });

      const result = await this._parseResponse(response);
      console.log('Resultado markAsRead:', result);
      
      return result;
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      return { success: false, message: 'Error de conexión al marcar mensajes como leídos' };
    }
  },

  /**
   *  Alias para compatibilidad
   */
  async markMessagesAsRead(chatId) {
    return await this.markAsRead(chatId);
  },

  /**
   * Obtener contador de mensajes no leídos
   */
  async getUnreadCount() {
    try {
      const response = await fetch(`${API_URL}/chat/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        }
      });

      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al obtener contador de no leídos:', error);
      return { success: false, message: 'Error de conexión al obtener contador de no leídos' };
    }
  },

  /**
   * Eliminar un chat
   * @param {Number} chatId - ID del chat
   */
  async deleteChat(chatId) {
    try {
      const response = await fetch(`${API_URL}/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
          'Accept': 'application/json'
        }
      });

      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al eliminar chat:', error);
      return { success: false, message: 'Error de conexión al eliminar chat' };
    }
  },

  /**
   * Parsear respuesta de la API
   * @private
   */
  async _parseResponse(response) {
    let data;
    
    try {
      const responseText = await response.text();
      console.log('Respuesta cruda del servidor:', responseText);
      
      // Intentar parsear como JSON
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Error al parsear JSON:', e);
        return { 
          success: false, 
          message: `Error ${response.status}: Respuesta no válida del servidor` 
        };
      }

      if (!response.ok) {
        console.error('Error HTTP:', response.status, data);
        
        // Manejar errores específicos
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          return { 
            success: false, 
            message: `Errores de validación: ${errorMessages}`,
            errors: data.errors
          };
        }
        
        return { 
          success: false, 
          message: data.message || `Error ${response.status}: ${response.statusText}` 
        };
      }

      return { success: true, ...data };
    } catch (error) {
      console.error('Error al procesar respuesta:', error);
      return { 
        success: false, 
        message: 'Error al procesar la respuesta del servidor' 
      };
    }
  }
};

export default chatService;