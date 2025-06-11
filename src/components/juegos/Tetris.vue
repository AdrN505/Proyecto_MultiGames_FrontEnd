<template>
  <div class="tetris-wrapper">
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
      <h1 class="game-name">Tetris</h1>
      <div></div> <!-- Para centrar el título -->
    </div>

    <!-- Contenedor principal del juego -->
    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-tetris</v-icon>
        <span>Tetris</span>
      </div>

      <!-- Barra de controles e información del juego -->
      <div class="game-controls">
        <v-btn
          color="game-btn"
          @click="resetDialogOpen = true"
          class="control-btn text-white font-weight-bold"
        >
          NUEVO JUEGO
        </v-btn>
        <div class="level-display">
          <span>Nivel: {{ level }}</span>
        </div>
        <div class="score-display">
          <v-icon color="#F3FE63" class="mr-1">mdi-star</v-icon>
          <span>{{ score }}</span>
        </div>
        <div class="timer-display">
          <v-icon color="#F3FE63" class="mr-1">mdi-clock-outline</v-icon>
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Área principal de juego con tablero y panel lateral -->
      <div class="game-play-area">
        <!-- Tablero principal de Tetris -->
        <div class="board-container" ref="boardContainer">
          <div class="game-board" :class="gameStatus">
            <div 
              v-for="(row, rowIndex) in board" 
              :key="'row-' + rowIndex" 
              class="board-row"
            >
              <div 
                v-for="(cell, colIndex) in row" 
                :key="'cell-' + rowIndex + '-' + colIndex" 
                class="board-cell"
                :class="[cell.color ? 'filled ' + cell.color : '']"
              ></div>
            </div>
          </div>
        </div>

        <!-- Panel lateral con información y controles -->
        <div class="side-panel">
          <!-- Vista previa de la siguiente pieza -->
          <div class="next-piece-container">
            <div class="next-piece-title">Siguiente pieza</div>
            <div class="next-piece-preview">
              <div 
                v-for="(row, rowIndex) in nextPieceBoard" 
                :key="'next-row-' + rowIndex" 
                class="preview-row"
              >
                <div 
                  v-for="(cell, colIndex) in row" 
                  :key="'next-cell-' + rowIndex + '-' + colIndex" 
                  class="preview-cell"
                  :class="[cell.color ? 'filled ' + cell.color : '']"
                ></div>
              </div>
            </div>
          </div>

          <!-- Información del juego -->
          <div class="game-info">
            <div class="info-item">
              <div class="info-label">Puntuación</div>
              <div class="info-value">{{ score }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Líneas</div>
              <div class="info-value">{{ lines }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Nivel</div>
              <div class="info-value">{{ level }}</div>
            </div>
          </div>

          <!-- Controles táctiles para dispositivos móviles -->
          <div class="mobile-controls" v-if="isMobile">
            <div class="control-buttons">
              <v-btn color="primary" icon @click="moveLeft">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-btn color="primary" icon @click="moveDown">
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
              <v-btn color="primary" icon @click="moveRight">
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
            <div class="rotate-buttons">
              <v-btn color="secondary" icon @click="rotate">
                <v-icon>mdi-rotate-right</v-icon>
              </v-btn>
              <v-btn color="accent" icon @click="dropDown">
                <v-icon>mdi-arrow-down-bold</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Diálogo de fin de juego -->
      <v-dialog v-model="gameOverDialog" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            ¡Game Over!
          </v-card-title>
          <v-card-text class="text-center text-white">
            <div class="score-info">
              <p>Has alcanzado {{ score }} puntos.</p>
              <div class="score-details">
                <div class="score-row">
                  <span>Nivel alcanzado:</span>
                  <span>{{ level }}</span>
                </div>
                <div class="score-row">
                  <span>Líneas eliminadas:</span>
                  <span>{{ lines }}</span>
                </div>
                <div class="score-row">
                  <span>Tiempo jugado:</span>
                  <span>{{ formattedTime }}</span>
                </div>
                <div class="score-row total-score">
                  <span>Puntuación total:</span>
                  <span>{{ score }}</span>
                </div>
              </div>
            </div>
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-btn color="error" class="text-white font-weight-bold" @click="resetDialogOpen = true">NUEVO JUEGO</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Diálogo de inicio/reinicio del juego -->
      <v-dialog v-model="resetDialogOpen" persistent max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            Tetris
          </v-card-title>
          <v-card-text class="px-4 py-4 text-white">
            <!-- Mostrar estadísticas del jugador si están disponibles -->
            <div v-if="playerStats.loaded" class="player-stats-container">
              <div class="stats-title">Tus estadísticas:</div>
              <div class="stats-row">
                <span>Partidas jugadas:</span>
                <span>{{ playerStats.gamesPlayed }}</span>
              </div>
              <div class="stats-row">
                <span>Mejor puntuación:</span>
                <span>{{ playerStats.highScore }}</span>
              </div>
              <div class="stats-row">
                <span>Nivel máximo:</span>
                <span>{{ playerStats.maxLevel }}</span>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" class="text-white font-weight-bold" @click="startGame">EMPEZAR</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Diálogo de pausa -->
      <v-dialog v-model="gamePaused" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            Juego Pausado
          </v-card-title>
          <v-card-text class="text-center text-white">
            <p>Pulsa "Continuar" para seguir jugando</p>
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-btn color="primary" class="text-white font-weight-bold" @click="resumeGame">CONTINUAR</v-btn>
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
  </div>
</template>

<script>
import { tetrisGame } from './js/solitario/tetris';
import { gameService } from '../../services/gameService';
import { authService } from '../../services/auth';
import './css/solitario/tetris.css';

export default {
  name: 'Tetris',
  data() {
    return {
      // Tableros del juego
      board: [], // Tablero principal 20x10
      nextPieceBoard: [], // Tablero de vista previa 4x4
      
      // Dimensiones del tablero
      rows: 20,
      cols: 10,
      
      // Piezas del juego
      currentPiece: null,
      nextPiece: null,
      
      // Estado del juego
      gameOver: false,
      gameWon: false,
      resetDialogOpen: false,
      gameOverDialog: false,
      gamePaused: false,
      
      // Puntuación y progreso
      score: 0,
      lines: 0, // Líneas completadas
      level: 1,
      gameSpeed: 1000, // Velocidad de caída en milisegundos
      
      // Variables del cronómetro
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // Identificador del juego en la base de datos
      gameId: 2,
      
      // Estadísticas del jugador
      playerStats: {
        loaded: false,
        gamesPlayed: 0,
        highScore: 0,
        maxLevel: 0
      },
      
      // Sistema de notificaciones
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      
      // Variables para responsive design
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Instancia del motor del juego
      game: null,
      
      // Intervalo principal del juego
      gameInterval: null
    }
  },
  computed: {
    // Clases CSS del tablero según el estado del juego
    gameStatus() {
      return {
        'game-over': this.gameOver,
        'game-active': !this.gameOver && !this.gamePaused
      }
    },
    
    // Formatear tiempo en formato mm:ss
    formattedTime() {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // Detectar si es dispositivo móvil
    isMobile() {
      return this.windowWidth < 768;
    }
  },
  created() {
    // Escuchar cambios de tamaño de ventana para responsive
    window.addEventListener('resize', this.handleResize);
    
    // Cargar estadísticas del jugador al inicio
    this.loadPlayerStats();
  },
  mounted() {
    // Configurar controles de teclado
    window.addEventListener('keydown', this.handleKeyDown);

    // Inicializar tableros vacíos
    this.initializeBoards();
    
    // Iniciar el juego automáticamente
    this.startGame();
  },
  beforeUnmount() {
    // Limpiar eventos para prevenir memory leaks
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    
    // Detener el juego
    this.stopGame();
  },
  methods: {
    // Inicializar tableros vacíos
    initializeBoards() {
      // Crear tablero principal (20 filas x 10 columnas)
      this.board = Array(this.rows).fill().map(() => 
        Array(this.cols).fill().map(() => ({ color: '' }))
      );
      
      // Crear tablero de vista previa (4x4 para mostrar siguiente pieza)
      this.nextPieceBoard = Array(4).fill().map(() => 
        Array(4).fill().map(() => ({ color: '' }))
      );
    },
    
    // Manejar cambios de tamaño de ventana
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    },
    
    // Cargar estadísticas del jugador desde la base de datos
    async loadPlayerStats() {
      try {
        // Verificar si hay una sesión activa
        const token = authService.getToken();
        
        // Si no hay token, no cargar estadísticas
        if (!token) {
          console.log('No hay sesión activa. No se cargarán estadísticas.');
          this.playerStats = {
            loaded: true,
            gamesPlayed: 0,
            highScore: 0,
            maxLevel: 0
          };
          return;
        }
        
        // Obtener estadísticas del servicio
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
              highScore: offlineStats.high_score,
              maxLevel: offlineStats.max_level || 1
            };
          } else {
            // No hay estadísticas previas
            this.playerStats = {
              loaded: true,
              gamesPlayed: 0,
              highScore: 0,
              maxLevel: 0
            };
          }
        } else {
          console.log('Sin estadísticas disponibles:', result.message);
          this.playerStats = {
            loaded: true,
            gamesPlayed: 0,
            highScore: 0,
            maxLevel: 0
          };
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Establecer valores por defecto en caso de error
        this.playerStats = {
          loaded: true,
          gamesPlayed: 0,
          highScore: 0,
          maxLevel: 0
        };
      }
    },
    
    // Mostrar notificación emergente
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    
    // Iniciar una nueva partida
    startGame() {
      this.resetDialogOpen = false;
      this.resetGame();
      
      // Iniciar cronómetro
      this.startTimer();
      
      // Crear instancia del motor de juego
      this.game = new tetrisGame({
        rows: this.rows,
        cols: this.cols,
        onRender: this.renderGame,
        onGameOver: this.handleGameOver,
        onScoreUpdate: this.updateScore
      });
      
      // Iniciar bucle principal del juego
      this.startGameLoop();
      
      // Enfocar el tablero para capturar eventos de teclado
      this.$refs.boardContainer.focus();
    },
    
    // Reiniciar variables del juego
    resetGame() {
      // Reinicializar tableros
      this.initializeBoards();
      
      // Reiniciar puntuación y estadísticas
      this.score = 0;
      this.lines = 0;
      this.level = 1;
      this.gameSpeed = 1000; // Velocidad inicial
      
      // Reiniciar estado del juego
      this.gameOver = false;
      this.gameWon = false;
      this.gameOverDialog = false;
      
      // Detener intervalos previos
      this.stopGame();
      
      // Reiniciar cronómetro
      this.stopTimer();
      this.gameTime = 0;
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
    
    // Iniciar el bucle principal del juego
    startGameLoop() {
      // Detener intervalo anterior si existe
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
      }
      
      // Crear nuevo intervalo para mover piezas automáticamente
      this.gameInterval = setInterval(() => {
        if (!this.gamePaused && !this.gameOver) {
          this.game.moveDown();
        }
      }, this.gameSpeed);
    },
    
    // Detener el bucle principal del juego
    stopGame() {
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
        this.gameInterval = null;
      }
    },
    
    // Actualizar velocidad del juego según el nivel
    updateGameSpeed() {
      // Calcular nueva velocidad (más rápido en niveles altos)
      const newSpeed = Math.max(100, 1000 - (this.level - 1) * 100);
      
      // Si cambió la velocidad, reiniciar el bucle
      if (newSpeed !== this.gameSpeed) {
        this.gameSpeed = newSpeed;
        this.startGameLoop();
      }
    },
    
    // Actualizar la vista del juego
    renderGame(gameState) {
      // Actualizar tablero principal
      this.board = gameState.board;
      
      // Actualizar vista previa de siguiente pieza
      this.nextPieceBoard = gameState.nextPieceBoard;
      
      // Actualizar puntuación y estadísticas
      this.score = gameState.score;
      this.lines = gameState.lines;
      this.level = gameState.level;
      
      // Actualizar velocidad si es necesario
      this.updateGameSpeed();
    },
    
    // Manejar fin del juego 
    handleGameOver(finalScore) {
      this.gameOver = true;
      this.stopGame();
      this.stopTimer();
      
      // Guardar resultado en la base de datos
      this.saveGameResult(finalScore);
      
      // Mostrar diálogo de fin de juego con delay
      setTimeout(() => {
        this.gameOverDialog = true;
      }, 500);
    },
    
    // Actualizar puntuación 
    updateScore(score, lines, level) {
      this.score = score;
      this.lines = lines;
      this.level = level;
    },
    
    // Guardar resultado del juego en la base de datos
    async saveGameResult(finalScore) {
      try {
        // Verificar si hay una sesión activa
        const token = authService.getToken();
        
        // Si no hay token, no guardar resultado
        if (!token) {
          console.log('No hay sesión activa. Los resultados no se guardarán.');
          return;
        }
        
        // Registrar resultado en el servicio
        const result = await gameService.recordGameResult(this.gameId, {
          mode: 'offline',
          result: 'lost', // En Tetris siempre se pierde eventualmente
          score: finalScore,
          opponent_type: 'ai',
          max_level: this.level, // Nivel máximo alcanzado
          points_earned: Math.floor(finalScore / 100) // 1 punto por cada 100 puntos
        });
        
        if (result.success) {
          // Recargar estadísticas actualizadas
          await this.loadPlayerStats();
          
          this.showSnackbar('¡Partida guardada! Has ganado ' + Math.floor(finalScore / 100) + ' puntos.', 'success');
        } else {
          console.error('Error al guardar resultado:', result.message);
        }
      } catch (error) {
        console.error('Error al guardar resultado:', error);
      }
    },
    
    // Manejar eventos del teclado
    handleKeyDown(event) {
      // No procesar si el juego está pausado o terminado
      if (this.gameOver || this.gamePaused || !this.game) return;
      
      // Mapear teclas a acciones
      switch(event.code) {
        case 'ArrowLeft':
          this.moveLeft();
          break;
        case 'ArrowRight':
          this.moveRight();
          break;
        case 'ArrowDown':
          this.moveDown();
          break;
        case 'ArrowUp':
          this.rotate();
          break;
        case 'Space':
          this.dropDown();
          break;
        case 'KeyP':
          this.togglePause();
          break;
      }
    },
    
    // Métodos de control del juego
    moveLeft() {
      if (this.game) this.game.moveLeft();
    },
    
    moveRight() {
      if (this.game) this.game.moveRight();
    },
    
    moveDown() {
      if (this.game) this.game.moveDown();
    },
    
    rotate() {
      if (this.game) this.game.rotate();
    },
    
    dropDown() {
      if (this.game) this.game.dropDown();
    },
    
    // Alternar pausa del juego
    togglePause() {
      this.gamePaused = !this.gamePaused;
      
      if (this.gamePaused) {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    },
    
    // Reanudar juego desde pausa
    resumeGame() {
      this.gamePaused = false;
      this.startTimer();
    }
  }
}
</script>