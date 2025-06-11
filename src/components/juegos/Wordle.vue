<template>
  <div class="wordle-wrapper">
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
      <h1 class="game-name">Wordle</h1>
      <div></div> <!-- Para centrar el título -->
    </div>

    <!-- Contenedor principal del juego -->
    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-alphabetical</v-icon>
        <span>Wordle</span>
      </div>

      <!-- Barra de controles del juego -->
      <div class="game-controls">
        <v-btn
          color="game-btn"
          @click="resetGameBtn"
          class="control-btn text-white font-weight-bold"
        >
          NUEVO JUEGO
        </v-btn>
        <div class="attempts-display">
          <v-icon color="error" class="mr-1">mdi-target</v-icon>
          <span>{{ 6 - currentRow }}/6</span>
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

      <!-- Tablero de juego -->
      <div class="game-play-area" tabindex="0" ref="gameArea">
        <!-- Tablero de letras -->
        <div class="board">
          <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="board-cell"
              :class="{
                'correct': cell.status === 'correct',
                'present': cell.status === 'present',
                'absent': cell.status === 'absent',
                'filled': cell.letter !== '',
                'current': currentRow === rowIndex
              }"
            >
              {{ cell.letter }}
            </div>
          </div>
        </div>

        <!-- Teclado virtual -->
        <div class="keyboard">
          <div v-for="(row, rowIndex) in keyboard" :key="rowIndex" class="keyboard-row">
            <v-btn
              v-for="(key, keyIndex) in row"
              :key="keyIndex"
              :class="{
                'correct-key': keyStatus[key] === 'correct',
                'present-key': keyStatus[key] === 'present',
                'absent-key': keyStatus[key] === 'absent',
                'special-key': key === 'ENTER' || key === 'DELETE'
              }"
              :disabled="gameOver"
              class="keyboard-key"
              variant="tonal"
              density="comfortable"
              @click="handleKeyClick(key)"
            >
              {{ key === 'ENTER' ? '↵' : key === 'DELETE' ? '←' : key }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Diálogo de fin de juego -->
      <v-dialog v-model="gameOverDialog" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            <span v-if="gameWon">¡Felicidades!</span>
            <span v-else>¡Juego terminado!</span>
          </v-card-title>
          <v-card-text class="text-center text-white">
            <div v-if="gameWon" class="score-info">
              <p>Has adivinado la palabra: <strong>{{ targetWord }}</strong></p>
              <div class="score-details">
                <div class="score-row">
                  <span>Intentos usados:</span>
                  <span>{{ currentRow + 1 }}/6</span>
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
                  <span>Bonus por intentos:</span>
                  <span>{{ attemptBonus }}</span>
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
            <div v-else>
              <p>No has adivinado la palabra. Era: <strong>{{ targetWord }}</strong></p>
            </div>
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-btn color="error" class="text-white font-weight-bold" @click="resetGameBtn">NUEVO JUEGO</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Diálogo de estadísticas -->
      <v-dialog v-model="statsDialog" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            Estadísticas
          </v-card-title>
          <v-card-text class="px-4 py-4 text-white">
            <!-- Mostrar estadísticas solo si están cargadas -->
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
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" class="text-white font-weight-bold" @click="statsDialog = false">CERRAR</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import { gameService } from '../../services/gameService';
import { authService } from '../../services/auth';

export default {
  name: 'WordleGame',
  data() {
    return {
      // Lista de palabras disponibles para el juego
      wordList: [
        'QUESO', 'CARTA', 'VOLAR', 'PISTA', 'NOCHE',
        'FELIZ', 'RADIO', 'LIBRO', 'PLAYA', 'MOTOR',
        'LLAVE', 'BRISA', 'TRAPO', 'JUGAR', 'HOGAR',
        'NIEVE', 'PERRO', 'SALUD', 'CAMPO', 'TORRE',
        'LUNAR', 'SUEÑO', 'RIEGO', 'MONJE', 'SELVA',
        'LIMON', 'SILLA', 'NARIZ', 'BOLSA', 'ROBLE',
        'TIGRE', 'CLIMA', 'LENTE', 'RAMPA', 'GRIFO',
        'TUMBA', 'RATON', 'AVION', 'JUEGO', 'AMIGO',
        'SANTO', 'BALON', 'VAGAR', 'PEGAR', 'PAPEL',
        'CIELO', 'MUNDO', 'GUSTO', 'CANTO', 'AUDIO',
        'FRUTA', 'RANGO', 'FUERA', 'PESCA', 'DESEO',
        'TECHO', 'BEBER', 'MENTE', 'PRADO', 'ACERO',
        'GOLPE', 'RUMOR', 'GUERO', 'TRONO', 'SABIO',
        'ASUMO', 'AYUNO', 'ACUSO', 'ABUSO', 'GRUMO',
        'ANDAR', 'TIBIO', 'TIBIA', 'BOMBA', 'BOLLO',
        'PLOMO', 'HIELO'
      ],
      
      // Palabra objetivo que el jugador debe adivinar
      targetWord: '',
      
      // Tablero de juego 6x5 (6 filas, 5 columnas)
      board: [],
      
      // Posición actual del cursor
      currentRow: 0,
      currentCol: 0,
      
      // Estado del juego
      gameOver: false,
      gameWon: false,
      gameOverDialog: false,
      statsDialog: false,
      
      // Configuración del teclado virtual
      keyboard: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
      ],
      
      // Estado de cada tecla (correct, present, absent)
      keyStatus: {},
      
      // Variables del sistema de puntuación
      score: 0,
      baseScore: 200,
      attemptBonus: 0,
      timeBonus: 0,
      totalScore: 0,
      
      // Variables del cronómetro
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // Identificador del juego en la base de datos
      gameId: 4,
      
      // Estadísticas del jugador
      playerStats: {
        loaded: false,
        gamesPlayed: 0,
        gamesWon: 0,
        highScore: 0
      }
    };
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
    // Inicializar el juego al crear el componente
    this.initializeGame();
    
    // Cargar estadísticas del jugador
    this.loadPlayerStats();
  },
  mounted() {
    // Agregar listener para el teclado físico
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Enfocar el área de juego para capturar teclas
    this.$refs.gameArea.focus();
  },
  beforeUnmount() {
    // Limpiar listeners y timer para prevenir memory leaks
    document.removeEventListener('keydown', this.handleKeyDown);
    this.stopTimer();
  },
  methods: {
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
    
    // Guardar el resultado del juego en la base de datos
    async saveGameResult(isVictory) {
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
          result: isVictory ? 'won' : 'lost',
          score: isVictory ? this.totalScore : 0,
          opponent_type: 'ai',
          points_earned: isVictory ? Math.floor(this.totalScore / 10) : 0,
          points_lost: isVictory ? 0 : 5
        });
        
        if (result.success) {
          // Recargar estadísticas para mostrar datos actualizados
          await this.loadPlayerStats();
        } else {
          console.error('Error al guardar resultado:', result.message);
        }
      } catch (error) {
        console.error('Error al guardar resultado:', error);
      }
    },
    
    // Inicializar o reiniciar el juego
    initializeGame() {
      // Seleccionar palabra aleatoria de la lista
      this.targetWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
      console.log("Palabra a adivinar (para depuración): ", this.targetWord);
      
      // Crear tablero vacío 6x5
      this.board = Array(6).fill().map(() => 
        Array(5).fill().map(() => ({ letter: '', status: '' }))
      );
      
      // Reiniciar posición y estado del juego
      this.currentRow = 0;
      this.currentCol = 0;
      this.gameOver = false;
      this.gameWon = false;
      this.gameOverDialog = false;
      this.keyStatus = {};
      
      // Reiniciar sistema de puntuación
      this.score = 0;
      this.baseScore = 200;
      this.attemptBonus = 0;
      this.timeBonus = 0;
      this.totalScore = 0;
      
      // Reiniciar cronómetro
      this.stopTimer();
      this.gameTime = 0;
      this.startTimer();
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
      // Puntuación base fija
      let score = this.baseScore;
      
      // Si perdió, no hay puntos
      if (!this.gameWon) {
        this.totalScore = 0;
        return;
      }
      
      // Bonus por intentos no utilizados
      const unusedAttempts = 6 - (this.currentRow + 1);
      this.attemptBonus = unusedAttempts * 50;
      
      // Bonus por tiempo (si resuelve en menos de 3 minutos)
      const timeLimit = 180; // 3 minutos en segundos
      if (this.gameTime < timeLimit) {
        const timeRatio = 1 - (this.gameTime / timeLimit);
        this.timeBonus = Math.floor(this.baseScore * timeRatio * 0.5);
      } else {
        this.timeBonus = 0;
      }
      
      // Calcular puntuación total
      this.totalScore = score + this.attemptBonus + this.timeBonus;
      
      // Actualizar puntuación mostrada
      this.score = this.totalScore;
    },
    
    // Manejar eventos del teclado físico
    handleKeyDown(event) {
      // Ignorar si el juego terminó
      if (this.gameOver) return;
      
      // Prevenir comportamiento por defecto de ciertas teclas
      if (event.key === 'Enter' || event.key === 'Backspace') {
        event.preventDefault();
      }
      
      const key = event.key.toUpperCase();
      
      // Procesar tecla presionada
      if (key === 'ENTER') {
        this.submitGuess();
      } else if (key === 'BACKSPACE') {
        this.deleteLetter();
      } else if (/^[A-ZÑ]$/.test(key)) {
        this.addLetter(key);
      }
    },
    
    // Manejar clicks en el teclado virtual
    handleKeyClick(key) {
      if (key === 'ENTER') {
        this.submitGuess();
      } else if (key === 'DELETE') {
        this.deleteLetter();
      } else {
        this.addLetter(key);
      }
    },
    
    // Agregar una letra al tablero
    addLetter(letter) {
      if (this.currentCol < 5 && this.currentRow < 6 && !this.gameOver) {
        this.board[this.currentRow][this.currentCol].letter = letter;
        this.currentCol++;
      }
    },
    
    // Borrar la última letra ingresada
    deleteLetter() {
      if (this.currentCol > 0 && !this.gameOver) {
        this.currentCol--;
        this.board[this.currentRow][this.currentCol].letter = '';
      }
    },
    
    // Enviar la palabra adivinada para evaluación
    submitGuess() {
      // No procesar si el juego terminó
      if (this.gameOver) return;
      
      // Verificar que la fila esté completa
      if (this.currentCol !== 5) return;
      
      const currentGuess = this.getCurrentGuess();
      
      // Evaluar la respuesta
      this.evaluateGuess(currentGuess);
      
      // Verificar si ganó
      if (currentGuess === this.targetWord) {
        this.gameWon = true;
        this.gameOver = true;
        this.stopTimer();
        this.calculateScore();
        this.saveGameResult(true);
        this.showGameOver();
        return;
      }
      
      // Actualizar puntuación temporal (solo visual)
      this.score = Math.max(0, this.baseScore - (this.currentRow * 20));
      
      // Avanzar a la siguiente fila
      this.currentRow++;
      this.currentCol = 0;
      
      // Verificar si se acabaron los intentos
      if (this.currentRow >= 6) {
        this.gameOver = true;
        this.stopTimer();
        this.saveGameResult(false);
        this.showGameOver();
      }
    },
    
    // Obtener la palabra actual de la fila
    getCurrentGuess() {
      return this.board[this.currentRow].map(cell => cell.letter).join('');
    },
    
    // Evaluar la palabra adivinada contra la palabra objetivo
    evaluateGuess(guess) {
      const targetLetters = this.targetWord.split('');
      const guessLetters = guess.split('');
      
      // Primer paso: marcar letras en posición correcta
      for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          this.board[this.currentRow][i].status = 'correct';
          this.keyStatus[guessLetters[i]] = 'correct';
          targetLetters[i] = null; // Marcar como usada
        }
      }
      
      // Segundo paso: marcar letras presentes en otra posición
      for (let i = 0; i < 5; i++) {
        if (this.board[this.currentRow][i].status === 'correct') {
          continue; // Ya evaluada
        }
        
        const letterIndex = targetLetters.indexOf(guessLetters[i]);
        if (letterIndex >= 0) {
          this.board[this.currentRow][i].status = 'present';
          if (this.keyStatus[guessLetters[i]] !== 'correct') {
            this.keyStatus[guessLetters[i]] = 'present';
          }
          targetLetters[letterIndex] = null; // Marcar como usada
        } else {
          this.board[this.currentRow][i].status = 'absent';
          if (!this.keyStatus[guessLetters[i]]) {
            this.keyStatus[guessLetters[i]] = 'absent';
          }
        }
      }
    },
    
    // Mostrar diálogo de fin de juego con delay
    showGameOver() {
      setTimeout(() => {
        this.gameOverDialog = true;
      }, 800);
    },
    
    // Reiniciar el juego (método para botones)
    resetGameBtn() {
      this.gameOverDialog = false;
      this.initializeGame();
    },
    
    // Mostrar estadísticas del jugador
    showStats() {
      this.statsDialog = true;
    }
  }
};
</script>

<style scoped>
@import '@/components/juegos/css/solitario/Wordle.css';
</style>