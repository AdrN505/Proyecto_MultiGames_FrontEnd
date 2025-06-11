<template>
  <div class="tic-tac-toe-wrapper">
    <!-- Barra superior con botón de regreso y título -->
    <div class="header-bar">
      <v-btn
        color="error"
        class="back-btn"
        :to="'/'"
        prepend-icon="mdi-arrow-left"
      >
        REGRESAR
      </v-btn>
      <h1 class="game-name">Tres en Raya</h1>
      <div></div> <!-- Para centrar el título -->
    </div>

    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-grid</v-icon>
        <span>Tres en Raya</span>
      </div>

      <!-- Contenido principal del juego -->
      <div class="game-content">
        <!-- Información del juego (solo para modos AI y Online) -->
        <div class="game-info-bar" v-if="gameMode !== 'local'">
          <div class="difficulty-display">
            <span>Nivel: {{ getAIDifficultyName() }}</span>
          </div>
          <div class="turn-display">
            <span>{{ getTurnText() }}</span>
          </div>
          <div class="timer-display">
            <v-icon color="#F3FE63" class="mr-1">mdi-clock-outline</v-icon>
            <span>{{ formattedTime }}</span>
          </div>
        </div>
        
        <!-- Anuncio de turno para modo local -->
        <v-row v-if="gameMode === 'local'" class="mt-4">
          <v-col cols="12" class="text-center">
            <h2 v-if="winner" class="winner-announcement">
              {{ getWinnerText() }}
            </h2>
            <h2 v-else class="turn-announcement">
              {{ getTurnText() }}
            </h2>
          </v-col>
        </v-row>
        
        <!-- Tablero de juego 3x3 -->
        <div class="board mt-4">
          <v-card
            v-for="(cell, index) in board"
            :key="index"
            class="cell"
            elevation="2"
            :class="[
              { 'win-highlight': winningCells.includes(index) },
              cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : 'cell-empty'
            ]"
            @click="makeMove(index)"
            :disabled="cell !== null || winner !== null"
            :color="getCellColor(cell)"
          >
            <span v-if="cell" class="cell-content">{{ cell }}</span>
            <span v-else class="cell-placeholder"></span>
          </v-card>
        </div>
        
        <!-- Botón de reinicio -->
        <v-row class="mt-8">
          <v-col cols="12" class="text-center action-buttons">
            <v-btn
              color="success"
              class="action-btn text-white"
              @click="resetGame"
            >
              REINICIAR JUEGO
            </v-btn>
          </v-col>
        </v-row>
        
        <!-- Marcador de victorias -->
        <v-row class="score-cards">
          <v-col cols="12" sm="6">
            <v-card class="pa-4 text-center score-card x-player-card">
              <h3>{{ getPlayerXName() }}</h3>
              <p class="text-h4">{{ xWins }}</p>
              <p>Victorias</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card class="pa-4 text-center score-card o-player-card">
              <h3>{{ getPlayerOName() }}</h3>
              <p class="text-h4">{{ oWins }}</p>
              <p>Victorias</p>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Diálogo de selección de modo de juego -->
    <v-dialog v-model="modeSelectDialog" persistent max-width="500">
      <v-card class="dialog-card">
        <v-card-title class="text-center dialog-title text-white">
          Selecciona Modo de Juego
        </v-card-title>
        <v-card-text class="px-4 py-4 text-white">
          <v-row>
            <v-col cols="12" v-for="mode in gameModes" :key="mode.id">
              <v-card
                class="mode-card"
                :class="{ 'selected': selectedMode === mode.id }"
                @click="selectedMode = mode.id"
                elevation="2"
              >
                <v-card-title>{{ mode.title }}</v-card-title>
                <v-card-text>{{ mode.description }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Opciones de dificultad para modo IA -->
          <v-expand-transition>
            <div v-if="selectedMode === 'ai'">
              <v-divider class="my-4"></v-divider>
              <h3 class="mb-3">Selecciona dificultad</h3>
              <v-radio-group v-model="aiDifficulty" class="mt-2">
                <v-radio
                  v-for="difficulty in aiDifficulties"
                  :key="difficulty.value"
                  :value="difficulty.value"
                  :label="difficulty.label"
                  color="success"
                ></v-radio>
              </v-radio-group>
            </div>
          </v-expand-transition>

          <!-- Mostrar estadísticas del jugador si hay sesión activa -->
          <div v-if="hasSession && selectedMode !== 'local'" class="player-stats-container mt-4">
            <div class="stats-title">Tus estadísticas:</div>
            <div class="stats-row">
              <span>Partidas jugadas:</span>
              <span>{{ playerStats.gamesPlayed || 0 }}</span>
            </div>
            <div class="stats-row">
              <span>Victorias:</span>
              <span>{{ playerStats.gamesWon || 0 }}</span>
            </div>
            <div class="stats-row">
              <span>Mejor puntuación:</span>
              <span>{{ playerStats.highScore || 0 }}</span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn 
            color="primary" 
            class="text-white dialog-btn"
            @click="startGame" 
            :disabled="!selectedMode"
          >
            COMENZAR JUEGO
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de búsqueda de oponente online (funcionalidad futura) -->
    <v-dialog v-model="onlineSearchDialog" persistent max-width="400">
      <v-card class="dialog-card">
        <v-card-title class="text-center dialog-title text-white">
          Buscando oponente...
        </v-card-title>
        <v-card-text class="text-center pa-5">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
          <p class="mt-4 text-white">Buscando un oponente en línea. Por favor espera...</p>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn color="error" class="text-white dialog-btn" @click="cancelOnlineSearch">
            CANCELAR
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de fin de juego -->
    <v-dialog v-model="gameOverDialog" max-width="350">
      <v-card class="dialog-card">
        <v-card-title class="text-center dialog-title text-white">
          {{ gameOverTitle }}
        </v-card-title>
        <v-card-text class="text-center text-white">
          <div v-if="winner === 'X' && gameMode === 'ai'" class="score-info">
            <p>¡Has ganado la partida!</p>
            <div class="score-details" v-if="hasSession">
              <div class="score-row">
                <span>Dificultad:</span>
                <span>{{ getAIDifficultyName() }}</span>
              </div>
              <div class="score-row">
                <span>Base de puntos:</span>
                <span>{{ baseScore }}</span>
              </div>
              <div class="score-row">
                <span>Bonus por tiempo:</span>
                <span>{{ timeBonus }}</span>
              </div>
              <div class="score-row total-score">
                <span>Puntuación total:</span>
                <span>{{ totalScore }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="winner === 'O' && gameMode === 'ai'">
            <p>La IA ha ganado la partida.</p>
          </div>
          <div v-else-if="winner === 'draw'">
            <p>La partida ha terminado en empate.</p>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn color="secondary" class="text-white dialog-btn mx-2" @click="showModeSelect">CAMBIAR MODO</v-btn>
          <v-btn color="primary" class="text-white dialog-btn mx-2" @click="resetGame">JUGAR DE NUEVO</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notificaciones emergentes -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { gameService } from '../../services/gameService';
import { authService } from '../../services/auth';
import LocalGame from './js/multijugador/TresEnRaya/LocalGame.js';
import AIGame from './js/multijugador/TresEnRaya/aiGame.js';
import OnlineGame from './js/multijugador/TresEnRaya/OnlineGame.js';

export default {
  name: 'TresEnRaya',
  data() {
    return {
      // Estado principal del tablero de juego (9 celdas)
      board: Array(9).fill(null),
      
      // Jugador actual ('X' o 'O')
      currentPlayer: 'X',
      
      // Estado del juego
      winner: null,
      winningCells: [], // Celdas que forman la línea ganadora
      xWins: 0, // Contador de victorias del jugador X
      oWins: 0, // Contador de victorias del jugador O
      gameWon: false,
      
      // Manejador de lógica del juego según el modo
      gameHandler: null,
      gameMode: null, // 'local', 'ai', o 'online'
      
      // Control de diálogos
      modeSelectDialog: true, // Mostrar selector de modo al inicio
      onlineSearchDialog: false,
      gameOverDialog: false,
      gameOverTitle: '',
      
      // Configuración de modos de juego
      selectedMode: null,
      gameModes: [
        { 
          id: 'local', 
          title: 'Juego Local', 
          description: 'Juega en el mismo dispositivo alternando turnos. No se registrarán puntuaciones.' 
        },
        { 
          id: 'ai', 
          title: 'Juego contra IA', 
          description: 'Juega contra la inteligencia artificial con diferentes niveles de dificultad.' 
        },
        { 
          id: 'online', 
          title: 'Juego Online', 
          description: 'Juega contra otros jugadores en línea. (Próximamente)' 
        }
      ],
      
      // Configuración de dificultad para modo IA
      aiDifficulty: 'normal',
      aiDifficulties: [
        { value: 'normal', label: 'Normal' },
        { value: 'hard', label: 'Difícil' },
        { value: 'impossible', label: 'Imposible' }
      ],
      
      // Sistema de puntuación (solo para modo IA)
      baseScore: 0,
      timeBonus: 0,
      totalScore: 0,
      
      // Variables del cronómetro
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // Identificador del juego en la base de datos
      gameId: 5,
      
      // Control de sesión de usuario
      hasSession: false,
      
      // Estadísticas del jugador
      playerStats: {
        loaded: false,
        gamesPlayed: 0,
        gamesWon: 0,
        highScore: 0
      },
      
      // Sistema de notificaciones
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    };
  },
  computed: {
    // Formatear tiempo del cronómetro en formato mm:ss
    formattedTime() {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  created() {
    // Verificar si hay una sesión activa al crear el componente
    this.checkSession();
  },
  beforeUnmount() {
    // Limpiar el cronómetro al destruir el componente
    this.stopTimer();
  },
  methods: {
    // Verificar si el usuario tiene una sesión activa
    async checkSession() {
      const token = authService.getToken();
      this.hasSession = !!token;
      
      if (this.hasSession) {
        await this.loadPlayerStats();
      }
    },
    
    // Cargar estadísticas del jugador desde la base de datos
    async loadPlayerStats() {
      try {
        // Obtener estadísticas para este juego específico
        const result = await gameService.getGameStatistics(this.gameId);
        
        if (result.success) {
          // Buscar estadísticas del modo offline
          const offlineStats = result.statistics.find(stat => 
            stat.mode === 'offline' && stat.game_id === this.gameId
          );
          
          if (offlineStats) {
            this.playerStats = {
              loaded: true,
              gamesPlayed: offlineStats.games_played,
              gamesWon: offlineStats.games_won,
              highScore: offlineStats.high_score
            };
          } else {
            // No hay estadísticas previas
            this.initializeEmptyStats();
          }
        } else {
          console.log('Sin estadísticas disponibles:', result.message);
          this.initializeEmptyStats();
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        this.initializeEmptyStats();
      }
    },
    
    // Inicializar estadísticas vacías
    initializeEmptyStats() {
      this.playerStats = {
        loaded: true,
        gamesPlayed: 0,
        gamesWon: 0,
        highScore: 0
      };
    },
    
    // Mostrar notificación emergente
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    
    // Iniciar el cronómetro del juego
    startTimer() {
      this.gameStartTime = Date.now();
      this.gameTime = 0;
      
      // Actualizar tiempo cada segundo
      this.timerInterval = setInterval(() => {
        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
      }, 1000);
    },
    
    // Detener el cronómetro
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    
    // Iniciar juego según el modo seleccionado
    startGame() {
      this.modeSelectDialog = false;
      this.gameMode = this.selectedMode;
      
      // Crear el manejador de juego apropiado según el modo
      switch (this.gameMode) {
        case 'local':
          this.gameHandler = new LocalGame();
          break;
        case 'ai':
          this.gameHandler = new AIGame(this.aiDifficulty);
          // Iniciar cronómetro para modo IA
          this.startTimer();
          // Obtener puntuación base desde el manejador
          this.baseScore = this.gameHandler.baseScore;
          break;
        case 'online':
          this.gameHandler = new OnlineGame();
          this.onlineSearchDialog = true;
          // Simular búsqueda de oponente (funcionalidad futura)
          setTimeout(() => {
            this.onlineSearchDialog = false;
            // Iniciar cronómetro para modo online
            this.startTimer();
          }, 3000);
          break;
      }
      
      // Inicializar tablero
      this.resetGame();
    },
    
    // Realizar un movimiento en el tablero
    makeMove(index) {
      // Validar que el movimiento sea posible
      if (!this.gameHandler || this.winner || this.board[index] !== null) {
        return;
      }
      
      // Delegar la lógica al manejador del modo de juego
      const result = this.gameHandler.makeMove(index, this.board, this.currentPlayer);
      
      if (result) {
        this.board = result.board;
        this.currentPlayer = result.currentPlayer;
        this.checkWinner();
      }
    },
    
    // Verificar si hay un ganador o empate
    checkWinner() {
      // Todas las combinaciones ganadoras posibles
      const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas horizontales
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas verticales
        [0, 4, 8], [2, 4, 6]             // diagonales
      ];
      
      // Buscar una combinación ganadora
      for (const combo of winningCombinations) {
        const [a, b, c] = combo;
        if (
          this.board[a] && 
          this.board[a] === this.board[b] && 
          this.board[a] === this.board[c]
        ) {
          this.winner = this.board[a];
          this.winningCells = combo;
          
          // Actualizar contadores de victoria
          if (this.winner === 'X') {
            this.xWins++;
            this.gameWon = true;
            if (this.gameMode === 'ai') {
              this.handleAIWin();
            }
          } else {
            this.oWins++;
            this.gameWon = false;
          }
          
          // Detener cronómetro
          if (this.gameMode !== 'local') {
            this.stopTimer();
          }
          
          this.showGameOver();
          return;
        }
      }
      
      // Verificar empate (tablero lleno sin ganador)
      if (!this.board.includes(null)) {
        this.winner = 'draw';
        this.gameWon = false;
        
        // Detener cronómetro
        if (this.gameMode !== 'local') {
          this.stopTimer();
        }
        
        this.showGameOver();
      }
      
      // Turno de la IA si corresponde
      if (this.gameMode === 'ai' && this.currentPlayer === 'O' && !this.winner) {
        // Pequeño delay para mostrar el movimiento del jugador
        setTimeout(() => {
          const aiResult = this.gameHandler.makeAIMove(this.board);
          if (aiResult) {
            this.board = aiResult.board;
            this.currentPlayer = aiResult.currentPlayer;
            this.checkWinner();
          }
        }, 500);
      }
    },
    
    // Manejar victoria del jugador contra IA
    handleAIWin() {
      // Calcular puntuación usando el manejador de IA
      const scoreResult = this.gameHandler.calculateScore(true, this.gameTime);
      this.baseScore = scoreResult.baseScore;
      this.timeBonus = scoreResult.timeBonus;
      this.totalScore = scoreResult.totalScore;
      
      // Guardar resultado si hay sesión activa
      if (this.hasSession) {
        this.saveGameResult(true);
      }
    },
    
    // Guardar resultado del juego en la base de datos
    async saveGameResult(isVictory) {
      try {
        // Solo registrar para modo AI y con sesión activa
        if (this.gameMode !== 'ai' || !this.hasSession) {
          return;
        }
        
        // Enviar resultado al servicio
        const result = await gameService.recordGameResult(this.gameId, {
          mode: 'offline',
          result: isVictory ? 'won' : 'lost',
          score: isVictory ? this.totalScore : 0,
          opponent_type: 'ai',
          difficulty: this.aiDifficulty,
          points_earned: isVictory ? Math.floor(this.totalScore / 10) : 0,
          points_lost: isVictory ? 0 : 5
        });
        
        if (result.success) {
          // Recargar estadísticas actualizadas
          await this.loadPlayerStats();
          
          if (isVictory) {
            this.showSnackbar('¡Partida guardada! Has ganado ' + Math.floor(this.totalScore / 10) + ' puntos.', 'success');
          }
        } else {
          console.error('Error al guardar resultado:', result.message);
        }
      } catch (error) {
        console.error('Error al guardar resultado:', error);
      }
    },
    
    // Reiniciar el juego manteniendo el modo actual
    resetGame() {
      this.board = Array(9).fill(null);
      this.currentPlayer = 'X';
      this.winner = null;
      this.winningCells = [];
      this.gameOverDialog = false;
      this.gameWon = false;
      
      // Reiniciar el manejador de juego
      if (this.gameHandler) {
        this.gameHandler.resetGame();
      }
      
      // Reiniciar cronómetro para modos con tiempo
      if (this.gameMode !== 'local') {
        this.stopTimer();
        this.gameTime = 0;
        this.startTimer();
      }
    },
    
    // Mostrar diálogo de fin de juego
    showGameOver() {
      // Configurar título según el resultado
      if (this.winner === 'X') {
        this.gameOverTitle = '¡Victoria!';
      } else if (this.winner === 'O') {
        this.gameOverTitle = '¡Has perdido!';
      } else {
        this.gameOverTitle = '¡Empate!';
      }
      
      // Mostrar diálogo con delay para ver el resultado
      setTimeout(() => {
        this.gameOverDialog = true;
      }, 1000);
    },
    
    // Volver al selector de modo
    showModeSelect() {
      this.resetGame();
      this.stopTimer();
      this.modeSelectDialog = true;
      this.gameOverDialog = false;
    },
    
    // Cancelar búsqueda de oponente online
    cancelOnlineSearch() {
      this.onlineSearchDialog = false;
      this.showModeSelect();
    },
    
    // Obtener texto del ganador según el modo
    getWinnerText() {
      if (this.winner === 'draw') {
        return '¡Empate!';
      }
      
      if (this.gameMode === 'ai') {
        return this.winner === 'X' ? '¡Has ganado!' : 'IA ha ganado';
      }
      
      return `¡Jugador ${this.winner} gana!`;
    },
    
    // Obtener texto del turno actual
    getTurnText() {
      if (this.gameMode === 'ai') {
        return this.currentPlayer === 'X' ? 'Tu turno' : 'Turno de la IA';
      }
      
      return `Turno del Jugador: ${this.currentPlayer}`;
    },
    
    // Obtener nombre del jugador X según el modo
    getPlayerXName() {
      return this.gameMode === 'ai' ? 'Jugador' : 'Jugador X';
    },
    
    // Obtener nombre del jugador O según el modo
    getPlayerOName() {
      return this.gameMode === 'ai' ? 'IA' : 'Jugador O';
    },
    
    // Obtener color de la celda según su contenido
    getCellColor(cell) {
      if (cell === 'X') return 'blue-lighten-4';
      if (cell === 'O') return 'red-lighten-4';
      return 'grey-lighten-5';
    },
    
    // Obtener nombre legible de la dificultad de IA
    getAIDifficultyName() {
      const difficulty = this.aiDifficulties.find(d => d.value === this.aiDifficulty);
      return difficulty ? difficulty.label : '';
    }
  }
};
</script>

<style scoped>
@import '@/components/juegos/css/multijugador/tres-raya.css';
</style>