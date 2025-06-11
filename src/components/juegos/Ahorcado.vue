<template>
  <div class="ahorcado-wrapper">
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
      <h1 class="game-name">Ahorcado</h1>
      <div></div> <!-- Para centrar el título -->
    </div>

    <!-- Contenedor principal del juego -->
    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-human-handsdown</v-icon>
        <span>Juego del Ahorcado</span>
      </div>

      <!-- Barra de controles del juego -->
      <div class="game-controls">
        <v-btn
          color="game-btn"
          @click="resetDialogOpen = true"
          class="control-btn text-white font-weight-bold"
        >
          NUEVO JUEGO
        </v-btn>
        <div class="category-display">
          <span>Categoría: {{ currentCategory }}</span>
        </div>
        <div class="attempts-display">
          <v-icon color="error" class="mr-1">mdi-heart</v-icon>
          <span>{{ maxErrors - errorCount }}</span>
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

      <!-- Área de juego -->
      <div class="game-play-area" ref="gameArea" tabindex="0" @keydown="handleKeyDown">
        <!-- Dibujo del ahorcado -->
        <div class="hangman-container">
          <svg width="200" height="250" viewBox="0 0 200 250">
            <!-- Base -->
            <line x1="20" y1="230" x2="100" y2="230" stroke="#F3FE63" stroke-width="4" />
            <!-- Poste vertical -->
            <line x1="60" y1="230" x2="60" y2="30" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 0" />
            <!-- Travesaño superior -->
            <line x1="60" y1="30" x2="140" y2="30" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 1" />
            <!-- Soga -->
            <line x1="140" y1="30" x2="140" y2="50" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 2" />
            <!-- Cabeza -->
            <circle cx="140" cy="70" r="20" stroke="#F3FE63" stroke-width="4" fill="transparent" v-if="errorCount > 3" />
            <!-- Cuerpo -->
            <line x1="140" y1="90" x2="140" y2="150" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 4" />
            <!-- Brazo izquierdo -->
            <line x1="140" y1="110" x2="120" y2="130" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 5" />
            <!-- Brazo derecho -->
            <line x1="140" y1="110" x2="160" y2="130" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 6" />
            <!-- Pierna izquierda -->
            <line x1="140" y1="150" x2="120" y2="180" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 7" />
            <!-- Pierna derecha -->
            <line x1="140" y1="150" x2="160" y2="180" stroke="#F3FE63" stroke-width="4" v-if="errorCount > 8" />
          </svg>
        </div>

        <!-- Palabra a adivinar -->
        <div class="word-display-container">
          <div class="word-display">
            <div 
              v-for="(letter, index) in wordDisplay" 
              :key="index"
              class="letter-card"
            >
              {{ letter }}
            </div>
          </div>
        </div>

        <!-- Mensajes para teclado físico -->
        <div class="keyboard-hint" v-if="!isMobile">
          <v-icon color="#F3FE63" class="mr-1">mdi-keyboard</v-icon>
          <span>Puedes usar tu teclado para jugar</span>
        </div>

        <!-- Teclado -->
        <div class="keyboard-container">
          <div class="keyboard">
            <v-btn
              v-for="letter in keyboard"
              :key="letter"
              class="ma-1 letter-btn"
              :disabled="usedLetters.includes(letter)"
              @click="guessLetter(letter)"
              :color="getButtonColor(letter)"
              variant="elevated"
            >
              {{ letter.toUpperCase() }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Diálogo fin de juego -->
      <v-dialog v-model="gameOverDialog" max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            <span v-if="gameStatus === 'won'">¡Felicidades!</span>
            <span v-else>¡Has perdido!</span>
          </v-card-title>
          <v-card-text class="text-center text-white">
            <div v-if="gameStatus === 'won'" class="score-info">
              <p>Has acertado la palabra: <strong>{{ currentWord }}</strong></p>
              <div class="score-details">
                <div class="score-row">
                  <span>Categoría:</span>
                  <span>{{ currentCategory }}</span>
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
                  <span>Bonus por aciertos:</span>
                  <span>{{ correctBonus }}</span>
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
              <p>No has acertado. La palabra era: <strong>{{ currentWord }}</strong></p>
            </div>
          </v-card-text>
          <v-card-actions class="dialog-actions">
            <v-btn color="error" class="text-white font-weight-bold" @click="resetDialogOpen = true">NUEVO JUEGO</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Diálogo selección de categoría -->
      <v-dialog v-model="resetDialogOpen" persistent max-width="350">
        <v-card class="dialog-card">
          <v-card-title class="text-center dialog-title text-white">
            Selecciona categoría
          </v-card-title>
          <v-card-text class="px-4 py-4 text-white">
            <v-radio-group v-model="selectedCategory" class="category-options">
              <v-radio
                v-for="option in categoryOptions"
                :key="option.value"
                :label="option.title"
                :value="option.value"
                color="error"
              ></v-radio>
            </v-radio-group>
            
            <!-- Estadísticas del jugador -->
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
            <v-btn color="error" class="text-white font-weight-bold" @click="startGame">EMPEZAR</v-btn>
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

/**
 * Ahorcado - Juego Clásico del Ahorcado
 * 
 * Implementación completa del juego tradicional con:
 * - 3 categorías de palabras (animales, frutas, países)
 * - Sistema de puntuación progresiva con bonus por tiempo
 * - Cronómetro en tiempo real
 * - Dibujo SVG del ahorcado que se construye por errores
 * - Soporte para teclado físico y virtual
 * - Estadísticas del jugador persistentes
 * - Responsive design para móvil y escritorio
 */

export default {
  name: 'Ahorcado',
  data() {
    return {
      // Categorías y palabras del juego
      categories: {
        animales: ['perro', 'gato', 'elefante', 'jirafa', 'tigre', 'leon', 'ballena', 'delfin', 'koala', 'canguro'],
        frutas: ['manzana', 'platano', 'naranja', 'sandia', 'piña', 'melocoton', 'fresa', 'kiwi', 'mango', 'cereza'],
        paises: ['españa', 'mexico', 'colombia', 'argentina', 'francia', 'italia', 'japon', 'brasil', 'canada', 'australia']
      },
      categoryOptions: [
        { title: 'Animales', value: 'animales' },
        { title: 'Frutas', value: 'frutas' },
        { title: 'Países', value: 'paises' }
      ],
      selectedCategory: 'animales',
      currentCategory: 'Animales',
      currentWord: '',
      wordDisplay: [],
      usedLetters: [],
      correctLetters: [],
      errorCount: 0,
      maxErrors: 9,
      gameStatus: 'playing', // 'playing', 'won', 'lost'
      keyboard: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
      
      // Sistema de puntuación progresiva
      score: 0,
      baseScore: 100,
      correctBonus: 0,
      timeBonus: 0,
      totalScore: 0,
      
      // Variables para cronómetro en tiempo real
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // Control de diálogos
      resetDialogOpen: true,
      gameOverDialog: false,
      
      // ID del juego para estadísticas
      gameId: 3,
      
      // Estadísticas persistentes del jugador
      playerStats: {
        loaded: false,
        gamesPlayed: 0,
        gamesWon: 0,
        highScore: 0
      },
      
      // Detección de dispositivo para responsive
      windowWidth: window.innerWidth
    };
  },
  computed: {
    /**
     * Formatear tiempo del cronómetro a formato mm:ss
     */
    formattedTime() {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    /**
     * Detectar si es dispositivo móvil para ajustar UI
     */
    isMobile() {
      return this.windowWidth < 768;
    }
  },
  created() {
    // Cargar estadísticas del jugador al inicializar
    this.loadPlayerStats();
  },
  mounted() {
    // Configurar foco para eventos de teclado
    this.focusGameArea();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    /**
     * Enfocar área de juego para capturar eventos de teclado físico
     */
    focusGameArea() {
      if (this.$refs.gameArea && !this.isMobile) {
        this.$refs.gameArea.focus();
      }
    },
    
    /**
     * Actualizar tamaño de ventana para diseño responsivo
     */
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    
    /**
     * Manejar entrada de teclado físico - convertir teclas a letras del juego
     */
    handleKeyDown(event) {
      // Solo procesar si el juego está activo
      if (this.gameStatus !== 'playing') return;
      
      // Convertir a minúscula
      const key = event.key.toLowerCase();
      
      // Verificar si es una letra válida y no ha sido usada
      if (this.keyboard.includes(key) && !this.usedLetters.includes(key)) {
        this.guessLetter(key);
      }
    },
    
    /**
     * Cargar estadísticas del jugador desde la base de datos
     * Funciona con o sin sesión activa
     */
    async loadPlayerStats() {
      try {
        // Verificar si hay una sesión activa usando authService
        const token = authService.getToken();
        
        // Si no hay token (no hay sesión), no intentar cargar estadísticas
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
        
        // Obtener estadísticas para este juego
        const result = await gameService.getGameStatistics(this.gameId);
        
        if (result.success) {
          // Encontrar estadísticas del modo offline
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
            // No hay estadísticas todavía
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
        // En caso de error, establecer valores predeterminados sin mostrar error
        this.playerStats = {
          loaded: true,
          gamesPlayed: 0,
          gamesWon: 0,
          highScore: 0
        };
      }
    },
    
    /**
     * Guardar resultado de la partida en la base de datos
     * Solo guarda si hay sesión activa
     */
    async saveGameResult(isVictory) {
      try {
        // Verificar si hay una sesión activa usando authService
        const token = authService.getToken();
        
        // Si no hay token (no hay sesión), simplemente continuar sin guardar
        if (!token) {
          console.log('No hay sesión activa. Los resultados no se guardarán.');
          return;
        }
        
        // Registrar resultado de la partida solo si hay sesión
        const result = await gameService.recordGameResult(this.gameId, {
          mode: 'offline',
          result: isVictory ? 'won' : 'lost',
          score: isVictory ? this.totalScore : 0, // Solo guardar puntuación si ganó
          opponent_type: 'ai',
          points_earned: isVictory ? Math.floor(this.totalScore / 10) : 0, // Puntos de ranking por victoria
          points_lost: isVictory ? 0 : 5 // Perder puntos en derrota
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
    
    /**
     * Iniciar nueva partida con categoría seleccionada
     * Configura puntuación base según dificultad de categoría
     */
    startGame() {
      // Actualizar categoría seleccionada y puntuación base
      switch(this.selectedCategory) {
        case 'animales':
          this.currentCategory = 'Animales';
          this.baseScore = 100; // Puntuación base según categoría
          break;
        case 'frutas':
          this.currentCategory = 'Frutas';
          this.baseScore = 150;
          break;
        case 'paises':
          this.currentCategory = 'Países';
          this.baseScore = 200;
          break;
      }
      
      this.resetDialogOpen = false;
      this.resetGame();
      
      // Comenzar el cronómetro
      this.startTimer();
      
      // Enfocar el área de juego para permitir entrada de teclado
      this.$nextTick(() => {
        this.focusGameArea();
      });
    },
    
    /**
     * Reiniciar todas las variables del juego a estado inicial
     */
    resetGame() {
      // Reiniciar variables de juego
      this.usedLetters = [];
      this.correctLetters = [];
      this.errorCount = 0;
      this.gameStatus = 'playing';
      this.score = 0;
      this.correctBonus = 0;
      this.timeBonus = 0;
      this.totalScore = 0;
      this.gameOverDialog = false;
      
      // Seleccionar nueva palabra aleatoria
      this.selectRandomWord();
      this.updateWordDisplay();
      
      // Reiniciar cronómetro
      this.stopTimer();
      this.gameTime = 0;
      this.startTimer();
    },
    
    /**
     * Seleccionar palabra aleatoria de la categoría actual
     */
    selectRandomWord() {
      const words = this.categories[this.selectedCategory];
      this.currentWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
    },
    
    /**
     * Actualizar visualización de la palabra (mostrar letras adivinadas)
     */
    updateWordDisplay() {
      this.wordDisplay = this.currentWord.split('').map(letter => 
        this.usedLetters.includes(letter) ? letter : '_'
      );
    },
    
    /**
     * Procesar intento de letra - principal lógica del juego
     */
    guessLetter(letter) {
      if (this.gameStatus !== 'playing' || this.usedLetters.includes(letter)) {
        return;
      }
      
      this.usedLetters.push(letter);
      
      if (this.currentWord.includes(letter)) {
        // Acierto
        this.correctLetters.push(letter);
        
        // Actualizar puntuación (10 puntos por cada acierto)
        this.correctBonus += 10;
        this.updateScore();
      } else {
        // Error - incrementar contador y verificar fin de juego
        this.errorCount++;
        
        if (this.errorCount >= this.maxErrors) {
          this.gameOver(false);
        }
      }
      
      this.updateWordDisplay();
      
      // Verificar si ganó (todas las letras adivinadas)
      if (!this.wordDisplay.includes('_')) {
        this.gameOver(true);
      }
    },
    
    /**
     * Determinar color del botón de letra según su estado
     */
    getButtonColor(letter) {
      if (!this.usedLetters.includes(letter)) {
        return 'white'; // Color base para todas las teclas no usadas
      }
      return this.currentWord.includes(letter) ? 'success' : 'error';
    },
    
    /**
     * Actualizar puntuación durante el juego
     */
    updateScore() {
      // Cálculo de puntuación actual = base + bonus por aciertos
      this.score = this.baseScore + this.correctBonus;
    },
    
    /**
     * Calcular puntuación final con bonus por tiempo
     * Diferentes límites de tiempo según dificultad de categoría
     */
    calculateFinalScore() {
      // Calcular bonus por tiempo (más rápido = más puntos)
      let timeLimit;
      switch (this.selectedCategory) {
        case 'animales':
          timeLimit = 60; // 1 minuto
          break;
        case 'frutas':
          timeLimit = 90; // 1.5 minutos
          break;
        case 'paises':
          timeLimit = 120; // 2 minutos
          break;
      }
      
      // Bonus por tiempo si completó dentro del límite
      if (this.gameTime < timeLimit) {
        const timeRatio = 1 - (this.gameTime / timeLimit);
        this.timeBonus = Math.floor(this.baseScore * timeRatio * 0.5); // Hasta 50% extra de la puntuación base
      } else {
        this.timeBonus = 0;
      }
      
      // Puntuación total
      this.totalScore = this.baseScore + this.correctBonus + this.timeBonus;
    },
    
    /**
     * Terminar juego y mostrar resultados
     */
    gameOver(isVictory) {
      this.gameStatus = isVictory ? 'won' : 'lost';
      this.stopTimer();
      
      if (isVictory) {
        this.calculateFinalScore();
      }
      
      // Guardar resultado en base de datos
      this.saveGameResult(isVictory);
      
      // Mostrar diálogo de fin de juego con delay
      setTimeout(() => {
        this.gameOverDialog = true;
      }, 500);
    },
    
    /**
     * Iniciar cronómetro del juego
     */
    startTimer() {
      this.gameStartTime = Date.now();
      this.gameTime = 0;
      
      this.timerInterval = setInterval(() => {
        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
      }, 1000);
    },
    
    /**
     * Detener cronómetro y limpiar intervalo
     */
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  }
};
</script>

<style scoped>
@import '@/components/juegos/css/solitario/ahorcado.css';
</style>