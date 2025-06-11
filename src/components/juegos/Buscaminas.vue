<template>
  <div class="buscaminas-wrapper">
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
      <h1 class="game-name">Busca Minas</h1>
      <div></div> <!-- Para centrar el título -->
    </div>

    <!-- Contenedor principal del juego -->
    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-sun</v-icon>
        <span>Buscaminas</span>
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
        <div class="difficulty-display">
          <span>Nivel: {{ difficulty }}</span>
        </div>
        <div class="status-display">
          <v-icon color="error" class="mr-1">mdi-flag</v-icon>
          <span>{{ remainingFlags }}</span>
        </div>
        <div class="timer-display">
          <v-icon color="#F3FE63" class="mr-1">mdi-clock-outline</v-icon>
          <span>{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Tablero principal del juego -->
      <div class="board-container" ref="boardContainer">
        <div class="game-board" :class="gameStatus" :style="boardStyle">
          <div 
            v-for="(row, rowIndex) in board" 
            :key="'row-' + rowIndex" 
            class="board-row"
          >
            <!-- Cada celda del tablero -->
            <div 
              v-for="(cell, colIndex) in row" 
              :key="'cell-' + rowIndex + '-' + colIndex" 
              class="board-cell"
              :class="[
                cell.isRevealed ? 'revealed' : '',
                cell.isFlagged ? 'flagged' : '',
                cell.isMine && cell.isRevealed ? 'mine' : '',
                getCellValueClass(cell)
              ]"
              :style="cellStyle"
              @click="revealCell(rowIndex, colIndex)"
              @contextmenu.prevent="toggleFlag(rowIndex, colIndex)"
            >
              <template v-if="cell.isRevealed">
                <template v-if="cell.isMine">
                  <v-icon :size="iconSize" class="mine-icon">mdi-mine</v-icon>
                </template>
                <template v-else-if="cell.adjacentMines > 0">
                  {{ cell.adjacentMines }}
                </template>
              </template>
              <template v-else-if="cell.isFlagged">
                <v-icon :size="iconSize" color="error">mdi-flag</v-icon>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Diálogo de fin de juego -->
      <v-dialog v-model="gameOverDialog" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            <span v-if="gameWon">¡Victoria!</span>
            <span v-else>¡Game Over!</span>
          </v-card-title>
          <v-card-text class="text-center text-white">
            <div v-if="gameWon" class="score-info">
              <p>Has encontrado todas las minas. ¡Felicidades!</p>
              <div class="score-details">
                <div class="score-row">
                  <span>Dificultad:</span>
                  <span>{{ difficulty }}</span>
                </div>
                <div class="score-row">
                  <span>Tiempo:</span>
                  <span>{{ formattedTime }}</span>
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
            <p v-else>Has detonado una mina. ¡Inténtalo de nuevo!</p>
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-btn color="error" class="text-white font-weight-bold" @click="resetDialogOpen = true">NUEVO JUEGO</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Diálogo de selección de dificultad -->
      <v-dialog v-model="resetDialogOpen" persistent max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            Selecciona dificultad
          </v-card-title>
          <v-card-text class="px-4 py-4 text-white">
            <!-- Opciones de dificultad -->
            <v-radio-group v-model="selectedDifficulty" class="difficulty-options">
              <v-radio
                v-for="option in difficulties"
                :key="option.value"
                :label="option.title"
                :value="option.value"
                color="error"
              ></v-radio>
            </v-radio-group>
            
            <!-- Mostrar estadísticas del jugador si están disponibles -->
            <div v-if="playerStats.loaded" class="player-stats-container">
              <div class="stats-title">Tus estadísticas:</div>
              <div class="stats-row">
                <span>Partidas jugadas:</span>
                <span>{{ playerStats.gamesPlayed }}</span>
              </div>
              <div class="stats-row">
                <span>Victorias:</span>
                <span>{{ playerStats.gamesWon }}</span>
              </div>
              <div class="stats-row">
                <span>Mejor puntuación:</span>
                <span>{{ playerStats.highScore }}</span>
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
import { gameService } from '../../services/gameService';
import { authService } from '../../services/auth';

export default {
  name: 'Buscaminas',
  data() {
    return {
      // Tablero del juego
      board: [], // Matriz bidimensional que representa el campo de minas
      
      // Configuración del tablero
      rows: 10, // Número de filas
      cols: 10, // Número de columnas
      mines: 15, // Número de minas
      
      // Estado del juego
      gameOver: false,
      gameWon: false,
      gameOverDialog: false,
      resetDialogOpen: true, // Mostrar diálogo de configuración al inicio
      
      // Configuración de dificultad
      difficulty: 'Intermedio',
      selectedDifficulty: 'Intermedio', // Para el diálogo de selección
      difficulties: [
        { title: 'Principiante', value: 'Principiante' },
        { title: 'Intermedio', value: 'Intermedio' },
        { title: 'Experto', value: 'Experto' }
      ],
      
      // Contadores del juego
      flagsPlaced: 0, // Número de banderas colocadas
      
      // Variables para responsive design
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      
      // Variables del cronómetro
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // Sistema de puntuación
      baseScore: 0, // Puntuación base según dificultad
      timeBonus: 0, // Bonus por tiempo rápido
      totalScore: 0,
      
      // ID del juego en la base de datos
      gameId: 1,
      
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
    }
  },
  computed: {
    // Clases CSS del tablero según el estado del juego
    gameStatus() {
      return {
        'game-over': this.gameOver,
        'game-won': this.gameWon
      }
    },
    
    // Banderas restantes disponibles
    remainingFlags() {
      return this.mines - this.flagsPlaced;
    },
    
    // Formatear tiempo en formato mm:ss
    formattedTime() {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // Calcular tamaño dinámico de celdas para responsive design
    cellSize() {
      // Tamaño máximo disponible para el tablero
      const maxBoardWidth = this.windowWidth * 0.85; // 85% del ancho
      const maxBoardHeight = this.windowHeight * 0.6; // 60% de la altura
      
      // Calcular tamaño basado en la dimensión más restrictiva
      const maxCellWidthSize = maxBoardWidth / this.cols;
      const maxCellHeightSize = maxBoardHeight / this.rows;
      
      // Usar el valor más pequeño para asegurar que quepa
      let size = Math.min(maxCellWidthSize, maxCellHeightSize, 36); // Máximo 36px
      
      // Asegurar tamaño mínimo para usabilidad
      size = Math.max(size, 22); // Mínimo 22px
      
      return Math.floor(size);
    },
    
    // Estilos dinámicos para las celdas
    cellStyle() {
      return {
        width: `${this.cellSize}px`,
        height: `${this.cellSize}px`,
        fontSize: `${Math.max(this.cellSize * 0.5, 12)}px`, // Texto proporcional
      };
    },
    
    // Tamaño de iconos proporcional
    iconSize() {
      return Math.max(this.cellSize * 0.6, 14);
    },
    
    // Estilos del tablero
    boardStyle() {
      return {
        maxWidth: '100%',
        overflow: 'hidden',
      };
    },
  },
  created() {
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', this.handleResize);
    
    // Cargar estadísticas del jugador
    this.loadPlayerStats();
  },
  beforeUnmount() {
    // Limpiar eventos y cronómetro
    window.removeEventListener('resize', this.handleResize);
    this.stopTimer();
  },
  methods: {
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
            gamesWon: 0,
            highScore: 0
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
              gamesWon: offlineStats.games_won,
              highScore: offlineStats.high_score
            };
          } else {
            // No hay estadísticas previas
            this.playerStats = {
              loaded: true,
              gamesPlayed: 0,
              gamesWon: 0,
              highScore: 0
            };
          }
        } else {
          console.log('Sin estadísticas disponibles:', result.message);
          this.playerStats = {
            loaded: true,
            gamesPlayed: 0,
            gamesWon: 0,
            highScore: 0
          };
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Establecer valores por defecto en caso de error
        this.playerStats = {
          loaded: true,
          gamesPlayed: 0,
          gamesWon: 0,
          highScore: 0
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
      this.difficulty = this.selectedDifficulty;
      this.resetDialogOpen = false;
      this.resetGame();
      
      // Iniciar cronómetro
      this.startTimer();
    },
    
    // Reiniciar el juego con nueva configuración
    resetGame() {
      // Configurar dificultad (tamaño del tablero y número de minas)
      switch (this.difficulty) {
        case 'Principiante':
          this.rows = 8;
          this.cols = 8;
          this.mines = 10;
          this.baseScore = 100;
          break;
        case 'Intermedio':
          this.rows = 16;
          this.cols = 16;
          this.mines = 40;
          this.baseScore = 300;
          break;
        case 'Experto':
          this.rows = 16;
          this.cols = 30;
          this.mines = 99;
          this.baseScore = 500;
          break;
      }

      // Crear e inicializar el tablero
      this.initializeBoard();
      this.placeMines();
      this.calculateAdjacentMines();
      
      // Reiniciar estado del juego
      this.gameOver = false;
      this.gameWon = false;
      this.gameOverDialog = false;
      this.flagsPlaced = 0;
      this.totalScore = 0;
      this.timeBonus = 0;
      
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
    
    // Calcular puntuación final del juego
    calculateScore() {
      // Puntuación base según dificultad
      let score = this.baseScore;
      
      // Solo dar puntos si ganó
      if (!this.gameWon) {
        score = 0;
      } else {
        // Límites de tiempo para bonus según dificultad
        let timeLimit;
        switch (this.difficulty) {
          case 'Principiante':
            timeLimit = 120; // 2 minutos
            break;
          case 'Intermedio':
            timeLimit = 300; // 5 minutos
            break;
          case 'Experto':
            timeLimit = 600; // 10 minutos
            break;
        }
        
        // Calcular bonus por tiempo rápido
        if (this.gameTime < timeLimit) {
          const timeRatio = 1 - (this.gameTime / timeLimit);
          this.timeBonus = Math.floor(this.baseScore * timeRatio);
        } else {
          this.timeBonus = 0;
        }
        
        // Sumar bonus al total
        score += this.timeBonus;
      }
      
      this.totalScore = score;
    },
    
    // Guardar resultado del juego en la base de datos
    async saveGameResult(isVictory) {
      try {
        // Calcular puntuación final
        this.calculateScore();
        
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
          result: isVictory ? 'won' : 'lost',
          score: this.totalScore, // 0 para derrotas, puntuación real para victorias
          opponent_type: 'ai',
          points_earned: isVictory ? Math.floor(this.baseScore / 10) : 0,
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
    
    // Inicializar tablero vacío
    initializeBoard() {
      this.board = [];
      for (let i = 0; i < this.rows; i++) {
        const row = [];
        for (let j = 0; j < this.cols; j++) {
          row.push({
            isMine: false,        // ¿Es una mina?
            isRevealed: false,    // ¿Está revelada?
            isFlagged: false,     // ¿Tiene bandera?
            adjacentMines: 0      // Número de minas adyacentes
          });
        }
        this.board.push(row);
      }
    },
    
    // Colocar minas aleatoriamente en el tablero
    placeMines() {
      let minesPlaced = 0;
      while (minesPlaced < this.mines) {
        const row = Math.floor(Math.random() * this.rows);
        const col = Math.floor(Math.random() * this.cols);
        
        // Solo colocar si no hay mina ya
        if (!this.board[row][col].isMine) {
          this.board[row][col].isMine = true;
          minesPlaced++;
        }
      }
    },
    
    // Calcular el número de minas adyacentes para cada celda
    calculateAdjacentMines() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (!this.board[row][col].isMine) {
            this.board[row][col].adjacentMines = this.countAdjacentMines(row, col);
          }
        }
      }
    },
    
    // Contar minas en las 8 celdas adyacentes
    countAdjacentMines(row, col) {
      let count = 0;
      
      // Verificar las 8 celdas adyacentes
      for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, this.rows - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, this.cols - 1); j++) {
          if (i === row && j === col) continue; // Saltar la celda central
          if (this.board[i][j].isMine) count++;
        }
      }
      
      return count;
    },
    
    // Revelar una celda al hacer click
    revealCell(row, col) {
      const cell = this.board[row][col];
      
      // No hacer nada si el juego terminó, está marcada o ya revelada
      if (this.gameOver || cell.isFlagged || cell.isRevealed) {
        return;
      }
      
      // Revelar la celda
      cell.isRevealed = true;
      
      // Si es una mina, fin del juego
      if (cell.isMine) {
        this.gameOver = true;
        this.stopTimer();
        this.revealAllMines();
        
        // Guardar derrota
        this.saveGameResult(false);
        
        // Mostrar diálogo con delay
        setTimeout(() => {
          this.gameOverDialog = true;
        }, 500);
        return;
      }
      
      // Si es celda vacía, revelar celdas adyacentes automáticamente
      if (cell.adjacentMines === 0) {
        this.revealAdjacentCells(row, col);
      }
      
      // Verificar condición de victoria
      this.checkWinCondition();
    },
    
    // Revelar celdas adyacentes recursivamente (para celdas vacías)
    revealAdjacentCells(row, col) {
      for (let i = Math.max(0, row - 1); i <= Math.min(row + 1, this.rows - 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(col + 1, this.cols - 1); j++) {
          if (i === row && j === col) continue;
          
          const adjacentCell = this.board[i][j];
          if (!adjacentCell.isRevealed && !adjacentCell.isFlagged) {
            adjacentCell.isRevealed = true;
            
            // Recursión para celdas vacías
            if (adjacentCell.adjacentMines === 0) {
              this.revealAdjacentCells(i, j);
            }
          }
        }
      }
    },
    
    // Alternar bandera en una celda (click derecho)
    toggleFlag(row, col) {
      const cell = this.board[row][col];
      
      // No hacer nada si el juego terminó o está revelada
      if (this.gameOver || cell.isRevealed) {
        return;
      }
      
      // Alternar bandera
      if (cell.isFlagged) {
        cell.isFlagged = false;
        this.flagsPlaced--;
      } else {
        // No permitir más banderas que minas
        if (this.flagsPlaced < this.mines) {
          cell.isFlagged = true;
          this.flagsPlaced++;
          
          // Verificar victoria después de colocar bandera
          this.checkWinCondition();
        }
      }
    },
    
    // Revelar todas las minas (al perder)
    revealAllMines() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (this.board[row][col].isMine) {
            this.board[row][col].isRevealed = true;
          }
        }
      }
    },
    
    // Verificar si el jugador ha ganado
    checkWinCondition() {
      // Verificar si todas las celdas seguras están reveladas
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const cell = this.board[row][col];
          if (!cell.isMine && !cell.isRevealed) {
            return; // Todavía hay celdas sin revelar
          }
        }
      }
      
      // Verificar si todas las minas están correctamente marcadas
      let correctFlags = 0;
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const cell = this.board[row][col];
          if (cell.isMine && cell.isFlagged) {
            correctFlags++;
          }
        }
      }
      
      // Victoria si todas las celdas seguras están reveladas
      if ((correctFlags === this.mines && this.flagsPlaced === this.mines) || this.allSafeCellsRevealed()) {
        this.gameWon = true;
        this.gameOver = true;
        this.stopTimer();
        
        // Guardar victoria
        this.saveGameResult(true);
        
        // Mostrar diálogo con delay
        setTimeout(() => {
          this.gameOverDialog = true;
        }, 500);
      }
    },
    
    // Verificar si todas las celdas seguras están reveladas
    allSafeCellsRevealed() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          const cell = this.board[row][col];
          if (!cell.isMine && !cell.isRevealed) {
            return false;
          }
        }
      }
      return true;
    },
    
    // Obtener clase CSS para el valor numérico de la celda
    getCellValueClass(cell) {
      if (cell.isRevealed && !cell.isMine && cell.adjacentMines > 0) {
        return `value-${cell.adjacentMines}`;
      }
      return '';
    }
  }
}
</script>

<style scoped>
@import '@/components/juegos/css/solitario/buscaminas.css';
</style>