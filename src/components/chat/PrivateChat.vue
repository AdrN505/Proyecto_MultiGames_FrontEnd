<template>
      <!-- PrivateChat.vue-->
  <div id="PrivateChat">
    <!-- Botón para abrir el chat -->
    <v-btn
      @click="isChatOpen = true"
      class="chat-toggle-btn"
      icon
      :color="unreadCount > 0 ? '#E63737' : '#F3FE63'"
    >
      <v-icon>mdi-chat</v-icon>
      <v-badge
        v-if="unreadCount > 0"
        color="#E63737"
        :content="unreadCount"
        bordered
      ></v-badge>
    </v-btn>

    <!-- Teleport para el panel de chat -->
    <teleport to="body">
      <transition name="chat-panel">
        <div v-if="isChatOpen" class="chat-panel-container">
          <div class="chat-panel" :class="{ 'chat-panel-mobile': isMobile }">
            <v-card flat class="fill-height d-flex flex-column" color="#6B4A86">
              
              <!-- Vista de lista de chats -->
              <div v-if="!selectedChat" class="chat-list-view">
                <!-- Cabecera -->
                <div class="d-flex align-center px-4 py-3 chat-header">
                  <v-icon color="#E6C8FF" size="large" class="mr-2">mdi-chat-outline</v-icon>
                  <span class="text-h5 chat-title">Chats Privados</span>
                  <v-spacer></v-spacer>
                  <v-btn icon @click="isChatOpen = false" class="close-button">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
                
                <v-divider></v-divider>
                
                <!-- Lista de chats -->
                <v-card-text class="flex-grow-1 overflow-y-auto pa-0">
                  <v-list v-if="chats.length > 0">
                    <v-list-item
                      v-for="chat in chats"
                      :key="chat.id"
                      @click="openChat(chat)"
                      class="chat-item"
                    >
                      <template v-slot:prepend>
                        <v-avatar :color="chat.other_user.imagen_url ? undefined : 'primary'">
                          <v-img v-if="chat.other_user.imagen_url" :src="chat.other_user.imagen_url"></v-img>
                          <template v-else>
                            {{ chat.other_user.username.charAt(0).toUpperCase() }}
                          </template>
                        </v-avatar>
                      </template>
                      
                      <v-list-item-title class="chat-username">
                        {{ chat.other_user.username }}
                        <v-chip v-if="chat.unread_count > 0" color="#E63737" size="x-small" class="ml-2">
                          {{ chat.unread_count }}
                        </v-chip>
                      </v-list-item-title>
                      
                      <v-list-item-subtitle v-if="chat.last_message" class="chat-preview">
                        <span :class="{ 'font-weight-bold': chat.unread_count > 0 }">
                          {{ chat.last_message.is_own_message ? 'Tú: ' : '' }}{{ truncateMessage(chat.last_message.message) }}
                        </span>
                        <div class="text-caption">{{ chat.last_message.created_at_human }}</div>
                      </v-list-item-subtitle>
                      
                      <v-list-item-subtitle v-else class="text-caption">
                        Sin mensajes
                      </v-list-item-subtitle>
                      
                      <template v-slot:append>
                        <v-btn
                          icon
                          size="small"
                          @click.stop="confirmDeleteChat(chat)"
                          class="delete-chat-btn"
                        >
                          <v-icon size="small">mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-list-item>
                  </v-list>
                  
                  <div v-else class="pa-4 text-center">
                    <v-icon size="large" color="grey">mdi-chat-outline</v-icon>
                    <div class="text-subtitle-1 mt-2">No tienes chats activos</div>
                    <div class="text-caption">Los chats aparecerán aquí cuando inicies una conversación</div>
                  </div>
                </v-card-text>
              </div>
              
              <!-- Vista de chat individual -->
              <div v-else class="chat-conversation-view d-flex flex-column fill-height">
                <!-- Cabecera del chat -->
                <div class="d-flex align-center px-4 py-3 chat-header">
                  <v-btn icon @click="closeChat" class="mr-2 back-button">
                    <v-icon>mdi-arrow-left</v-icon>
                  </v-btn>
                  
                  <v-avatar :color="selectedChat.other_user.imagen_url ? undefined : 'primary'" size="36" class="mr-3">
                    <v-img v-if="selectedChat.other_user.imagen_url" :src="selectedChat.other_user.imagen_url"></v-img>
                    <template v-else>
                      {{ selectedChat.other_user.username.charAt(0).toUpperCase() }}
                    </template>
                  </v-avatar>
                  
                  <div class="flex-grow-1">
                    <div class="text-subtitle-1 chat-title">{{ selectedChat.other_user.username }}</div>
                    <div v-if="typingUsers.length > 0" class="text-caption typing-indicator">
                      {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'está' : 'están' }} escribiendo...
                    </div>
                    <div v-else-if="isUserOnline(selectedChat.other_user.id)" class="text-caption online-status">
                      En línea
                    </div>
                  </div>
                  
                  <!-- Botón X mejorado -->
                  <v-btn icon @click="isChatOpen = false" class="close-x-button">
                    <v-icon size="24">mdi-close</v-icon>
                  </v-btn>
                </div>
                
                <v-divider></v-divider>
                
                <!-- Área de mensajes -->
                <div class="messages-container flex-grow-1 overflow-y-auto pa-3" ref="messagesContainer">
                  <div v-if="loadingMessages" class="text-center pa-4">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    <div class="mt-2">Cargando mensajes...</div>
                  </div>
                  
                  <div v-else>
                    <!-- Botón para cargar más mensajes -->
                    <div v-if="hasMoreMessages" class="text-center mb-4">
                      <v-btn
                        @click="loadMoreMessages"
                        variant="outlined"
                        size="small"
                        :loading="loadingMoreMessages"
                      >
                        Cargar mensajes anteriores
                      </v-btn>
                    </div>
                    
                    <!-- Lista de mensajes -->
                    <div v-for="message in messages" :key="message.id" class="message-wrapper mb-3">
                      <div
                        :class="{
                          'message-own': message.is_own_message,
                          'message-other': !message.is_own_message
                        }"
                        class="message-bubble"
                      >
                        <div v-if="!message.is_own_message" class="message-sender text-caption mb-1">
                          {{ message.sender.username }}
                        </div>
                        <div class="message-content">{{ message.message }}</div>
                        <div class="message-timestamp text-caption">
                          {{ formatTimestamp(message.created_at) }}
                          <v-icon v-if="message.is_own_message && message.is_read" size="x-small" color="success" class="ml-1">
                            mdi-check-all
                          </v-icon>
                          <v-icon v-else-if="message.is_own_message" size="x-small" color="grey" class="ml-1">
                            mdi-check
                          </v-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <v-divider></v-divider>
                
                <!-- Área de entrada de mensaje mejorada -->
                <div class="message-input-area pa-3">
                  <div class="d-flex align-center">
                    <v-text-field
                      v-model="newMessage"
                      placeholder="Escribe un mensaje..."
                      hide-details
                      variant="outlined"
                      density="comfortable"
                      class="flex-grow-1 mr-2 message-input-field"
                      @keydown.enter.prevent="sendMessage"
                      @input="handleTyping"
                      @blur="stopTyping"
                      :disabled="sendingMessage"
                    ></v-text-field>
                    
                    <v-btn
                      @click="sendMessage"
                      icon
                      color="primary"
                      :disabled="!newMessage.trim() || sendingMessage"
                      :loading="sendingMessage"
                      class="send-message-btn"
                    >
                      <v-icon>mdi-send</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </transition>
    </teleport>
    
    <!-- Diálogo de confirmación para eliminar chat -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card>
        <v-card-title>Eliminar chat</v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar este chat con {{ deleteDialog.chat?.other_user?.username }}?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="deleteDialog.show = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteChat" :loading="deletingChat">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { authService } from '../../services/auth';
import { chatService } from '../../services/chat';
import { config } from '../../config';
import { io } from 'socket.io-client';

/**
 * PrivateChat - Componente de Chat Privado en Tiempo Real
 * 
 * Sistema completo de mensajería privada con Socket.IO para tiempo real:
 * - Lista de chats activos con contadores de no leídos
 * - Conversaciones individuales con paginación
 * - Indicadores de escritura y estado en línea
 * - Notificaciones de mensajes leídos
 * - Eliminación de chats
 */

// Props para iniciar chat con usuario específico
const props = defineProps({
  startChatWithUser: {
    type: Object,
    default: null
  }
});

// Composables de Vuetify
const display = useDisplay();
const isMobile = computed(() => display.smAndDown.value);

// Estado del componente
const isChatOpen = ref(false);
const selectedChat = ref(null);
const chats = ref([]);
const messages = ref([]);
const newMessage = ref('');
const unreadCount = ref(0);
const loadingMessages = ref(false);
const loadingMoreMessages = ref(false);
const sendingMessage = ref(false);
const hasMoreMessages = ref(false);
const currentPage = ref(1);

// Estados de Socket.IO para tiempo real
const socket = ref(null);
const onlineUsers = ref([]);
const typingUsers = ref([]);
let typingTimer = null;

// Diálogos y notificaciones
const deleteDialog = ref({
  show: false,
  chat: null
});
const deletingChat = ref(false);

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Referencias del DOM
const messagesContainer = ref(null);

/**
 * Mostrar notificación al usuario
 */
const showMessage = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

/**
 * Truncar mensaje para preview en lista
 */
const truncateMessage = (message, maxLength = 40) => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

/**
 * Formatear timestamp de mensajes con texto relativo
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
 * Verificar si usuario está en línea
 */
const isUserOnline = (userId) => {
  return onlineUsers.value.some(user => user.id === userId);
};

/**
 * Inicializar conexión Socket.IO con autenticación
 */
const initializeSocket = () => {
  const currentUser = authService.getCurrentUser();
  const token = authService.getToken();
  
  if (!currentUser || !token) return;

  socket.value = io(`${config.API_SOCKET_URL}`, {
    auth: {
      token: token,
      userId: currentUser.id,
      username: currentUser.username
    }
  });

  // Eventos de conexión
  socket.value.on('connect', () => {
    console.log('Conectado a Socket.IO');
    socket.value.emit('get-online-users');
  });

  socket.value.on('disconnect', () => {
    console.log('Desconectado de Socket.IO');
  });

  // Evento: nuevo mensaje recibido en tiempo real
  socket.value.on('new-message', (messageData) => {
    // Solo agregar el mensaje si es del chat actual
    if (selectedChat.value && messageData.chatId === selectedChat.value.id) {
      const newMsg = {
        id: Date.now(), // ID temporal
        message: messageData.message,
        sender: messageData.sender,
        is_own_message: messageData.sender.id === authService.getCurrentUser()?.id,
        is_read: false,
        created_at: messageData.timestamp,
        created_at_human: 'Ahora'
      };
      
      messages.value.push(newMsg);
      scrollToBottom();
      
      // Si no es mensaje propio, marcar como leído
      if (!newMsg.is_own_message) {
        markChatAsRead();
      }
    }
    
    // Actualizar lista de chats
    loadChats();
  });

  // Eventos de indicador de escritura
  socket.value.on('user-typing', (data) => {
    if (selectedChat.value && data.chatId === selectedChat.value.id) {
      if (!typingUsers.value.includes(data.username)) {
        typingUsers.value.push(data.username);
      }
    }
  });

  socket.value.on('user-stopped-typing', (data) => {
    if (selectedChat.value && data.chatId === selectedChat.value.id) {
      const index = typingUsers.value.indexOf(data.username);
      if (index > -1) {
        typingUsers.value.splice(index, 1);
      }
    }
  });

  // Eventos de usuarios en línea
  socket.value.on('online-users', (users) => {
    onlineUsers.value = users;
  });

  socket.value.on('user-online', (user) => {
    if (!onlineUsers.value.some(u => u.id === user.userId)) {
      onlineUsers.value.push({
        id: user.userId,
        username: user.username
      });
    }
  });

  socket.value.on('user-offline', (user) => {
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== user.userId);
  });

  // Evento: mensajes marcados como leídos
  socket.value.on('messages-read', (data) => {
    if (selectedChat.value && data.chatId === selectedChat.value.id) {
      // Marcar mensajes propios como leídos
      messages.value.forEach(message => {
        if (message.is_own_message) {
          message.is_read = true;
        }
      });
    }
  });

  socket.value.on('error', (error) => {
    console.error('Error de Socket.IO:', error);
    showMessage('Error de conexión en tiempo real', 'error');
  });
};

/**
 * Desconectar Socket.IO
 */
const disconnectSocket = () => {
  if (socket.value) {
    socket.value.disconnect();
    socket.value = null;
  }
};

/**
 * Cargar lista de chats del usuario
 */
const loadChats = async () => {
  try {
    const result = await chatService.getChats();
    if (result.success) {
      chats.value = result.chats;
      
      // Calcular total de mensajes no leídos
      unreadCount.value = chats.value.reduce((total, chat) => total + chat.unread_count, 0);
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al cargar chats:', error);
    showMessage('Error al cargar chats', 'error');
  }
};

/**
 * Abrir chat específico y unirse via Socket.IO
 */
const openChat = async (chat) => {
  selectedChat.value = chat;
  messages.value = [];
  currentPage.value = 1;
  hasMoreMessages.value = false;
  typingUsers.value = [];
  
  // Unirse al chat en Socket.IO
  if (socket.value) {
    socket.value.emit('join-chat', {
      chatId: chat.id,
      otherUserId: chat.other_user.id
    });
  }
  
  await loadMessages();
  markChatAsRead();
};

/**
 * Cerrar chat actual y salir via Socket.IO
 */
const closeChat = () => {
  if (socket.value && selectedChat.value) {
    socket.value.emit('leave-chat', {
      chatId: selectedChat.value.id
    });
  }
  
  selectedChat.value = null;
  messages.value = [];
  typingUsers.value = [];
};

/**
 * Cargar mensajes del chat con paginación
 */
const loadMessages = async () => {
  if (!selectedChat.value) return;
  
  loadingMessages.value = true;
  
  try {
    const result = await chatService.getChatMessages(selectedChat.value.id, currentPage.value);
    
    if (result.success) {
      if (currentPage.value === 1) {
        messages.value = result.messages;
        await nextTick();
        scrollToBottom();
      } else {
        // Agregar mensajes al inicio para paginación
        const oldScrollHeight = messagesContainer.value?.scrollHeight || 0;
        messages.value = [...result.messages, ...messages.value];
        
        await nextTick();
        // Mantener posición de scroll después de cargar mensajes anteriores
        if (messagesContainer.value) {
          const newScrollHeight = messagesContainer.value.scrollHeight;
          messagesContainer.value.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }
      
      hasMoreMessages.value = result.pagination.has_more_pages;
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al cargar mensajes:', error);
    showMessage('Error al cargar mensajes', 'error');
  } finally {
    loadingMessages.value = false;
    loadingMoreMessages.value = false;
  }
};

/**
 * Cargar más mensajes antiguos (paginación)
 */
const loadMoreMessages = async () => {
  if (loadingMoreMessages.value || !hasMoreMessages.value) return;
  
  loadingMoreMessages.value = true;
  currentPage.value++;
  await loadMessages();
};

/**
 * Enviar mensaje via API y Socket.IO
 */
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value || sendingMessage.value) return;
  
  const messageText = newMessage.value.trim();
  newMessage.value = '';
  sendingMessage.value = true;
  
  // Detener indicador de escritura
  stopTyping();
  
  try {
    // Enviar a través de la API
    const result = await chatService.sendMessage(selectedChat.value.id, messageText);
    
    if (result.success) {
      // El mensaje se agregará a través del evento de Socket.IO
      
      // También enviar a través de Socket.IO para tiempo real
      if (socket.value) {
        socket.value.emit('send-message', {
          chatId: selectedChat.value.id,
          message: messageText,
          otherUserId: selectedChat.value.other_user.id,
          tempId: Date.now()
        });
      }
    } else {
      showMessage(result.message, 'error');
      newMessage.value = messageText; // Restaurar mensaje si falló
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    showMessage('Error al enviar mensaje', 'error');
    newMessage.value = messageText; // Restaurar mensaje si falló
  } finally {
    sendingMessage.value = false;
  }
};

/**
 * Manejar evento de escritura con debounce
 */
const handleTyping = () => {
  if (!socket.value || !selectedChat.value) return;
  
  // Enviar evento de escritura
  socket.value.emit('typing-start', {
    chatId: selectedChat.value.id,
    otherUserId: selectedChat.value.other_user.id
  });
  
  // Limpiar timer anterior
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
  
  // Establecer timer para detener escritura
  typingTimer = setTimeout(() => {
    stopTyping();
  }, 2000);
};

/**
 * Detener indicador de escritura
 */
const stopTyping = () => {
  if (!socket.value || !selectedChat.value) return;
  
  socket.value.emit('typing-stop', {
    chatId: selectedChat.value.id,
    otherUserId: selectedChat.value.other_user.id
  });
  
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
};

/**
 * Marcar chat como leído
 */
const markChatAsRead = async () => {
  if (!selectedChat.value) return;
  
  try {
    const result = await chatService.markAsRead(selectedChat.value.id);
    
    if (result.success) {
      // Notificar a través de Socket.IO
      if (socket.value) {
        socket.value.emit('mark-as-read', {
          chatId: selectedChat.value.id,
          otherUserId: selectedChat.value.other_user.id
        });
      }
      
      // Actualizar lista de chats
      loadChats();
    }
  } catch (error) {
    console.error('Error al marcar como leído:', error);
  }
};

/**
 * Hacer scroll automático al final de mensajes
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

/**
 * Mostrar confirmación para eliminar chat
 */
const confirmDeleteChat = (chat) => {
  deleteDialog.value.chat = chat;
  deleteDialog.value.show = true;
};

/**
 * Eliminar chat permanentemente
 */
const deleteChat = async () => {
  if (!deleteDialog.value.chat) return;
  
  deletingChat.value = true;
  
  try {
    const result = await chatService.deleteChat(deleteDialog.value.chat.id);
    
    if (result.success) {
      showMessage('Chat eliminado correctamente', 'success');
      
      // Si era el chat seleccionado, cerrarlo
      if (selectedChat.value && selectedChat.value.id === deleteDialog.value.chat.id) {
        closeChat();
      }
      
      // Recargar lista de chats
      await loadChats();
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al eliminar chat:', error);
    showMessage('Error al eliminar chat', 'error');
  } finally {
    deletingChat.value = false;
    deleteDialog.value.show = false;
    deleteDialog.value.chat = null;
  }
};

/**
 * Iniciar chat con usuario específico (llamada desde componente padre)
 */
const startChatWithUser = async (user) => {
  try {
    const result = await chatService.startChat(user.id);
    
    if (result.success) {
      isChatOpen.value = true;
      await loadChats();
      
      // Buscar el chat en la lista y abrirlo
      const chat = chats.value.find(c => c.other_user.id === user.id);
      if (chat) {
        await openChat(chat);
      }
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al iniciar chat:', error);
    showMessage('Error al iniciar chat', 'error');
  }
};

// Watcher para prop de iniciar chat
watch(() => props.startChatWithUser, (user) => {
  if (user) {
    startChatWithUser(user);
  }
}, { immediate: true });

onMounted(() => {
  loadChats();
  initializeSocket();
  
  // Actualizar contador cada 30 segundos
  const unreadInterval = setInterval(async () => {
    const result = await chatService.getUnreadCount();
    if (result.success) {
      unreadCount.value = result.unreadCount;
    }
  }, 30000);
  
  // Limpiar intervalo al desmontar
  onUnmounted(() => {
    clearInterval(unreadInterval);
  });
});

onUnmounted(() => {
  disconnectSocket();
  if (typingTimer) {
    clearTimeout(typingTimer);
  }
});

// Exponer funciones para uso externo
defineExpose({
  startChatWithUser,
  openChat: () => { isChatOpen.value = true; }
});
</script>

<style scoped>
.chat-toggle-btn {
  background-color: #F3FE63 !important;
  border: 4px solid #830CE8;
  border-radius: 50% !important;
  width: 45px !important;
  height: 45px !important;
  min-width: 45px !important;
  min-height: 45px !important;
  position: fixed;
  bottom: 20px;
  right: 80px;
  z-index: 100;
}

.chat-toggle-btn .v-icon {
  font-size: 28px !important;
  color: #830CE8;
}

.chat-panel-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  z-index: 505;
  pointer-events: none;
}

.chat-panel {
  position: relative;
  width: 580px;
  height: 100vh;
  background-color: #6B4A86 !important;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

.chat-panel-mobile {
  width: 100%;
}

.chat-header {
  background-color: #6B4A86;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-title {
  color: #E6C8FF;
  font-weight: bold;
}

.close-button {
  color: white;
  min-width: 36px;
  width: 36px;
  height: 36px;
}

.close-x-button {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  transition: all 0.2s ease !important;
}

.close-x-button:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: scale(1.05) !important;
}

.back-button {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

.chat-item {
  border: 2px solid #830CE8 !important;
  border-radius: 12px !important;
  margin: 4px 8px;
  background-color: #D7C8FF;
  color: black;
  transition: transform 0.2s ease;
}

.chat-item:hover {
  transform: scale(1.02);
  background-color: #F3FE63;
}

.chat-username {
  font-weight: bold;
}

.chat-preview {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-chat-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.delete-chat-btn:hover {
  opacity: 1;
  color: #E63737;
}

.messages-container {
  background-color: #F5F5F5;
  max-height: calc(100vh - 200px);
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.message-own {
  background-color: #830CE8;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.message-other {
  background-color: white;
  color: black;
  margin-right: auto;
  border-bottom-left-radius: 4px;
  border: 1px solid #E0E0E0;
}

.message-content {
  line-height: 1.4;
}

.message-timestamp {
  margin-top: 4px;
  opacity: 0.7;
  font-size: 0.75rem;
  text-align: right;
}

.message-other .message-timestamp {
  text-align: left;
}

.message-sender {
  font-weight: bold;
  color: #830CE8;
}

.message-input-area {
  background-color: #6B4A86;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.message-input-field .v-field) {
  background-color: white !important;
  border-radius: 8px !important;
}

:deep(.message-input-field .v-field__input) {
  color: #333333 !important;
  font-weight: 500 !important;
}

:deep(.message-input-field .v-field__input::placeholder) {
  color: #666666 !important;
  opacity: 1 !important;
  font-weight: 400 !important;
}

:deep(.message-input-field .v-field__outline) {
  --v-field-border-color: #CCCCCC !important;
  --v-field-border-opacity: 1 !important;
}

:deep(.message-input-field .v-field--focused .v-field__outline) {
  --v-field-border-color: #830CE8 !important;
  border-width: 2px !important;
}

/*  Botón de envío mejorado */
.send-message-btn {
  background-color: #830CE8 !important;
  color: white !important;
  min-width: 48px !important;
  width: 48px !important;
  height: 48px !important;
  transition: all 0.2s ease !important;
}

.send-message-btn:hover:not(:disabled) {
  background-color: #9A4EF0 !important;
  transform: scale(1.05) !important;
}

.send-message-btn:disabled {
  background-color: #CCCCCC !important;
  color: #666666 !important;
}

.typing-indicator {
  color: #4CAF50;
  font-style: italic;
}

.online-status {
  color: #4CAF50;
}

/* Animaciones */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 0.3s ease;
}

@media (min-width: 769px) {
  .chat-panel-enter-from {
    transform: translateX(100%);
  }
  
  .chat-panel-leave-to {
    transform: translateX(100%);
  }
}

@media (max-width: 768px) {
  .chat-panel-enter-from {
    transform: translateY(100%);
  }
  
  .chat-panel-leave-to {
    transform: translateY(100%);
  }
  
  .chat-toggle-btn {
    bottom: 10px;
    right: 10px;
  }
}

:deep(.v-card),
:deep(.v-list),
:deep(.v-card-text) {
  background-color: #6B4A86 !important;
  color: #E6C8FF !important;
}

:deep(.v-badge__badge) {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border: 2px solid #F3FE63;
}
</style>