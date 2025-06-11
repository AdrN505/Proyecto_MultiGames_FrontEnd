<template>
  <!--admin/GestorDeJuegos.vue-->
  <div class="admin-games-container">
    <v-container>
      <v-card class="admin-card">
        <v-card-title class="admin-title text-center">
          <h2>Administración de Juegos</h2>
        </v-card-title>
        
        <v-card-actions>
          <v-btn color="primary" @click="openAddDialog">
            Añadir Nuevo Juego
          </v-btn>
        </v-card-actions>
        
        <v-card-text>
          <v-table class="games-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Icono</th>
                <th>Nombre</th>
                <th>Modo</th>
                <th>Multijugador</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="game in games" :key="game.id">
                <td>{{ game.id }}</td>
                <td>
                  <v-avatar size="40">
                    <v-img 
                      v-if="game.icon_path" 
                      :src="getIconUrl(game.icon_path)" 
                      alt="icon"
                    ></v-img>
                    <v-icon v-else>mdi-gamepad-variant</v-icon>
                  </v-avatar>
                </td>
                <td>{{ game.name }}</td>
                <td>{{ game.mode }}</td>
                <td>{{ game.is_multiplayer ? 'Sí' : 'No' }}</td>
                <td>
                  <v-btn
                    icon
                    size="small"
                    class="mr-2"
                    @click="openEditDialog(game)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    color="error"
                    @click="confirmDelete(game)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
    
    <!-- Diálogo para añadir/editar juego -->
    <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editMode ? 'Editar Juego' : 'Añadir Nuevo Juego' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedGame.name"
              label="Nombre del juego"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
            ></v-text-field>
            
            <v-select
              v-model="editedGame.mode"
              :items="['online', 'offline', 'both']"
              label="Modo de juego"
              :rules="[v => !!v || 'El modo es requerido']"
              required
            ></v-select>
            
            <v-textarea
              v-model="editedGame.description"
              label="Descripción"
            ></v-textarea>
            
            <v-switch
              v-model="editedGame.is_multiplayer"
              label="Es multijugador"
              color="primary"
            ></v-switch>
            
            <v-file-input
              v-model="iconFile"
              label="Icono del juego"
              accept="image/*"
              prepend-icon="mdi-image"
            ></v-file-input>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="dialogVisible = false">
            Cancelar
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveGame" 
            :disabled="!valid || loading"
          >
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar el juego "{{ gameToDelete?.name }}"?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            @click="deleteGame" 
            :disabled="loading"
          >
            {{ loading ? 'Eliminando...' : 'Eliminar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn text @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { authService } from '../../services/auth';

/**
 * Gestor de Juegos - Componente de Administración
 * 
 * Permite a los administradores gestionar el catálogo de juegos:
 * - Ver lista completa de juegos con iconos
 * - Crear nuevos juegos con formulario de validación
 * - Editar juegos existentes
 * - Eliminar juegos con confirmación
 * - Subida de iconos de juego
 */

// Lista de juegos obtenida del servidor
const games = ref([]);

// Control de diálogos modales
const dialogVisible = ref(false);      // Modal de añadir/editar
const deleteDialog = ref(false);       // Modal de confirmación de eliminación

// Estados de operación
const editMode = ref(false);           // true = editar, false = crear nuevo
const valid = ref(true);               // Estado de validación del formulario
const loading = ref(false);            // Indicador de carga para operaciones async
const iconFile = ref(null);            // Archivo de icono seleccionado

// Referencias del template
const gameToDelete = ref(null);        // Juego seleccionado para eliminar
const form = ref(null);                // Referencia al formulario de validación

// Objeto reactivo para datos del juego en edición
const editedGame = reactive({
  id: null,
  name: '',
  mode: 'offline',                     // Valor por defecto
  description: '',
  is_multiplayer: false
});

// Sistema de notificaciones
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'                     // success, error, warning, info
});

/**
 * Obtener lista de juegos desde el servidor
 * Carga todos los juegos disponibles para mostrar en la tabla
 */
const fetchGames = async () => {
  try {
    const token = authService.getToken();
    const response = await fetch('http://localhost:8000/api/admin/games', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener juegos');
    }
    
    const data = await response.json();
    games.value = data;
  } catch (error) {
    console.error('Error:', error);
    showSnackbar('No se pudieron cargar los juegos', 'error');
  }
};

/**
 * Guardar juego (crear nuevo o actualizar existente)
 * Utiliza FormData para manejar la subida de archivos de imagen
 */
const saveGame = async () => {
  if (!valid.value) return;
  
  loading.value = true;
  
  try {
    const token = authService.getToken();
    const formData = new FormData();
    
    // Añadir campos del juego al FormData
    formData.append('name', editedGame.name);
    formData.append('mode', editedGame.mode);
    formData.append('description', editedGame.description);
    formData.append('is_multiplayer', editedGame.is_multiplayer ? '1' : '0');
    
    // Añadir archivo de icono si se seleccionó uno
    if (iconFile.value) {
      formData.append('icon', iconFile.value);
    }
    
    // Determinar método HTTP y URL según el modo
    const method = editMode.value ? 'PUT' : 'POST';
    const url = editMode.value 
      ? `http://localhost:8000/api/admin/games/${editedGame.id}`
      : 'http://localhost:8000/api/admin/games';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`

      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error al guardar el juego');
    }
    
    const data = await response.json();
    showSnackbar(data.message, 'success');
    dialogVisible.value = false;
    fetchGames(); // Recargar lista
  } catch (error) {
    console.error('Error:', error);
    showSnackbar('Error al guardar el juego', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Eliminar juego del servidor
 * Solo se ejecuta después de confirmación del usuario
 */
const deleteGame = async () => {
  if (!gameToDelete.value) return;
  
  loading.value = true;
  
  try {
    const token = authService.getToken();
    const response = await fetch(`http://localhost:8000/api/admin/games/${gameToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el juego');
    }
    
    const data = await response.json();
    showSnackbar(data.message, 'success');
    deleteDialog.value = false;
    fetchGames(); // Recargar lista
  } catch (error) {
    console.error('Error:', error);
    showSnackbar('Error al eliminar el juego', 'error');
  } finally {
    loading.value = false;
    gameToDelete.value = null;
  }
};

/**
 * Abrir modal para crear nuevo juego
 * Resetea el formulario y establece modo creación
 */
const openAddDialog = () => {
  editMode.value = false;
  resetForm();
  dialogVisible.value = true;
};

/**
 * Abrir modal para editar juego existente
 * Carga los datos del juego en el formulario
 */
const openEditDialog = (game) => {
  editMode.value = true;
  editedGame.id = game.id;
  editedGame.name = game.name;
  editedGame.mode = game.mode;
  editedGame.description = game.description || '';
  editedGame.is_multiplayer = game.is_multiplayer;
  iconFile.value = null; // Limpiar archivo seleccionado
  dialogVisible.value = true;
};

/**
 * Mostrar confirmación antes de eliminar
 * Previene eliminaciones accidentales
 */
const confirmDelete = (game) => {
  gameToDelete.value = game;
  deleteDialog.value = true;
};

/**
 * Resetear formulario a valores por defecto
 * Limpia validaciones y referencias de archivo
 */
const resetForm = () => {
  editedGame.id = null;
  editedGame.name = '';
  editedGame.mode = 'offline';
  editedGame.description = '';
  editedGame.is_multiplayer = false;
  iconFile.value = null;
  
  // Limpiar validaciones si el formulario existe
  if (form.value) {
    form.value.resetValidation();
  }
};

/**
 * Construir URL completa para iconos de juego
 * Añade el dominio base para acceso a archivos de storage
 */
const getIconUrl = (path) => {
  return `http://localhost:8000/storage/${path}`;
};

/**
 * Mostrar notificación snackbar
 * Sistema unificado de mensajes para el usuario
 */
const showSnackbar = (text, color = 'success') => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

/**
 * Inicialización del componente
 * Carga la lista de juegos al montar
 */
onMounted(() => {
  fetchGames();
});
</script>

<style scoped>

</style>