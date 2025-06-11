import { ref, onMounted, onUnmounted } from 'vue';
import { chatService } from '../services/chat';
import { authService } from '../services/auth';

/**
 * Composable para manejar funcionalidades de chat
 * Proporciona una interfaz reactiva para integrar el chat en cualquier componente
 */
export function useChat() {
  // Estado reactivo
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Referencias para intervalos
  let unreadInterval = null;

  /**
   * Obtener contador de mensajes no leídos
   */
  const updateUnreadCount = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const result = await chatService.getUnreadCount();
      
      if (result.success) {
        unreadCount.value = result.unreadCount;
      } else {
        console.error('Error al obtener contador no leídos:', result.message);
        error.value = result.message;
      }
    } catch (err) {
      console.error('Error en updateUnreadCount:', err);
      error.value = 'Error de conexión';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Iniciar chat con un usuario específico
   * @param {Object} user - Usuario con el que iniciar el chat
   * @returns {Promise<Object>} Resultado de la operación
   */
  const startChat = async (user) => {
    try {
      isLoading.value = true;
      error.value = null;
      
      if (!user || !user.id) {
        throw new Error('Usuario no válido');
      }
      
      const result = await chatService.startChat(user.id);
      
      if (!result.success) {
        error.value = result.message;
      }
      
      return result;
    } catch (err) {
      console.error('Error en startChat:', err);
      error.value = err.message || 'Error al iniciar chat';
      return {
        success: false,
        message: error.value
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Obtener lista de chats del usuario
   * @returns {Promise<Array>} Lista de chats
   */
  const getChats = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      
      const result = await chatService.getChats();
      
      if (result.success) {
        // Actualizar contador basado en los chats obtenidos
        unreadCount.value = result.chats.reduce((total, chat) => total + chat.unread_count, 0);
        return result.chats;
      } else {
        error.value = result.message;
        return [];
      }
    } catch (err) {
      console.error('Error en getChats:', err);
      error.value = 'Error al obtener chats';
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Marcar chat como leído
   * @param {number} chatId - ID del chat
   * @returns {Promise<Object>} Resultado de la operación
   */
  const markChatAsRead = async (chatId) => {
    try {
      const result = await chatService.markAsRead(chatId);
      
      if (result.success) {
        // Actualizar contador después de marcar como leído
        await updateUnreadCount();
      }
      
      return result;
    } catch (err) {
      console.error('Error en markChatAsRead:', err);
      return {
        success: false,
        message: 'Error al marcar como leído'
      };
    }
  };

  /**
   * Inicializar actualizaciones automáticas del contador
   * @param {number} interval - Intervalo en milisegundos (por defecto 30 segundos)
   */
  const startPeriodicUpdates = (interval = 30000) => {
    // Limpiar intervalo existente si hay alguno
    if (unreadInterval) {
      clearInterval(unreadInterval);
    }
    
    // Obtener contador inicial
    updateUnreadCount();
    
    // Establecer intervalo para actualizaciones periódicas
    unreadInterval = setInterval(() => {
      // Solo actualizar si el usuario está autenticado
      if (authService.isAuthenticated()) {
        updateUnreadCount();
      }
    }, interval);
  };

  /**
   * Detener actualizaciones automáticas
   */
  const stopPeriodicUpdates = () => {
    if (unreadInterval) {
      clearInterval(unreadInterval);
      unreadInterval = null;
    }
  };

  /**
   * Verificar si un usuario está en línea
   * @param {number} userId - ID del usuario
   * @returns {boolean} True si el usuario está en línea
   */
  const isUserOnline = (userId) => {
    // Esta funcionalidad requeriría integración con Socket.IO
    // Por ahora retorna false como placeholder
    return false;
  };

  /**
   * Formatear timestamp para mostrar en la UI
   * @param {string} timestamp - Timestamp en formato ISO
   * @returns {string} Timestamp formateado
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Truncar mensaje para vista previa
   * @param {string} message - Mensaje completo
   * @param {number} maxLength - Longitud máxima
   * @returns {string} Mensaje truncado
   */
  const truncateMessage = (message, maxLength = 40) => {
    if (!message || message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  /**
   * Resetear estado del composable
   */
  const reset = () => {
    unreadCount.value = 0;
    isLoading.value = false;
    error.value = null;
    stopPeriodicUpdates();
  };

  // Lifecycle hooks
  onMounted(() => {
    // Iniciar actualizaciones automáticas cuando se monta el composable
    if (authService.isAuthenticated()) {
      startPeriodicUpdates();
    }
  });

  onUnmounted(() => {
    // Limpiar recursos cuando se desmonta
    stopPeriodicUpdates();
  });

  // API pública del composable
  return {
    // Estado reactivo
    unreadCount,
    isLoading,
    error,
    
    // Métodos principales
    startChat,
    getChats,
    markChatAsRead,
    updateUnreadCount,
    
    // Control de actualizaciones
    startPeriodicUpdates,
    stopPeriodicUpdates,
    
    // Utilidades
    isUserOnline,
    formatTimestamp,
    truncateMessage,
    reset
  };
}

/**
 * Versión simplificada del composable para casos de uso básicos
 * Solo expone el contador de mensajes no leídos
 */
export function useChatUnreadCount() {
  const { unreadCount, updateUnreadCount, startPeriodicUpdates, stopPeriodicUpdates } = useChat();
  
  return {
    unreadCount,
    updateUnreadCount,
    startPeriodicUpdates,
    stopPeriodicUpdates
  };
}

/**
 * Hook para integrar fácilmente el chat con el componente Lista
 * Maneja el evento 'chat-usuario' automáticamente
 */
export function useChatIntegration(privateChatRef) {
  const { startChat, error } = useChat();
  
  /**
   * Manejar evento de chat desde componente Lista
   * @param {Object} user - Usuario seleccionado para chat
   */
  const handleChatUser = async (user) => {
    try {
      const result = await startChat(user);
      
      if (result.success && privateChatRef.value) {
        // Abrir el componente de chat privado si está disponible
        privateChatRef.value.startChatWithUser(user);
      }
      
      return result;
    } catch (err) {
      console.error('Error en handleChatUser:', err);
      return {
        success: false,
        message: 'Error al iniciar chat'
      };
    }
  };
  
  return {
    handleChatUser,
    error
  };
}