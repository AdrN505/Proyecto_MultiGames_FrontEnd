<template>
  <!-- auth/Profile.vue -->
  <div class="profile-container">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10">
          <!-- Botón para volver atrás -->
          <v-btn
            class="mb-4 back-button"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
          >
            Volver al inicio
          </v-btn>
          
          <v-card class="profile-card">
            <v-card-title class="profile-title text-center">
              <h2>Mi Perfil</h2>
            </v-card-title>
            
            <v-card-text v-if="user">
              <!-- Info Básica del Usuario -->
              <v-row>
                <v-col cols="12" md="3" class="text-center">
                  <v-avatar size="150" class="avatar-container">
                    <v-img 
                      v-if="avatarUrl" 
                      :src="fixImageUrl(avatarUrl)" 
                      alt="avatar" 
                      @error="handleImageError"
                    ></v-img>
                    <span v-else class="text-h4 avatar-text">{{ userInitials }}</span>
                  </v-avatar>
                  <div class="mt-4">
                    <input
                      ref="fileInput"
                      type="file"
                      accept="image/*"
                      style="display: none"
                      @change="onFileSelected"
                    />
                    <v-btn 
                      class="change-avatar-btn" 
                      variant="outlined" 
                      size="small" 
                      @click="triggerFileInput"
                      :disabled="isUploading"
                    >
                      {{ isUploading ? 'Subiendo...' : 'Cambiar Avatar' }}
                    </v-btn>
                  </div>
                </v-col>
                
                <!-- Columna de Información Personal -->
                <v-col cols="12" md="4">
                  <v-list class="profile-list">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-account" class="profile-icon"></v-icon>
                      </template>
                      <v-list-item-title class="list-item-title">Nombre</v-list-item-title>
                      <v-list-item-subtitle class="list-item-subtitle">{{ user.username }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-email" class="profile-icon"></v-icon>
                      </template>
                      <v-list-item-title class="list-item-title">Email</v-list-item-title>
                      <v-list-item-subtitle class="list-item-subtitle">{{ user.email }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon icon="mdi-calendar" class="profile-icon"></v-icon>
                      </template>
                      <v-list-item-title class="list-item-title">Miembro desde</v-list-item-title>
                      <v-list-item-subtitle class="list-item-subtitle">{{ formatDate(user.created_at) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                
                <!-- Columna de Estadísticas Generales -->
                <v-col cols="12" md="5">
                  <v-card variant="outlined" class="stats-overview-card">
                    <v-card-title class="stats-overview-title">
                      <v-icon class="mr-2 stats-overview-icon">mdi-trophy</v-icon>
                      Resumen de Juego
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <div class="d-flex align-center mb-3">
                            <v-icon class="mr-2 favorite-game-icon">mdi-gamepad-variant</v-icon>
                            <div class="text-h6 favorite-game-title">Juego Favorito:</div>
                            <div class="text-body-1 ml-2 favorite-game-name">{{ favoriteGame ? favoriteGame.name : 'Aún sin juegos' }}</div>
                          </div>
                        </v-col>
                        
                        <v-col cols="6" class="text-center">
                          <div class="stats-overview-number">{{ totalGamesPlayed }}</div>
                          <div class="stats-overview-label">Partidas jugadas totales</div>
                        </v-col>
                        
                        <v-col cols="6" class="text-center">
                          <div class="stats-overview-number">{{ winRatio }}%</div>
                          <div class="stats-overview-label">Ratio de victorias</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Estadísticas de Juego -->
              <v-divider class="my-4 divider"></v-divider>
              
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <h3 class="text-h5 stats-title">Estadísticas de Juego</h3>
                  <v-btn 
                    variant="outlined" 
                    @click="showDetailedStats = !showDetailedStats"
                    class="view-stats-btn"
                  >
                    {{ showDetailedStats ? 'Ver Resumen' : 'Ver Detalle' }}
                  </v-btn>
                </div>
                
                <!-- Resumen de estadísticas -->
                <v-row v-if="!showDetailedStats">
                  <v-col v-for="game in topGames" :key="game.id" cols="12" sm="6" md="4">
                    <v-card class="game-stats-card">
                      <div class="game-stats-header">
                        <v-avatar size="48" class="game-icon-avatar">
                          <v-img 
                            v-if="game.icon_path" 
                            :src="`${config.API_BACKEND_URL}/storage/${game.icon_path}`" 
                            alt="Game icon"
                          >
                          </v-img>
                          <v-icon v-else size="28">mdi-gamepad-variant</v-icon>
                        </v-avatar>
                        <div class="game-name">{{ game.name }}</div>
                      </div>
                      <v-card-text class="game-stats-body">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <div class="game-stats-label">Partidas:</div>
                          <div class="game-stats-value">{{ game.totalPlayed }}</div>
                        </div>
                        <div class="d-flex align-center justify-space-between mb-2">
                          <div class="game-stats-label">Victorias:</div>
                          <div class="game-stats-value">{{ game.totalWon }}</div>
                        </div>
                        <div class="d-flex align-center justify-space-between">
                          <div class="game-stats-label">Récord:</div>
                          <div class="game-stats-value game-high-score">{{ game.highScore }}</div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                
                <!-- Estadísticas detalladas -->
                <div v-else>
                  <v-tabs v-model="activeTab" class="stats-tabs mb-3">
                    <v-tab value="offline">Modo Offline</v-tab>
                    <v-tab value="online">Modo Online</v-tab>
                  </v-tabs>
                  
                  <v-window v-model="activeTab">
                    <!-- Pestaña de Estadísticas Offline -->
                    <v-window-item value="offline">
                      <v-table v-if="offlineStats.length > 0" class="stats-table">
                        <thead>
                          <tr>
                            <th>Juego</th>
                            <th>Partidas</th>
                            <th>Victorias</th>
                            <th>Derrotas</th>
                            <th>Empates</th>
                            <th>Puntuación Máxima</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="stat in offlineStats" :key="stat.game_id">
                            <td>{{ getGameName(stat.game_id) }}</td>
                            <td>{{ stat.games_played }}</td>
                            <td>{{ stat.games_won }}</td>
                            <td>{{ stat.games_lost }}</td>
                            <td>{{ stat.games_draw }}</td>
                            <td>{{ stat.high_score }}</td>
                          </tr>
                        </tbody>
                      </v-table>
                      <div v-else class="text-center pa-4">
                        <v-icon size="large" color="grey">mdi-trophy-outline</v-icon>
                        <p class="text-body-1 mt-2">Aún no tienes estadísticas en modo offline. ¡Juega algunas partidas!</p>
                      </div>
                    </v-window-item>
                    
                    <!-- Pestaña de Estadísticas Online -->
                    <v-window-item value="online">
                      <v-table v-if="onlineStats.length > 0" class="stats-table">
                        <thead>
                          <tr>
                            <th>Juego</th>
                            <th>Partidas</th>
                            <th>Victorias</th>
                            <th>Derrotas</th>
                            <th>Empates</th>
                            <th>Puntuación Máxima</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="stat in onlineStats" :key="stat.game_id">
                            <td>{{ getGameName(stat.game_id) }}</td>
                            <td>{{ stat.games_played }}</td>
                            <td>{{ stat.games_won }}</td>
                            <td>{{ stat.games_lost }}</td>
                            <td>{{ stat.games_draw }}</td>
                            <td>{{ stat.high_score }}</td>
                          </tr>
                        </tbody>
                      </v-table>
                      <div v-else class="text-center pa-4">
                        <v-icon size="large" color="grey">mdi-trophy-outline</v-icon>
                        <p class="text-body-1 mt-2">Aún no tienes estadísticas en modo online. ¡Desafía a otros jugadores!</p>
                      </div>
                    </v-window-item>
                  </v-window>
                </div>
              </div>
              
              <!-- Historial de Partidas Recientes -->
              <v-divider class="my-4 divider"></v-divider>
              
              <div>
                <div class="d-flex align-center justify-space-between mb-3">
                  <h3 class="text-h5 history-title">Historial de Partidas Recientes</h3>
                  <v-btn 
                    variant="outlined" 
                    @click="showAllHistory = !showAllHistory"
                    class="view-history-btn"
                  >
                    Ver Historial Completo
                  </v-btn>
                </div>
                
                <v-table v-if="gameHistory.length > 0" class="history-table">
                  <thead>
                    <tr>
                      <th>Juego</th>
                      <th>Fecha</th>
                      <th>Modo</th>
                      <th>Resultado</th>
                      <th>Puntuación</th>
                      <th>Puntos +/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="game in gameHistory" :key="game.id">
                      <td>{{ getGameName(game.game_id) }}</td>
                      <td>{{ formatDateTime(game.created_at) }}</td>
                      <td>
                        <v-chip
                          size="small"
                          :color="game.mode === 'online' ? 'primary' : 'secondary'"
                          text-color="white"
                        >
                          {{ game.mode }}
                        </v-chip>
                      </td>
                      <td>
                        <v-chip
                          size="small"
                          :color="getResultColor(game.result)"
                          text-color="white"
                        >
                          {{ formatResult(game.result) }}
                        </v-chip>
                      </td>
                      <td>{{ game.score }}</td>
                      <td>
                        <span v-if="game.points_earned > 0" class="text-success">+{{ game.points_earned }}</span>
                        <span v-else-if="game.points_lost > 0" class="text-error">-{{ game.points_lost }}</span>
                        <span v-else>0</span>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
                <div v-else class="text-center pa-4">
                  <v-icon size="large" color="grey">mdi-history</v-icon>
                  <p class="text-body-1 mt-2">No hay partidas en tu historial. ¡Comienza a jugar!</p>
                </div>
              </div>
            </v-card-text>
            
            <v-card-text v-else>
              <div class="text-center">
                <v-progress-circular indeterminate color="#BCC628"></v-progress-circular>
                <span class="ml-2">Cargando perfil...</span>
              </div>
            </v-card-text>
            
            <v-card-actions class="justify-center pa-4">
              <v-btn class="delete-account-btn mr-3" variant="outlined" @click="confirmDeleteAccount">
                Eliminar Cuenta
              </v-btn>
              <v-btn class="logout-btn" variant="text" @click="handleLogout">
                Cerrar Sesión
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Modal de Historial Completo -->
      <v-dialog v-model="showAllHistory" width="800">
        <v-card class="history-dialog-card">
          <v-card-title class="history-dialog-title">
            <h3>Historial Completo de Partidas</h3>
            <v-btn icon @click="showAllHistory = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-row class="mb-3">
              <v-col cols="12" md="4">
                <v-select
                  v-model="historyFilters.game"
                  :items="games"
                  item-title="name"
                  item-value="id"
                  label="Filtrar por juego"
                  clearable
                  @update:model-value="loadFullHistory"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="historyFilters.mode"
                  :items="[
                    { title: 'Online', value: 'online' },
                    { title: 'Offline', value: 'offline' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Modo de juego"
                  clearable
                  @update:model-value="loadFullHistory"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="historyFilters.result"
                  :items="[
                    { title: 'Victoria', value: 'won' },
                    { title: 'Derrota', value: 'lost' },
                    { title: 'Empate', value: 'draw' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Resultado"
                  clearable
                  @update:model-value="loadFullHistory"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-table v-if="fullGameHistory.length > 0" class="history-table">
              <thead>
                <tr>
                  <th>Juego</th>
                  <th>Fecha</th>
                  <th>Modo</th>
                  <th>Oponente</th>
                  <th>Resultado</th>
                  <th>Puntuación</th>
                  <th>Puntos +/-</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="game in fullGameHistory" :key="game.id">
                  <td>{{ getGameName(game.game_id) }}</td>
                  <td>{{ formatDateTime(game.created_at) }}</td>
                  <td>
                    <v-chip
                      size="small"
                      :color="game.mode === 'online' ? 'primary' : 'secondary'"
                      text-color="white"
                    >
                      {{ game.mode }}
                    </v-chip>
                  </td>
                  <td>
                    <span v-if="game.opponent_id">{{ getOpponentName(game.opponent_id) }}</span>
                    <span v-else-if="game.opponent_type === 'ai'">IA</span>
                    <span v-else-if="game.opponent_type === 'local'">Local</span>
                    <span v-else>-</span>
                  </td>
                  <td>
                    <v-chip
                      size="small"
                      :color="getResultColor(game.result)"
                      text-color="white"
                    >
                      {{ formatResult(game.result) }}
                    </v-chip>
                  </td>
                  <td>{{ game.score }}</td>
                  <td>
                    <span v-if="game.points_earned > 0" class="text-success">+{{ game.points_earned }}</span>
                    <span v-else-if="game.points_lost > 0" class="text-error">-{{ game.points_lost }}</span>
                    <span v-else>0</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <div v-else class="text-center pa-4">
              <v-icon size="large" color="grey">mdi-history</v-icon>
              <p class="text-body-1 mt-2">No se encontraron partidas con los filtros seleccionados.</p>
            </div>
            
            <!-- Paginación -->
            <div class="d-flex justify-center mt-4">
              <v-pagination
                v-model="historyPage"
                :length="historyTotalPages"
                @update:model-value="loadFullHistory"
              ></v-pagination>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
      
      <!-- Confirmación para eliminar cuenta -->
      <v-dialog v-model="showDeleteConfirm" max-width="400">
        <v-card>
          <v-card-title class="text-h5">
            Eliminar Cuenta
          </v-card-title>
          <v-card-text>
            ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              variant="text"
              @click="showDeleteConfirm = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              @click="deleteAccount"
              :loading="isDeleting"
            >
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Snackbar para mensajes -->
      <v-snackbar v-model="showMessage" :color="messageColor" :timeout="3000">
        {{ message }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showMessage = false">
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth';
import { userService } from '../../services/user';
import { gameService } from '../../services/gameService';
import { config } from '../../config';

/**
 * Perfil de Usuario - Componente Principal
 * 
 * Pantalla completa del perfil que incluye:
 * - Información personal y avatar del usuario
 * - Resumen y estadísticas detalladas de juegos por modo
 * - Historial de partidas con filtros y paginación
 * - Gestión de cuenta (eliminar cuenta, cerrar sesión)
 * - Sistema de subida y gestión de imagen de perfil
 */
const router = useRouter();

// Datos del usuario y perfil
const user = ref(null);               // Información del usuario autenticado
const avatarUrl = ref(null);          // URL del avatar actual para mostrar
const originalAvatarUrl = ref(null);  // URL original para fallback en caso de error

// Datos de juegos y estadísticas
const games = ref([]);                // Lista completa de juegos disponibles
const gameStats = ref([]);            // Estadísticas del usuario por juego y modo
const gameHistory = ref([]);          // Historial reciente de partidas (últimas 5)
const fullGameHistory = ref([]);      // Historial completo con filtros aplicados
const opponents = ref({});            // Cache de nombres de oponentes para evitar consultas repetidas

// Referencias del DOM
const fileInput = ref(null);          // Referencia al input de archivo oculto

// Estados de la UI y notificaciones
const message = ref('');              // Texto del mensaje para snackbar
const showMessage = ref(false);       // Control de visibilidad 
const messageColor = ref('success');  // Color del mensaje (success, error, warning, info)
const isUploading = ref(false);       // Estado de carga durante subida de imagen
const isDeleting = ref(false);        // Estado de carga durante eliminación de cuenta
const showDetailedStats = ref(false); // Toggle entre vista resumen y detallada de estadísticas
const activeTab = ref('offline');     // Pestaña activa en estadísticas detalladas
const showAllHistory = ref(false);    // Control del modal de historial completo
const showDeleteConfirm = ref(false); // Control del modal de confirmación de eliminación

// Sistema de filtros y paginación para historial completo
const historyFilters = ref({
  game: null,
  mode: null,
  result: null
});
const historyPage = ref(1);
const historyItemsPerPage = 10;
const historyTotalPages = ref(1);

/**
 * Estadísticas filtradas por modo offline
 * Separa las estadísticas para mostrar en pestañas diferenciadas
 */
const offlineStats = computed(() => {
  return gameStats.value.filter(stat => stat.mode === 'offline');
});

/**
 * Estadísticas filtradas por modo online
 * Para mostrar rendimiento en partidas competitivas
 */
const onlineStats = computed(() => {
  return gameStats.value.filter(stat => stat.mode === 'online');
});

/**
 * Top 3 juegos más jugados
 * Agrupa estadísticas por juego sumando ambos modos y ordena por partidas jugadas
 */
const topGames = computed(() => {
  const gameStatsMap = {};
  
  // Agrupar estadísticas por juego sumando datos de ambos modos
  for (const stat of gameStats.value) {
    if (!gameStatsMap[stat.game_id]) {
      gameStatsMap[stat.game_id] = {
        id: stat.game_id,
        name: getGameName(stat.game_id),
        icon_path: getGameIcon(stat.game_id),
        totalPlayed: 0,
        totalWon: 0,
        highScore: 0
      };
    }
    
    gameStatsMap[stat.game_id].totalPlayed += stat.games_played;
    gameStatsMap[stat.game_id].totalWon += stat.games_won;
    gameStatsMap[stat.game_id].highScore = Math.max(gameStatsMap[stat.game_id].highScore, stat.high_score);
  }
  
  return Object.values(gameStatsMap)
    .sort((a, b) => b.totalPlayed - a.totalPlayed)
    .slice(0, 3);
});

/**
 * Juego favorito del usuario (el más jugado)
 */
const favoriteGame = computed(() => {
  if (topGames.value.length === 0) return null;
  return topGames.value[0];
});

/**
 * Total de partidas jugadas en todos los juegos y modos
 */
const totalGamesPlayed = computed(() => {
  return gameStats.value.reduce((total, stat) => total + stat.games_played, 0);
});

/**
 * Ratio de victorias en porcentaje
 * Calcula el porcentaje de partidas ganadas sobre el total
 */
const winRatio = computed(() => {
  const totalGames = totalGamesPlayed.value;
  if (totalGames === 0) return 0;
  
  const totalWins = gameStats.value.reduce((total, stat) => total + stat.games_won, 0);
  return Math.round((totalWins / totalGames) * 100);
});

/**
 * Iniciales del usuario para mostrar cuando no hay avatar
 * Toma las primeras letras del nombre de usuario
 */
const userInitials = computed(() => {
  if (!user.value || !user.value.username) return '?';
  
  return user.value.username
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
});

/**
 * Cargar lista de juegos disponibles desde el servidor
 */
const loadGames = async () => {
  try {
    const result = await gameService.getAllGames();
    if (result.success) {
      games.value = result.games;
    } else {
      messageColor.value = 'error';
      message.value = result.message;
      showMessage.value = true;
    }
  } catch (error) {
    console.error('Error al cargar juegos:', error);
    messageColor.value = 'error';
    message.value = 'Error al cargar la lista de juegos';
    showMessage.value = true;
  }
};

/**
 * Cargar estadísticas de rendimiento del usuario en todos los juegos
 */
const loadGameStats = async () => {
  try {
    const result = await gameService.getGameStatistics();
    if (result.success) {
      gameStats.value = result.statistics;
    } else {
      messageColor.value = 'error';
      message.value = result.message;
      showMessage.value = true;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    messageColor.value = 'error';
    message.value = 'Error al cargar estadísticas de juegos';
    showMessage.value = true;
  }
};

/**
 * Cargar historial de partidas recientes (últimas 5 partidas)
 */
const loadGameHistory = async () => {
  try {
    const result = await gameService.getGameHistory(5);
    if (result.success) {
      gameHistory.value = result.history;
    } else {
      messageColor.value = 'error';
      message.value = result.message;
      showMessage.value = true;
    }
  } catch (error) {
    console.error('Error al cargar historial:', error);
    messageColor.value = 'error';
    message.value = 'Error al cargar historial de partidas';
    showMessage.value = true;
  }
};

/**
 * Cargar historial completo con filtros y paginación
 * NOTA: En una implementación real, estos filtros deberían procesarse en el servidor
 */
const loadFullHistory = async () => {
  try {
    // Obtener un máximo de 100 partidas para filtrado del lado cliente
    const result = await gameService.getGameHistory(100);
    
    if (result.success) {
      let filteredHistory = result.history;
      
      // Aplicar filtros del lado cliente
      if (historyFilters.value.game) {
        filteredHistory = filteredHistory.filter(game => game.game_id === historyFilters.value.game);
      }
      
      if (historyFilters.value.mode) {
        filteredHistory = filteredHistory.filter(game => game.mode === historyFilters.value.mode);
      }
      
      if (historyFilters.value.result) {
        filteredHistory = filteredHistory.filter(game => game.result === historyFilters.value.result);
      }
      
      // Calcular número total de páginas para la paginación
      historyTotalPages.value = Math.max(1, Math.ceil(filteredHistory.length / historyItemsPerPage));
      
      // Ajustar página actual si es mayor que el total
      if (historyPage.value > historyTotalPages.value) {
        historyPage.value = 1;
      }
      
      // Obtener elementos para la página actual
      const startIndex = (historyPage.value - 1) * historyItemsPerPage;
      const endIndex = startIndex + historyItemsPerPage;
      fullGameHistory.value = filteredHistory.slice(startIndex, endIndex);
      
      // Cargar nombres de oponentes si es necesario 
      for (const game of fullGameHistory.value) {
        if (game.opponent_id && !opponents.value[game.opponent_id]) {
          // En una implementación real, esto debería cargar los nombres desde el servidor
          opponents.value[game.opponent_id] = `Jugador #${game.opponent_id}`;
        }
      }
    } else {
      messageColor.value = 'error';
      message.value = result.message;
      showMessage.value = true;
    }
  } catch (error) {
    console.error('Error al cargar historial completo:', error);
    messageColor.value = 'error';
    message.value = 'Error al cargar historial completo';
    showMessage.value = true;
  }
};

/**
 * Manejar errores de carga de imagen
 * Intenta refrescar los datos del usuario cuando falla la carga de imagen
 */
const handleImageError = async () => {
  const result = await userService.refreshUserProfile();
  
  if (result.success) {
    user.value = result.user;
    if (user.value.imagen_url && user.value.imagen_url !== originalAvatarUrl.value) {
      avatarUrl.value = user.value.imagen_url;
      originalAvatarUrl.value = user.value.imagen_url;
    } else {
      // Si la imagen sigue sin funcionar, mostrar iniciales
      avatarUrl.value = null;
    }
  } else {
    // Si no se puede refrescar, mostrar iniciales
    avatarUrl.value = null;
  }
};

/**
 * Abrir selector de archivos para cambiar avatar
 */
const triggerFileInput = () => {
  fileInput.value.click();
};

/**
 * Procesar archivo de imagen seleccionado
 * Incluye preview local inmediato y subida al servidor
 */
const onFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const previewUrl = URL.createObjectURL(file);
  avatarUrl.value = previewUrl;
  
  // Actualizar la imagen en el servidor
  isUploading.value = true;
  messageColor.value = 'info';
  message.value = 'Actualizando imagen...';
  showMessage.value = true;
  
  try {
    const result = await userService.updateProfileImage(file);
    
    if (result.success) {
      messageColor.value = 'success';
      message.value = 'Imagen actualizada correctamente';
      
      // Actualizar datos del usuario local
      user.value = result.user;
      avatarUrl.value = result.user.imagen_url;
      originalAvatarUrl.value = result.user.imagen_url;
    } else {
      messageColor.value = 'error';
      message.value = result.message || 'Error al actualizar la imagen';
      
      // Revertir a la imagen original en caso de error
      if (originalAvatarUrl.value) {
        avatarUrl.value = originalAvatarUrl.value;
      } else {
        avatarUrl.value = null;
      }
    }
  } catch (error) {
    console.error('Error al actualizar la imagen:', error);
    messageColor.value = 'error';
    message.value = 'Error de conexión al actualizar la imagen';
    
    // Revertir a la imagen original
    if (originalAvatarUrl.value) {
      avatarUrl.value = originalAvatarUrl.value;
    } else {
      avatarUrl.value = null;
    }
  } finally {
    isUploading.value = false;
    showMessage.value = true;
    
    // Liberar el objeto URL creado
    URL.revokeObjectURL(previewUrl);
  }
};

/**
 * Corregir URL de imagen y añadir timestamp para evitar caché del navegador
 */
const fixImageUrl = (url) => {
  if (!url) return null;
  
  // Añadir dominio base si no está presente en la URL
  let fixedUrl = url;
  if (url && !url.startsWith('http')) {
    fixedUrl = `${config.API_BACKEND_URL}` + url;
  }
  
  // Agregar timestamp para evitar problemas de caché
  return `${fixedUrl}?t=${new Date().getTime()}`;
};

/**
 * Formatear fecha para mostrar en información personal (solo fecha)
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Formatear fecha y hora para mostrar en historial de partidas
 */
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Obtener nombre del juego a partir de su ID
 */
const getGameName = (gameId) => {
  const game = games.value.find(g => g.id === gameId);
  return game ? game.name : `Juego #${gameId}`;
};

/**
 * Obtener ruta del icono del juego a partir de su ID
 */
const getGameIcon = (gameId) => {
  const game = games.value.find(g => g.id === gameId);
  return game ? game.icon_path : null;
};

/**
 * Obtener nombre del oponente a partir de su ID 
 */
const getOpponentName = (opponentId) => {
  return opponents.value[opponentId] || `Jugador #${opponentId}`;
};

/**
 * Formatear resultado de partida para mostrar
 */
const formatResult = (result) => {
  switch (result) {
    case 'won': return 'Victoria';
    case 'lost': return 'Derrota';
    case 'draw': return 'Empate';
    case 'abandoned': return 'Abandonada';
    default: return result;
  }
};

/**
 * Obtener color de chip según el resultado de la partida
 */
const getResultColor = (result) => {
  switch (result) {
    case 'won': return 'success';
    case 'lost': return 'error';
    case 'draw': return 'warning';
    case 'abandoned': return 'grey';
    default: return 'grey';
  }
};

/**
 * Cerrar sesión del usuario y redirigir al inicio
 */
const handleLogout = async () => {
  await authService.logout();
  router.push('/');
};

/**
 * Mostrar modal de confirmación para eliminar cuenta
 */
const confirmDeleteAccount = () => {
  showDeleteConfirm.value = true;
};

/**
 * Eliminar cuenta del usuario permanentemente
 * Operación irreversible que elimina todos los datos del usuario
 */
const deleteAccount = async () => {
  isDeleting.value = true;
  
  try {
    const result = await userService.deleteAccount();
    
    if (result.success) {
      messageColor.value = 'success';
      message.value = result.message;
      showMessage.value = true;
      showDeleteConfirm.value = false;
      
      // Esperar un momento para que el usuario vea el mensaje de confirmación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la página principal con parámetro de confirmación
      router.push({
        path: '/',
        query: { accountDeleted: 'true' }
      });
    } else {
      messageColor.value = 'error';
      message.value = result.message || 'Error al eliminar la cuenta';
      showMessage.value = true;
      showDeleteConfirm.value = false;
    }
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    messageColor.value = 'error';
    message.value = 'Error de conexión al eliminar la cuenta';
    showMessage.value = true;
    showDeleteConfirm.value = false;
  } finally {
    isDeleting.value = false;
  }
};

/**
 * Volver a la página anterior (inicio)
 */
const goBack = () => {
  router.push('/');
};

/**
 * Watcher para cargar historial completo cuando se abre el modal
 * Reinicia filtros y paginación cada vez que se abre
 */
watch(showAllHistory, (newValue) => {
  if (newValue) {
    // Reiniciar filtros y paginación al abrir el modal
    historyFilters.value = {
      game: null,
      mode: null,
      result: null
    };
    historyPage.value = 1;
    loadFullHistory();
  }
});

/**
 * Inicialización del componente al montarse
 * Carga datos del usuario desde localStorage y luego todos los datos desde el servidor
 */
onMounted(async () => {
  // Obtener usuario del localStorage primero para mostrar info básica inmediatamente
  user.value = authService.getCurrentUser();
  
  if (user.value && user.value.imagen_url) {
    avatarUrl.value = user.value.imagen_url;
    originalAvatarUrl.value = user.value.imagen_url;
    
    // Verificar si la imagen almacenada es válida
    const isValid = await userService.verifyProfileImage(user.value.imagen_url);
    
    if (!isValid) {
      // Si la imagen no es válida, refrescar los datos del usuario
      const result = await userService.refreshUserProfile();
      if (result.success) {
        user.value = result.user;
        if (user.value.imagen_url) {
          avatarUrl.value = user.value.imagen_url;
        } else {
          avatarUrl.value = null;
        }
      } else {
        messageColor.value = 'error';
        message.value = 'No se pudo cargar tu perfil actualizado';
        showMessage.value = true;
      }
    }
  }
  
  // Cargar todos los datos en paralelo para mejor rendimiento
  await Promise.all([
    loadGames(),
    loadGameStats(),
    loadGameHistory()
  ]);
});
</script>

<style scoped>
@import '@/assets/styles/profile.css';
</style>