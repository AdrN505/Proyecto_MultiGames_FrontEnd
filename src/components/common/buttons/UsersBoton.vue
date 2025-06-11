<template>
      <!-- common/buttons/UsersBoton -->
  <div id="Lista">
    <!-- Botón circular con icono -->
    <v-btn
      @click="isPanelOpen = true"
      class="custom-circular-btn mr-4"
      right
      icon
    >
      <v-icon>mdi-account-group</v-icon>
      <!-- Indicador de solicitudes pendientes -->
      <v-badge
        v-if="pendingRequests.length > 0"
        color="#E63737"
        :content="pendingRequests.length"
        bordered
        dot-color="#E63737"
      ></v-badge>
    </v-btn>

    <!-- Teleport para mover el panel al nivel raíz del DOM -->
    <teleport to="body">
      <!-- Panel lateral con animaciones personalizadas -->
      <transition name="panel">
        <div v-if="isPanelOpen" class="side-panel-container">
          <div 
            class="side-panel"
            :class="{ 'side-panel-mobile': isMobile }"
          >
            <v-card flat class="fill-height d-flex flex-column custom-panel" color="#6B4A86" dark>
              <!-- Cabecera del panel con título e icono -->
              <div class="d-flex align-center px-4 py-3 header-section">
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                  <v-icon color="#E6C8FF" size="large" class="mr-2">mdi-account-group</v-icon>
                  <span class="text-h4 custom-title" style="font-family: 'Acme', sans-serif;">Lista de Jugadores</span>
                </div>
                <v-spacer></v-spacer>
                <v-btn icon @click="isPanelOpen = false" class="close-button">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
              
              <v-divider></v-divider>
              
              <!-- Sección de búsqueda mejorada -->
              <div class="pa-4 search-section">
                <v-sheet color="#6B4A86" rounded class="pa-3 mb-4">
                  <v-text-field
                    v-model="searchQuery"
                    placeholder="Buscar Jugador o ID ..."
                    prepend-inner-icon="mdi-magnify"
                    hide-details
                    variant="outlined"
                    density="comfortable"
                    class="custom-search"
                    clearable
                  ></v-text-field>
                  <div class="text-caption mt-1" style="color:#E6C8FF;">
                    <v-icon size="x-small" class="mr-1">mdi-information-outline</v-icon>
                    Puedes buscar por nombre o estado
                  </div>
                </v-sheet>
                
                <v-btn-toggle
                  v-model="activeTab"
                  mandatory
                  class="d-flex mb-4 boton-toggle-custom"
                  color="#830CE8"
                >
                  <v-btn value="usuarios" class="flex-grow-1">
                    Usuarios
                  </v-btn>
                  <v-btn value="solicitudes" class="flex-grow-1">
                    Solicitudes
                    <v-badge
                      v-if="pendingRequests.length > 0"
                      color="#E63737"
                      :content="pendingRequests.length"
                      inline
                    ></v-badge>
                  </v-btn>
                  <v-btn value="amigos" class="flex-grow-1">
                    Amigos
                  </v-btn>
                  <v-btn value="bloqueados" class="flex-grow-1">
                    Bloqueados
                  </v-btn>
                </v-btn-toggle>
              </div>
              
              <!-- Resultado de la búsqueda -->
              <v-card-text class="flex-grow-1 overflow-y-auto pa-0">
                <v-list>
                  <v-list-item
                    v-for="(item, index) in filteredList"
                    :key="index"
                    class="user-item"
                    @click="toggleUsuarioSeleccionado(item)"
                    :class="{ 'selected-user': isUsuarioSeleccionado(item) }"
                  >
                    <template v-slot:prepend>
                      <v-avatar :color="item.image ? undefined : item.color" class="user-avatar">
                        <v-img v-if="item.image" :src="item.image" alt="User Avatar"></v-img>
                        <template v-else>
                          {{ item.name.charAt(0).toUpperCase() }}
                        </template>
                      </v-avatar>
                    </template>
                    <v-list-item-title><span class="user-id-badge" style="color:darkslategrey;"># {{ item.id }}</span> {{ item.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.status }}</v-list-item-subtitle>
                    
                    <!-- Botones que aparecen cuando el usuario está seleccionado -->
                    <div v-if="isUsuarioSeleccionado(item)" class="action-buttons-container mt-2">
                      <!-- Botones para la pestaña Usuarios -->
                      <template v-if="activeTab === 'usuarios'">
                        <v-btn
                          variant="tonal"
                          color="success"
                          size="small"
                          class="action-button mr-2"
                          @click.stop="chatConUsuario(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-chat</v-icon>
                          Chat
                        </v-btn>
                        
                        <v-btn
                          variant="tonal"
                          color="primary"
                          size="small"
                          class="action-button mr-2"
                          @click.stop="agregarUsuario(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-account-plus</v-icon>
                          Agregar
                        </v-btn>
                        
                        <v-btn
                          variant="tonal"
                          color="error"
                          size="small"
                          class="action-button"
                          @click.stop="bloquearUsuario(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-account-cancel</v-icon>
                          Bloquear
                        </v-btn>
                      </template>
                      
                      <!-- Botones para la pestaña Solicitudes -->
                      <template v-else-if="activeTab === 'solicitudes'">
                        <v-btn
                          variant="tonal"
                          color="success"
                          size="small"
                          class="action-button mr-2"
                          @click.stop="aceptarSolicitud(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-account-check</v-icon>
                          Aceptar
                        </v-btn>
                        
                        <v-btn
                          variant="tonal"
                          color="error"
                          size="small"
                          class="action-button"
                          @click.stop="rechazarSolicitud(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-account-remove</v-icon>
                          Rechazar
                        </v-btn>
                      </template>
                      
                      <!-- Botones para la pestaña Amigos -->
                      <template v-else-if="activeTab === 'amigos'">
                        <v-btn
                          variant="tonal"
                          color="success"
                          size="small"
                          class="action-button mr-2"
                          @click.stop="chatConUsuario(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-chat</v-icon>
                          Chat
                        </v-btn>
                        
                        <v-btn
                          variant="tonal"
                          color="error"
                          size="small"
                          class="action-button"
                          @click.stop="eliminarAmigo(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-account-remove</v-icon>
                          Eliminar
                        </v-btn>
                      </template>
                      
                      <!-- Botones para la pestaña Bloqueados -->
                      <template v-else-if="activeTab === 'bloqueados'">
                        <v-btn
                          variant="tonal"
                          color="primary"
                          size="small"
                          class="action-button"
                          @click.stop="desbloquearUsuario(item)"
                        >
                          <v-icon size="small" class="mr-1">mdi-account-check</v-icon>
                          Desbloquear
                        </v-btn>
                      </template>
                    </div>
                  </v-list-item>
                </v-list>
                
                <div v-if="searchQuery && filteredList.length === 0" class="pa-4 text-center">
                  <v-icon size="large" color="grey">mdi-account-search-outline</v-icon>
                  <div class="text-subtitle-1 mt-2">No se encontraron jugadores</div>
                </div>
                
                <div v-if="!searchQuery && filteredList.length === 0" class="pa-4 text-center">
                  <v-icon size="large" color="grey">mdi-account-group-outline</v-icon>
                  <div class="text-subtitle-1 mt-2">
                    <template v-if="activeTab === 'usuarios'">
                      No hay usuarios disponibles
                    </template>
                    <template v-else-if="activeTab === 'solicitudes'">
                      No tienes solicitudes de amistad pendientes
                    </template>
                    <template v-else-if="activeTab === 'amigos'">
                      No tienes amigos añadidos
                    </template>
                    <template v-else-if="activeTab === 'bloqueados'">
                      No tienes usuarios bloqueados
                    </template>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </transition>
    </teleport>
    
    <!-- Snackbar para mensajes de retroalimentación -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
    
    <!-- Diálogo de confirmación -->
    <v-dialog
      v-model="confirmDialog.show"
      max-width="400"
    >
      <v-card>
        <v-card-title>
          {{ confirmDialog.title }}
        </v-card-title>
        <v-card-text>
          {{ confirmDialog.message }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="confirmDialog.show = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            :color="confirmDialog.color"
            variant="text"
            @click="executeConfirmedAction"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { authService } from '../../../services/auth';
import { relationshipsService } from '../../../services/relationships';
import { config } from '../../../config';
import { ref, computed, onMounted, defineEmits, watch } from 'vue';
import { useDisplay } from 'vuetify';

/**
 * UsersBoton - Componente de Gestión de Usuarios y Relaciones
 * 
 * Panel lateral completo para gestionar relaciones sociales:
 * - Lista de usuarios disponibles para interactuar
 * - Sistema de solicitudes de amistad (envío, aceptación, rechazo)
 * - Gestión de amigos (chat, eliminación)
 * - Sistema de bloqueo/desbloqueo de usuarios
 * - Búsqueda y filtrado inteligente
 * - Verificación automática de nuevas solicitudes
 */

// Definir eventos emitidos al componente padre
const emit = defineEmits(['chat-usuario', 'agregar-usuario', 'bloquear-usuario']);

// Composables de Vuetify para responsive design
const display = useDisplay();
const isMobile = computed(() => display.smAndDown.value);

// Estado principal del componente
const isPanelOpen = ref(false);
const searchQuery = ref('');
const activeTab = ref('usuarios');
const usuarios = ref([]);
const amigos = ref([]);
const bloqueados = ref([]);
const pendingRequests = ref([]);
const usuarioSeleccionadoId = ref(null);
const loading = ref(false);

// Sistema de notificaciones y confirmaciones
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  color: 'primary',
  action: null,
  actionData: null
});

/**
 * Mostrar mensaje de notificación al usuario
 */
const showMessage = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

/**
 * Mostrar diálogo de confirmación antes de acciones críticas
 */
const showConfirmDialog = (title, message, action, actionData, color = 'primary') => {
  confirmDialog.value.title = title;
  confirmDialog.value.message = message;
  confirmDialog.value.color = color;
  confirmDialog.value.action = action;
  confirmDialog.value.actionData = actionData;
  confirmDialog.value.show = true;
};

/**
 * Ejecutar acción después de confirmación del usuario
 */
const executeConfirmedAction = () => {
  if (confirmDialog.value.action && typeof confirmDialog.value.action === 'function') {
    confirmDialog.value.action(confirmDialog.value.actionData);
  }
  confirmDialog.value.show = false;
};

/**
 * Obtener lista completa de usuarios registrados
 */
const fetchUsuarios = async () => {
  loading.value = true;
  const token = authService.getToken();
  
  try {
    const response = await fetch(`${config.API_BACKEND_URL}/api/usuarios`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }
    
    const data = await response.json();
    
    // Mapear a formato utilizado por el componente
    usuarios.value = data.map(user => ({
      id: user.id,
      name: user.username,
      image: user.imagen_url,
      status: 'Desconectado', // Simulado por ahora
      color: 'grey',
    }));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    showMessage('Error al cargar usuarios', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Obtener solicitudes de amistad pendientes
 */
const fetchPendingRequests = async () => {
  loading.value = true;
  try {
    const result = await relationshipsService.getPendingFriendRequests();
    
    if (result.success) {
      pendingRequests.value = result.pendingRequests.map(user => ({
        id: user.id,
        name: user.username,
        image: user.imagen_url,
        status: 'Solicitud pendiente',
        color: 'warning',
      }));
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    showMessage('Error al cargar solicitudes pendientes', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Obtener lista de amigos confirmados
 */
const fetchAmigos = async () => {
  loading.value = true;
  try {
    const result = await relationshipsService.getFriends();
    
    if (result.success) {
      amigos.value = result.friends.map(user => ({
        id: user.id,
        name: user.username,
        image: user.imagen_url,
        status: 'Desconectado', // Simulado por ahora
        color: 'grey',
      }));
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al obtener amigos:', error);
    showMessage('Error al cargar amigos', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Obtener lista de usuarios bloqueados
 */
const fetchBloqueados = async () => {
  loading.value = true;
  try {
    const result = await relationshipsService.getBlockedUsers();
    
    if (result.success) {
      bloqueados.value = result.blockedUsers.map(user => ({
        id: user.id,
        name: user.username,
        image: user.imagen_url,
        status: 'Bloqueado',
        color: 'error',
      }));
    } else {
      showMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error al obtener usuarios bloqueados:', error);
    showMessage('Error al cargar usuarios bloqueados', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Refrescar todos los datos de relaciones
 */
const refreshAllData = async () => {
  await Promise.all([
    fetchUsuarios(),
    fetchAmigos(),
    fetchBloqueados(),
    fetchPendingRequests()
  ]);
};

/**
 * Verificar si un usuario está seleccionado
 */
const isUsuarioSeleccionado = (usuario) => {
  return usuarioSeleccionadoId.value === (usuario.id || usuario.name);
};

/**
 * Alternar selección de usuario para mostrar/ocultar botones de acción
 */
const toggleUsuarioSeleccionado = (usuario) => {
  if (isUsuarioSeleccionado(usuario)) {
    usuarioSeleccionadoId.value = null;
  } else {
    usuarioSeleccionadoId.value = usuario.id || usuario.name;
  }
};

/**
 * Iniciar chat privado con usuario seleccionado
 */
const chatConUsuario = (usuario) => {
  emit('chat-usuario', usuario);
  showMessage(`Chat iniciado con ${usuario.name}`, 'info');
  usuarioSeleccionadoId.value = null;
};

/**
 * Enviar solicitud de amistad a usuario
 */
const agregarUsuario = async (usuario) => {
  loading.value = true;
  
  try {
    const result = await relationshipsService.sendFriendRequest(usuario.id);
    
    if (result.success) {
      showMessage('Solicitud de amistad enviada correctamente', 'success');
      emit('agregar-usuario', usuario);
      await refreshAllData();
    } else {
      showMessage(result.message || 'Error al enviar solicitud de amistad', 'error');
    }
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    showMessage('Error al enviar solicitud de amistad', 'error');
  } finally {
    loading.value = false;
    usuarioSeleccionadoId.value = null;
  }
};

/**
 * Aceptar solicitud de amistad recibida
 */
const aceptarSolicitud = async (usuario) => {
  loading.value = true;
  
  try {
    const result = await relationshipsService.acceptFriendRequest(usuario.id);
    
    if (result.success) {
      showMessage(`Has aceptado la solicitud de amistad de ${usuario.name}`, 'success');
      await refreshAllData();
      
      // Cambiar a la pestaña de amigos si no hay más solicitudes
      if (pendingRequests.value.length === 0) {
        activeTab.value = 'amigos';
      }
    } else {
      showMessage(result.message || 'Error al aceptar solicitud de amistad', 'error');
    }
  } catch (error) {
    console.error('Error al aceptar solicitud:', error);
    showMessage('Error al aceptar solicitud de amistad', 'error');
  } finally {
    loading.value = false;
    usuarioSeleccionadoId.value = null;
  }
};

/**
 * Rechazar solicitud de amistad recibida
 */
const rechazarSolicitud = async (usuario) => {
  loading.value = true;
  
  try {
    const result = await relationshipsService.rejectFriendRequest(usuario.id);
    
    if (result.success) {
      showMessage(`Has rechazado la solicitud de amistad de ${usuario.name}`, 'success');
      await refreshAllData();
      
      // Cambiar a la pestaña de usuarios si no hay más solicitudes
      if (pendingRequests.value.length === 0) {
        activeTab.value = 'usuarios';
      }
    } else {
      showMessage(result.message || 'Error al rechazar solicitud de amistad', 'error');
    }
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    showMessage('Error al rechazar solicitud de amistad', 'error');
  } finally {
    loading.value = false;
    usuarioSeleccionadoId.value = null;
  }
};

/**
 * Bloquear usuario con confirmación previa
 */
const bloquearUsuario = async (usuario) => {
  showConfirmDialog(
    'Bloquear usuario',
    `¿Estás seguro de que quieres bloquear a ${usuario.name}? No podrás enviarle mensajes ni recibir solicitudes de amistad.`,
    doBlockUser,
    usuario,
    'error'
  );
};

/**
 * Ejecutar bloqueo de usuario después de confirmación
 */
const doBlockUser = async (usuario) => {
  loading.value = true;
  
  try {
    const result = await relationshipsService.blockUser(usuario.id);
    
    if (result.success) {
      showMessage('Usuario bloqueado correctamente', 'success');
      emit('bloquear-usuario', usuario);
      await refreshAllData();
    } else {
      showMessage(result.message || 'Error al bloquear usuario', 'error');
    }
  } catch (error) {
    console.error('Error al bloquear usuario:', error);
    showMessage('Error al bloquear usuario', 'error');
  } finally {
    loading.value = false;
    usuarioSeleccionadoId.value = null;
  }
};

/**
 * Desbloquear usuario previamente bloqueado
 */
const desbloquearUsuario = async (usuario) => {
  loading.value = true;
  
  try {
    const result = await relationshipsService.unblockUser(usuario.id);
    
    if (result.success) {
      showMessage('Usuario desbloqueado correctamente', 'success');
      await refreshAllData();
    } else {
      showMessage(result.message || 'Error al desbloquear usuario', 'error');
    }
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    showMessage('Error al desbloquear usuario', 'error');
  } finally {
    loading.value = false;
    usuarioSeleccionadoId.value = null;
  }
};

/**
 * Eliminar amistad con confirmación previa
 */
const eliminarAmigo = (usuario) => {
  showConfirmDialog(
    'Eliminar amistad',
    `¿Estás seguro de que quieres eliminar a ${usuario.name} de tu lista de amigos?`,
    doRemoveFriend,
    usuario,
    'warning'
  );
};

/**
 * Ejecutar eliminación de amistad después de confirmación
 */
const doRemoveFriend = async (usuario) => {
  loading.value = true;
  
  try {
    const result = await relationshipsService.removeFriend(usuario.id);
    
    if (result.success) {
      showMessage('Amistad eliminada correctamente', 'success');
      await refreshAllData();
    } else {
      showMessage(result.message || 'Error al eliminar amistad', 'error');
    }
  } catch (error) {
    console.error('Error al eliminar amigo:', error);
    showMessage('Error al eliminar amistad', 'error');
  } finally {
    loading.value = false;
    usuarioSeleccionadoId.value = null;
  }
};

let requestCheckInterval = null;

/**
 * Iniciar verificación periódica de nuevas solicitudes cada 60 segundos
 */
const startRequestChecking = () => {
  // Detener el intervalo existente si hay alguno
  if (requestCheckInterval) {
    clearInterval(requestCheckInterval);
  }
  
  // Establecer un nuevo intervalo
  requestCheckInterval = setInterval(async () => {
    // Solo verificar si el usuario está autenticado
    if (authService.isAuthenticated()) {
      await fetchPendingRequests();
    }
  }, 60000); // Verificar cada 60 segundos
};

/**
 * Detener verificación automática al desmontar componente
 */
const stopRequestChecking = () => {
  if (requestCheckInterval) {
    clearInterval(requestCheckInterval);
    requestCheckInterval = null;
  }
};

onMounted(() => {
  refreshAllData();
  isPanelOpen.value = false;
  
  // Iniciar la verificación periódica de solicitudes
  startRequestChecking();
  
  // Agregar listener para cerrar con tecla Escape
  const handleEsc = (event) => {
    if (event.key === 'Escape' && isPanelOpen.value) {
      isPanelOpen.value = false;
    }
  };
  
  window.addEventListener('keydown', handleEsc);
  
  // Limpiar recursos al desmontar
  return () => {
    window.removeEventListener('keydown', handleEsc);
    stopRequestChecking();
  };
});

/**
 * Watcher para cambios de pestaña - resetear selección y actualizar datos
 */
watch(activeTab, (newTab) => {
  usuarioSeleccionadoId.value = null; // Reset selección al cambiar de tab
  
  // Si cambia a solicitudes y está abierto el panel, actualizar solicitudes
  if (newTab === 'solicitudes' && isPanelOpen.value) {
    fetchPendingRequests();
  }
});

/**
 * Watcher para apertura/cierre del panel - cargar datos actualizados
 */
watch(isPanelOpen, (isOpen) => {
  if (isOpen) {
    // Recargar los datos específicos para la pestaña actual
    if (activeTab.value === 'usuarios') {
      fetchUsuarios();
    } else if (activeTab.value === 'amigos') {
      fetchAmigos();
    } else if (activeTab.value === 'bloqueados') {
      fetchBloqueados();
    } else if (activeTab.value === 'solicitudes') {
      fetchPendingRequests();
    }
  }
});

/**
 * Lista filtrada según pestaña activa y término de búsqueda
 * Excluye usuarios ya relacionados y aplica filtros inteligentes
 */
const filteredList = computed(() => {
  let currentList = [];
  
  if (activeTab.value === 'usuarios') {
    // Excluir amigos, solicitudes y bloqueados de la lista de usuarios
    const amigosIds = amigos.value.map(amigo => amigo.id);
    const bloqueadosIds = bloqueados.value.map(bloqueado => bloqueado.id);
    const solicitudesIds = pendingRequests.value.map(solicitud => solicitud.id);
    
    currentList = usuarios.value.filter(usuario => 
      !amigosIds.includes(usuario.id) && 
      !bloqueadosIds.includes(usuario.id) &&
      !solicitudesIds.includes(usuario.id) &&
      usuario.id !== authService.getCurrentUser()?.id // Excluir al usuario actual
    );
  } else if (activeTab.value === 'amigos') {
    currentList = amigos.value;
  } else if (activeTab.value === 'bloqueados') {
    currentList = bloqueados.value;
  } else if (activeTab.value === 'solicitudes') {
    currentList = pendingRequests.value;
  }
  
  // Si no hay término de búsqueda, devolver la lista completa
  if (!searchQuery.value) {
    return currentList;
  }
  
  // Filtrar por término de búsqueda (nombre o ID)
  const query = searchQuery.value.toLowerCase();
  return currentList.filter(item => 
    item.name.toLowerCase().includes(query) || 
    (item.id && item.id.toString().includes(query))
  );
});
</script>

<style scoped>
.custom-circular-btn {
  background-color: #F3FE63 !important;
  border: 4px solid #E63737;
  border-radius: 50% !important;
  width: 45px !important;
  height: 45px !important;
  min-width: 45px !important;
  min-height: 45px !important;
  padding: 0 !important;
  margin: 0 8px !important;
  position: relative;
}

.custom-circular-btn .v-icon {
  font-size: 32px !important;
  color: #E63737;
}

/* Estilo personalizado para el título */
.custom-title {
  color: #D7C8FF;
  text-shadow: -2px -2px 0 #8C72D3,
               2px -2px 0 #8C72D3,
               -2px 2px 0 #8C72D3,
               2px 2px 0 #8C72D3;
  font-weight: bold;
  text-align: center;
}

/* Contenedor principal del panel */
.side-panel-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex; 
  justify-content: flex-end;
  z-index: 505;
  pointer-events: none; 
}

.side-panel {
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

/* Personalización adicional del estilo */
:deep(.v-card), 
:deep(.v-list),
:deep(.v-card-text){
  background-color: #6B4A86 !important;
  color: #E6C8FF !important;
}

/* Estilo específico para móvil */
.side-panel-mobile {
  width: 100%;
}

.search-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background-color: #6B4A86;
}

.custom-search {
  background-color: #E6C8FF !important;
  border: 4px solid #830CE8 !important;
  border-radius: 24px !important;
  color: #1a1a1a !important;
}

.close-button {
  min-width: 36px;
  width: 36px;
  height: 36px;
  color: white;
}

/* Estilo para los bordes de los items */
.user-item {
  border: 2px solid #830CE8 !important;
  border-radius: 12px !important;
  margin-bottom: 4px;
  margin-left: 8px;
  margin-right: 8px;
  background-color: #D7C8FF;
  color: black;
  transition: transform 0.2s ease;
}

/* Estilo para el botón de acción */
.action-button {
  background-color: #E6C8FF;
  border: 2px solid #830CE8;
  border-radius: 8px;
  color: #830CE8;
  font-weight: bold;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #830CE8;
  color: white;
  transform: scale(1.05);
}

/* Estilos para la selección de usuario */
.selected-user {
  background-color: #F3FE63 !important;
  box-shadow: 0 0 0 2px #E63737 !important;
  transform: scale(1.02);
  transition: all 0.2s ease;
}

.action-buttons-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 8px;
  padding: 8px 0;
  border-top: 1px dashed #830CE8;
}

/* Animaciones personalizadas */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.boton-toggle-custom .v-btn {
  background-color: #E6C8FF;
  color: #000; /* texto oscuro opcional */
}

.boton-toggle-custom .v-btn.v-btn--active {
  background-color: #830CE8 !important;
  color: white !important;
}

/* Estilo para el badge en el botón */
:deep(.v-badge__badge) {
  font-size: 10px;
  min-width: 18px;
  height: 18px;
  border: 2px solid #F3FE63;
}

/* Animación para PC - Desde la derecha */
@media (min-width: 769px) {
  .panel-enter-from {
    transform: translateX(100%);
  }
  
  .panel-leave-to {
    transform: translateX(100%);
  }
}

/* Animación para móvil - Desde abajo */
@media (max-width: 768px) {
  .panel-enter-from {
    transform: translateY(100%);
  }
  
  .panel-leave-to {
    transform: translateY(100%);
  }
  
  .side-panel {
    width: 100%;
    height: 100vh;
    margin-top: 0;
  }
}
</style>