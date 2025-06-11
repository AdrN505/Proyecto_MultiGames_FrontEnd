<template>
  <div class="puzzle-wrapper">
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
      <h1 class="game-name">Puzzle Deslizante</h1>
      <div></div>
    </div>

    <!-- Contenedor principal del juego -->
    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-puzzle</v-icon>
        <span>Puzzle Deslizante</span>
      </div>

      <!-- Barra de controles e información del juego -->
      <div class="game-controls">
        <v-btn
          color="game-btn"
          @click="resetGameBtn"
          class="control-btn text-white font-weight-bold"
        >
          NUEVO JUEGO
        </v-btn>
        <!-- Selector de tamaño del tablero -->
        <div class="size-display">
          <v-select
            v-model="tamanoTablero"
            :items="[3, 4, 5]"
            @update:model-value="iniciarJuego"
            :disabled="!gameOver && !resetDialogOpen"
            hide-details
            density="compact"
            variant="outlined"
            class="size-select"
            label="Tamaño"
          ></v-select>
        </div>
        <div class="moves-display">
          <v-icon color="info" class="mr-1">mdi-cursor-move</v-icon>
          <span>{{ movimientos }}</span>
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

      <!-- Área principal de juego -->
      <div class="game-play-area">
        <!-- Tablero del puzzle centrado -->
        <div class="puzzle-container">
          <div 
            class="puzzle-board" 
            :style="{ 
              gridTemplateColumns: `repeat(${tamanoTablero}, 1fr)`,
              width: `${tamanoTablero * 70}px`,
              height: `${tamanoTablero * 70}px`
            }"
          >
            <!-- Cada pieza del puzzle -->
            <div 
              v-for="(pieza, index) in tablero" 
              :key="index" 
              @click="moverPieza(index)"
              class="puzzle-tile"
              :class="{ 
                'puzzle-tile-empty': pieza === 0,
                'puzzle-tile-correct': !juegoCompletado && pieza !== 0 && pieza === index + 1
              }"
            >
              <span v-if="pieza !== 0">{{ pieza }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Diálogo de victoria -->
      <v-dialog v-model="gameOverDialog" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            ¡Felicidades!
          </v-card-title>
          <v-card-text class="text-center text-white">
            <div class="score-info">
              <p>¡Has completado el puzzle!</p>
              <div class="score-details">
                <div class="score-row">
                  <span>Tamaño del puzzle:</span>
                  <span>{{ tamanoTablero }}x{{ tamanoTablero }}</span>
                </div>
                <div class="score-row">
                  <span>Movimientos:</span>
                  <span>{{ movimientos }}</span>
                </div>
                <div class="score-row">
                  <span>Tiempo:</span>
                  <span>{{ formattedTime }}</span>
                </div>
                <div class="score-row">
                  <span>Puntos base:</span>
                  <span>{{ baseScore }}</span>
                </div>
                <div class="score-row">
                  <span>Bonus por eficiencia:</span>
                  <span>{{ efficiencyBonus }}</span>
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
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-btn color="error" class="text-white font-weight-bold" @click="resetGameBtn">NUEVO JUEGO</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Diálogo de inicio del juego -->
      <v-dialog v-model="resetDialogOpen" persistent max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            Puzzle Deslizante
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
                <span>Partidas ganadas:</span>
                <span>{{ playerStats.gamesWon }}</span>
              </div>
              <div class="stats-row">
                <span>Mejor puntuación:</span>
                <span>{{ playerStats.highScore }}</span>
              </div>
            </div>
            
            <!-- Selector de dificultad (tamaño del tablero) -->
            <div class="difficulty-selection">
              <div class="difficulty-title">Selecciona la dificultad:</div>
              <v-btn-toggle v-model="tamanoTablero" mandatory class="difficulty-buttons">
                <v-btn :value="3" class="difficulty-btn">3x3</v-btn>
                <v-btn :value="4" class="difficulty-btn">4x4</v-btn>
                <v-btn :value="5" class="difficulty-btn">5x5</v-btn>
              </v-btn-toggle>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" class="text-white font-weight-bold" @click="startGame">EMPEZAR</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Notificaciones emergentes -->
      <v-snackbar v-model="showSnackbar" :color="snackbarColor">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
        </template>
      </v-snackbar>
    </div>
  </div>
</template>

<script>
import { gameService } from '../../services/gameService';
import { authService } from '../../services/auth';

export default {
  name: 'PuzzleGame',
  data() {
    return {
      // Estado del tablero de juego
      tablero: [], // Array que representa las piezas del puzzle
      tamanoTablero: 3, // Tamaño del tablero (3x3, 4x4, 5x5)
      espacioVacio: 0, // Posición del espacio vacío
      
      // Estadísticas del juego
      movimientos: 0, // Número de movimientos realizados
      gameOver: false,
      juegoCompletado: false,
      
      // Control de diálogos
      resetDialogOpen: true, // Mostrar diálogo de inicio
      gameOverDialog: false,
      
      // Sistema de puntuación
      score: 0,
      baseScore: 0, // Puntuación base según dificultad
      efficiencyBonus: 0, // Bonus por pocos movimientos
      timeBonus: 0, // Bonus por tiempo rápido
      totalScore: 0,
      
      // Variables del cronómetro
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // ID del juego en la base de datos
      gameId: 6,
      
      // Estadísticas del jugador
      playerStats: {
        loaded: false,
        gamesPlayed: 0,
        gamesWon: 0,
        highScore: 0
      },
      
      // Sistema de notificaciones simplificado
      showSnackbar: false,
      snackbarText: '',
      snackbarColor: 'success'
    }
  },
  computed: {
    // Formatear tiempo en formato mm:ss
    formattedTime() {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  created() {
    // Cargar estadísticas del jugador al crear el componente
    this.loadPlayerStats();
  },
  beforeUnmount() {
    // Limpiar el cronómetro al destruir el componente
    this.stopTimer();
  },
  methods: {
    // Cargar estadísticas del jugador desde la base de datos
    async loadPlayerStats() {
      try {
        // Verificar si hay una sesión activa
        const token = authService.getToken();
        
        if (!token) {
          this.playerStats = {
            loaded: true,
            gamesPlayed: 0,
            gamesWon: 0,
            highScore: 0
          };
          return;
        }
        
        // Obtener estadísticas del servicio
        const result = await gameService.getGameStatistics();
        
        if (result.success) {
          // Buscar estadísticas específicas del puzzle
          const puzzleStats = result.statistics.find(stat => 
            stat.mode === 'offline' && stat.game_id === this.gameId
          );
          
          if (puzzleStats) {
            this.playerStats = {
              loaded: true,
              gamesPlayed: puzzleStats.games_played,
              gamesWon: puzzleStats.games_won,
              highScore: puzzleStats.high_score
            };
          } else {
            this.playerStats = {
              loaded: true,
              gamesPlayed: 0,
              gamesWon: 0,
              highScore: 0
            };
          }
        } else {
          this.playerStats = {
            loaded: true,
            gamesPlayed: 0,
            gamesWon: 0,
            highScore: 0
          };
        }
      } catch (error) {
        this.playerStats = {
          loaded: true,
          gamesPlayed: 0,
          gamesWon: 0,
          highScore: 0
        };
      }
    },
    
    // Guardar resultado del juego en la base de datos
    async saveGameResult(isVictory) {
      try {
        const token = authService.getToken();
        
        if (!token) {
          return;
        }
        
        // Enviar resultado al servicio
        const result = await gameService.recordGameResult(this.gameId, {
          mode: 'offline',
          result: isVictory ? 'won' : 'lost',
          score: isVictory ? this.totalScore : 0,
          opponent_type: 'ai',
          points_earned: isVictory ? Math.floor(this.totalScore / 10) : 0,
          points_lost: isVictory ? 0 : 2
        });
        
        if (result.success) {
          await this.loadPlayerStats();
          this.displaySnackbar('¡Partida guardada! Has ganado ' + Math.floor(this.totalScore / 10) + ' puntos.', 'success');
        }
      } catch (error) {
        console.error('Error al guardar resultado:', error);
      }
    },
    
    // Mostrar notificación emergente
    displaySnackbar(text, color = 'success') {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.showSnackbar = true;
    },
    
    // Iniciar una nueva partida
    startGame() {
      this.resetDialogOpen = false;
      this.iniciarJuego();
      this.mezclarPuzzle();
      this.startTimer();
    },
    
    // Inicializar el tablero en estado resuelto
    iniciarJuego() {
      // Crear tablero ordenado (1, 2, 3, ..., n-1, 0)
      this.tablero = Array.from({ length: this.tamanoTablero * this.tamanoTablero }, (_, i) => 
        i === this.tamanoTablero * this.tamanoTablero - 1 ? 0 : i + 1
      );
      
      // El espacio vacío está en la última posición
      this.espacioVacio = this.tamanoTablero * this.tamanoTablero - 1;
      this.movimientos = 0;
      this.juegoCompletado = false;
      this.gameOver = false;
      this.score = 0;
      
      // Establecer puntuación base según dificultad
      this.baseScore = this.tamanoTablero === 3 ? 300 : 
                     this.tamanoTablero === 4 ? 500 : 800;
      
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
        this.updateCurrentScore();
      }, 1000);
    },
    
    // Detener el cronómetro
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    
    // Actualizar puntuación actual durante el juego
    updateCurrentScore() {
      if (this.juegoCompletado) return;
      
      // Penalización por tiempo (2 puntos cada 10 segundos)
      const timePenalty = Math.floor(this.gameTime / 10) * 2;
      // Penalización por movimientos (3 puntos por movimiento)
      const movePenalty = this.movimientos * 3;
      
      // La puntuación no puede ser negativa
      this.score = Math.max(0, this.baseScore - timePenalty - movePenalty);
    },
    
    // Calcular puntuación final al completar el puzzle
    calculateFinalScore() {
      // Movimientos mínimos estimados para cada tamaño
      const minMoves = this.tamanoTablero === 3 ? 15 : 
                      this.tamanoTablero === 4 ? 25 : 40;
      
      // Límites de tiempo para bonus
      const timeLimit = this.tamanoTablero === 3 ? 120 : 
                       this.tamanoTablero === 4 ? 300 : 600;
      
      // Bonus por eficiencia (pocos movimientos)
      if (this.movimientos <= minMoves * 1.5) {
        this.efficiencyBonus = Math.floor((minMoves * 1.5 - this.movimientos) * 10);
      } else {
        this.efficiencyBonus = 0;
      }
      
      // Bonus por tiempo
      if (this.gameTime < timeLimit) {
        const timeRatio = 1 - (this.gameTime / timeLimit);
        this.timeBonus = Math.floor(this.baseScore * timeRatio * 0.3);
      } else {
        this.timeBonus = 0;
      }
      
      // Calcular puntuación total
      this.totalScore = this.baseScore + this.efficiencyBonus + this.timeBonus;
      this.score = this.totalScore;
    },
    
    // Mezclar el puzzle realizando movimientos aleatorios válidos
    mezclarPuzzle() {
      // Realizar muchos movimientos aleatorios para mezclar
      for (let i = 0; i < this.tamanoTablero * 50; i++) {
        const movimientosPosibles = this.obtenerMovimientosPosibles();
        if (movimientosPosibles.length > 0) {
          const movimientoAleatorio = movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];
          this.intercambiarPiezas(movimientoAleatorio, this.espacioVacio);
          this.espacioVacio = movimientoAleatorio;
        }
      }
      
      // Reiniciar contador de movimientos después de mezclar
      this.movimientos = 0;
      this.juegoCompletado = false;
      this.gameOver = false;
    },
    
    // Manejar click en una pieza del puzzle
    moverPieza(index) {
      if (this.gameOver || this.juegoCompletado) return;
      
      // Verificar si la pieza se puede mover
      if (this.esPiezaMovible(index)) {
        this.intercambiarPiezas(index, this.espacioVacio);
        this.espacioVacio = index;
        this.movimientos++;
        this.verificarVictoria();
      }
    },
    
    // Verificar si una pieza se puede mover (está cerca del espacio vacío)
    esPiezaMovible(index) {
      const fila = Math.floor(index / this.tamanoTablero);
      const columna = index % this.tamanoTablero;
      const filaVacia = Math.floor(this.espacioVacio / this.tamanoTablero);
      const columnaVacia = this.espacioVacio % this.tamanoTablero;
      
      // La pieza es movible si está en la misma fila o columna
      return (
        (fila === filaVacia && Math.abs(columna - columnaVacia) === 1) ||
        (columna === columnaVacia && Math.abs(fila - filaVacia) === 1)
      );
    },
    
    // Intercambiar dos piezas en el tablero
    intercambiarPiezas(index1, index2) {
      const temp = this.tablero[index1];
      this.tablero[index1] = this.tablero[index2];
      this.tablero[index2] = temp;
    },
    
    // Obtener todos los movimientos posibles desde la posición actual
    obtenerMovimientosPosibles() {
      const movimientos = [];
      const fila = Math.floor(this.espacioVacio / this.tamanoTablero);
      const columna = this.espacioVacio % this.tamanoTablero;
      
      // Verificar movimientos en las 4 direcciones
      if (fila > 0) movimientos.push(this.espacioVacio - this.tamanoTablero); // Arriba
      if (fila < this.tamanoTablero - 1) movimientos.push(this.espacioVacio + this.tamanoTablero); // Abajo
      if (columna > 0) movimientos.push(this.espacioVacio - 1); // Izquierda
      if (columna < this.tamanoTablero - 1) movimientos.push(this.espacioVacio + 1); // Derecha
      
      return movimientos;
    },
    
    // Verificar si el puzzle está resuelto
    verificarVictoria() {
      // Estado correcto: 1, 2, 3, ..., n-1, 0
      const ordenCorrecto = Array.from(
        { length: this.tamanoTablero * this.tamanoTablero },
        (_, i) => (i === this.tamanoTablero * this.tamanoTablero - 1 ? 0 : i + 1)
      );
      
      // Comparar estado actual con estado objetivo
      const esVictoria = this.tablero.every((valor, index) => valor === ordenCorrecto[index]);
      
      if (esVictoria && !this.juegoCompletado) {
        this.juegoCompletado = true;
        this.gameOver = true;
        this.stopTimer();
        this.calculateFinalScore();
        this.saveGameResult(true);
        
        // Mostrar diálogo de victoria con delay
        setTimeout(() => {
          this.gameOverDialog = true;
        }, 500);
      }
    },
    
    // Volver al diálogo de inicio
    resetGameBtn() {
      this.gameOverDialog = false;
      this.resetDialogOpen = true;
    }
  }
}
</script>

<style scoped>
@import '@/components/juegos/css/solitario/puzzle.css';
</style>