<template>
  <!-- Header.vue -->
  <v-app-bar
    color="#BCC628"
    :height="$vuetify.display.smAndDown ? 200 : 110"
    elevation="24"
    app
    fixed
    style="border: 2px solid #8D9421; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px; z-index: 100;"
  >
    <v-row
      no-gutters
      class="fill-height"
      align="center"
      justify="center"
      style="width: 100%;"
    >
      <!-- Título (Primer tercio) -->
      <v-col cols="12" md="4" class="text-center">
        <v-toolbar-title
          class="text-h2"
          style="color: #F3FE63; text-shadow: 2px 2px 0 #E63737, -2px -2px 0 #E63737, 2px -2px 0 #E63737, -2px 2px 0 #E63737; line-height: 1.5;"
        >
          MultiGames
        </v-toolbar-title>
      </v-col>

      <!-- Barra de búsqueda (Segundo tercio) -->
      <v-col cols="12" md="4" class="d-flex justify-center">
        <v-text-field
          v-model="search"
          placeholder="Buscar Juego ..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          variant="outlined"
          density="comfortable"
          class="custom-search"
          clearable
        />
      </v-col>

      <!-- Botones (Tercer tercio) -->
      <v-col cols="12" md="4" class="d-flex justify-center align-center">
        <!-- Si está autenticado, mostrar avatar/nombre y botón de cerrar sesión -->
        <div v-if="isAuthenticated" class="d-flex align-center">
          <!-- Avatar y nombre de usuario que funciona como enlace -->
          <router-link to="/perfil" class="d-flex align-center mr-3 text-decoration-none">
            <v-avatar size="40" class="mr-2" color="primary">
              <v-img v-if="currentUser?.imagen_url" :src="currentUser.imagen_url" alt="avatar" @error="handleImageError"></v-img>
              <span v-else>{{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}</span>
            </v-avatar>
            <span class="font-weight-bold">{{ currentUser?.username || 'Usuario' }}</span>
          </router-link>
          
          <!-- Botón de cerrar sesión -->
          <v-btn icon class="custom-circular-btn" @click="cerrarSesion">
            <v-icon>mdi-logout</v-icon>
          </v-btn>

          <!-- Componente UsersBoton para gestión de usuarios -->
          <UsersBoton
            @chat-usuario="handleChatUser" 
            @agregar-usuario="agregarUsuario" 
            @bloquear-usuario="bloquearUsuario"
          />
        </div>
        
        <!-- Si no está autenticado, mostrar botón de login -->
        <BotonLogin 
          v-else
          @login="$emit('login', $event)" 
          @registro="$emit('register', $event)"
        />
      </v-col>
    </v-row>
  </v-app-bar>

  <!-- Componente de Chat Privado -->
  <PrivateChat
    v-if="isAuthenticated"
    ref="privateChatRef"
    :start-chat-with-user="selectedUserForChat"
    @chat-opened="handleChatOpened"
    @chat-closed="handleChatClosed"
  />

  <!-- Snackbar para mensajes de retroalimentación -->
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="3000"
    location="bottom right"
  >
    <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
    {{ snackbar.text }}
    <template v-slot:actions>
      <v-btn variant="text" @click="snackbar.show = false">
        Cerrar
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from 'vue';
import BotonLogin from '@/components/common/buttons/BotonLogin.vue';
import UsersBoton from '@/components/common/buttons/UsersBoton.vue';
import PrivateChat from '@/components/chat/PrivateChat.vue';

// Definir props
const props = defineProps({
  isAuthenticated: Boolean,
  currentUser: Object,
});

// Definir emits
const emit = defineEmits(['login', 'register', 'logout', 'searchChanged', 'imageError']);

// Estado del componente
const search = ref('');
const selectedUserForChat = ref(null);
const privateChatRef = ref(null);

// Snackbar para retroalimentación
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  icon: 'mdi-check-circle'
});

// Observar cambios en la búsqueda y emitirlos
watch(search, (newValue) => {
  emit('searchChanged', newValue);
});

/**
 * Mostrar mensaje de retroalimentación
 * @param {string} text - Texto del mensaje
 * @param {string} color - Color del snackbar
 * @param {string} icon - Icono a mostrar
 */
const showMessage = (text, color = 'success', icon = 'mdi-check-circle') => {
  snackbar.value = {
    show: true,
    text,
    color,
    icon
  };
};

/**
 * Manejar inicio de chat desde UsersBoton
 * @param {Object} usuario - Usuario con el que iniciar el chat
 */
const handleChatUser = async (usuario) => {
  try {
    console.log('Iniciando chat con usuario:', usuario);
    
    // Establecer el usuario para el chat
    selectedUserForChat.value = usuario;
    
    // Mostrar mensaje de confirmación
    showMessage(`Iniciando chat con ${usuario.name || usuario.username}`, 'info', 'mdi-chat');
    
    // El componente PrivateChat detectará el cambio y abrirá el chat automáticamente
  } catch (error) {
    console.error('Error al iniciar chat:', error);
    showMessage('Error al iniciar el chat', 'error', 'mdi-alert-circle');
  }
};

/**
 * Manejar evento de agregar usuario como amigo
 * @param {Object} usuario - Usuario a agregar
 */
const agregarUsuario = (usuario) => {
  console.log('Agregando usuario como amigo:', usuario);
  showMessage(`Solicitud de amistad enviada a ${usuario.name || usuario.username}`, 'success', 'mdi-account-plus');
  // La lógica de agregar amigo ya está implementada en el componente UsersBoton
};

/**
 * Manejar evento de bloquear usuario
 * @param {Object} usuario - Usuario a bloquear
 */
const bloquearUsuario = (usuario) => {
  console.log('Bloqueando usuario:', usuario);
  showMessage(`Usuario ${usuario.name || usuario.username} bloqueado`, 'warning', 'mdi-account-cancel');
  // La lógica de bloqueo ya está implementada en el componente UsersBoton
};

/**
 * Manejar cuando se abre el chat
 */
const handleChatOpened = () => {
  console.log('Chat abierto');
};

/**
 * Manejar cuando se cierra el chat
 */
const handleChatClosed = () => {
  console.log('Chat cerrado');
  // Limpiar el usuario seleccionado
  selectedUserForChat.value = null;
};

/**
 * Manejar errores de carga de imagen
 */
const handleImageError = () => {
  console.log('Error al cargar la imagen');
  emit('imageError');
};

/**
 * Manejar cierre de sesión
 */
const cerrarSesion = () => {
  // Limpiar estado del chat antes de cerrar sesión
  selectedUserForChat.value = null;
  if (privateChatRef.value) {
    privateChatRef.value.closeChat?.();
  }
  
  emit('logout');
  showMessage('Sesión cerrada correctamente', 'info', 'mdi-logout');
};

/**
 * Función pública para abrir chat desde otros componentes
 * @param {Object} usuario - Usuario con el que iniciar el chat
 */
const abrirChatConUsuario = (usuario) => {
  handleChatUser(usuario);
};

// Exponer funciones para uso externo
defineExpose({
  abrirChatConUsuario,
  handleChatUser
});
</script>

<style scoped>
.custom-search {
  background-color: #F3FE63 !important;
  border: 4px solid #E63737 !important;
  border-radius: 24px !important;
}

.custom-circular-btn {
  background-color: #F3FE63 !important;
  border: 4px solid #E63737;
  color: white !important;
  border-radius: 50% !important;
  width: 45px !important;
  height: 45px !important;
  min-width: 45px !important;
  min-height: 45px !important;
  padding: 0 !important;
  margin: 0 8px !important;
}

.custom-circular-btn .v-icon {
  font-size: 32px !important;
  color: #E63737;
}

/* Asegurar que el enlace del perfil no tenga estilos de enlace por defecto */
.text-decoration-none {
  text-decoration: none !important;
  color: inherit !important;
}

.text-decoration-none:hover {
  color: inherit !important;
  text-decoration: none !important;
}

/* Estilos para el snackbar personalizado */
:deep(.v-snackbar__content) {
  display: flex;
  align-items: center;
}
</style>