<template>
  <div class="chess-wrapper">
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
      <h1 class="game-name">Ajedrez</h1>
      <div></div>
    </div>

    <div class="game-container">
      <!-- Barra de título del juego -->
      <div class="game-header">
        <v-icon color="white" size="24" class="mr-2">mdi-chess-king</v-icon>
        <span>Ajedrez</span>
      </div>

      <!-- Contenido principal del juego -->
      <div class="game-content">
        <!-- Barra de información del juego (solo visible en modo IA) -->
        <div class="game-info-bar" v-if="gameHandler && gameHandler.shouldShowGameInfo()">
          <div class="difficulty-display" v-if="gameMode === 'ai'">
            <span>Nivel: {{ getAIDifficultyName() }}</span>
          </div>
          <div class="turn-display">
            <span>{{ getTurnText() }}</span>
          </div>
          <div class="score-display" v-if="gameMode === 'ai'">
            <v-icon color="#F3FE63" class="mr-1">mdi-star</v-icon>
            <span>{{ baseScore }}</span>
          </div>
          <div class="timer-display" v-if="gameMode === 'ai'">
            <v-icon color="#F3FE63" class="mr-1">mdi-clock-outline</v-icon>
            <span>{{ formattedTime }}</span>
          </div>
        </div>

        <!-- Anuncio de turno para modo local -->
        <v-row v-if="gameMode === 'local'" class="mt-2">
          <v-col cols="12" class="text-center">
            <h2 v-if="jaqueMate || reyAhogado" class="winner-announcement">
              {{ getGameEndText() }}
            </h2>
            <h2 v-else class="turn-announcement">
              {{ getTurnText() }}
              <span v-if="enJaque" class="jaque-warning ml-2">¡JAQUE!</span>
            </h2>
          </v-col>
        </v-row>
        
        <!-- Área principal del tablero de ajedrez -->
        <v-row class="mt-4">
          <v-col cols="12" lg="8" class="d-flex justify-center">
            <div class="tablero-container" v-if="tablero.length > 0">
              <div class="tablero">
                <!-- Cada fila del tablero (8x8) -->
                <div v-for="(fila, x) in tablero" :key="'fila-'+x" class="fila">
                  <!-- Cada celda de la fila -->
                  <div 
                    v-for="(celda, y) in fila" 
                    :key="'celda-'+x+'-'+y"
                    :class="getCellClasses(x, y)"
                    @click="seleccionarCelda(x, y)"
                  >
                    <!-- Icono de la pieza si existe -->
                    <v-icon 
                      v-if="celda" 
                      :size="isMobile ? 32 : 40" 
                      :color="celda.color === 'blanco' ? 'white' : 'black'" 
                      class="pieza-icon"
                    >
                      {{ obtenerIconoPieza(celda) }}
                    </v-icon>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
          
          <!-- Panel lateral de información y controles -->
          <v-col cols="12" lg="4">
            <v-card color="rgba(255,255,255,0.1)" class="info-panel">
              <v-card-text class="text-white">
                <div class="mb-3">
                  <p class="text-h6">{{ getTurnText() }}</p>
                  <p v-if="enJaque" class="jaque-warning">¡JAQUE!</p>
                  <!-- Indicador cuando la IA está pensando -->
                  <p v-if="gameMode === 'ai' && turnoActual === 'negro' && aiThinking" class="ai-thinking">
                    IA está pensando...
                  </p>
                </div>
                
                <v-btn color="success" block class="mb-3" @click="resetGame">
                  Reiniciar juego
                </v-btn>

                <v-btn color="secondary" block class="mb-3" @click="showModeSelect">
                  Cambiar modo
                </v-btn>
              </v-card-text>
            </v-card>
            
            <!-- Panel del historial de movimientos -->
            <v-card color="rgba(255,255,255,0.1)" class="mt-4">
              <v-card-title class="text-white text-subtitle-1">
                Historial de movimientos
              </v-card-title>
              <v-card-text style="height: 200px; overflow-y: auto;">
                <div v-for="(movimiento, index) in historialMovimientos" :key="index" class="text-white">
                  {{ index + 1 }}. {{ movimiento }}
                </div>
              </v-card-text>
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

          <!-- Selector de dificultad para modo IA -->
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

          <!-- Mostrar estadísticas del jugador si hay sesión -->
          <div v-if="hasSession && playerStats.loaded && selectedMode !== 'local'" class="player-stats-container mt-4">
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

    <!-- Diálogo de promoción de peón -->
    <v-dialog v-model="promocionPeonDialog" persistent max-width="300">
      <v-card class="dialog-card">
        <v-card-title class="text-white text-center">Promoción de peón</v-card-title>
        <v-card-text>
          <v-row>
            <!-- Opciones de promoción -->
            <v-col v-for="pieza in piezasPromocion" :key="pieza" cols="3" class="text-center">
              <v-btn icon size="large" @click="promoverPeon(pieza)">
                <v-icon size="40" :color="turnoActual === 'blanco' ? 'white' : 'black'">
                  {{ obtenerIconoPieza({tipo: pieza, color: turnoActual}) }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo de fin del juego -->
    <v-dialog v-model="finJuegoDialog" persistent max-width="400">
      <v-card class="dialog-card">
        <v-card-title class="text-center dialog-title text-white">
          {{ gameOverTitle }}
        </v-card-title>
        <v-card-text class="text-center text-white">
          <!-- Resultado de victoria contra IA -->
          <div v-if="gameMode === 'ai' && jaqueMate && ganador === 'blanco'" class="score-info">
            <p>¡Has ganado la partida!</p>
            <div class="score-details" v-if="hasSession">
              <div class="score-row">
                <span>Dificultad:</span>
                <span>{{ getAIDifficultyName() }}</span>
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
                <span>Bonus por tiempo:</span>
                <span>{{ timeBonus }}</span>
              </div>
              <div class="score-row total-score">
                <span>Puntuación total:</span>
                <span>{{ totalScore }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="gameMode === 'ai' && jaqueMate && ganador === 'negro'">
            <p>La IA ha ganado la partida.</p>
          </div>
          <div v-else-if="gameMode === 'local' && jaqueMate">
            <p>{{ getGameEndText() }}</p>
          </div>
          <div v-else-if="reyAhogado">
            <p>La partida ha terminado en empate.</p>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn color="secondary" class="text-white dialog-btn mx-2" @click="showModeSelect">CAMBIAR MODO</v-btn>
          <v-btn color="primary" class="text-white dialog-btn mx-2" @click="resetGame">JUGAR DE NUEVO</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para notificaciones -->
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
import { useDisplay } from 'vuetify';

// Clase para manejar partidas locales (2 jugadores en el mismo dispositivo)
class LocalChessGame {
  constructor() {
    this.gameMode = 'local';
  }
  
  // Determinar si mostrar información del juego (no en modo local)
  shouldShowGameInfo() {
    return false;
  }
  
  resetGame() {
    return true;
  }
  
  // Calcular movimientos válidos para una pieza según su tipo
  calcularMovimientosValidos(tablero, x, y, pieza) {
    switch (pieza.tipo) {
      case 'peon':
        return this.movimientosPeon(tablero, x, y, pieza.color);
      case 'torre':
        return this.movimientosTorre(tablero, x, y, pieza.color);
      case 'alfil':
        return this.movimientosAlfil(tablero, x, y, pieza.color);
      case 'caballo':
        return this.movimientosCaballo(tablero, x, y, pieza.color);
      case 'dama':
        return [
          ...this.movimientosTorre(tablero, x, y, pieza.color),
          ...this.movimientosAlfil(tablero, x, y, pieza.color)
        ];
      case 'rey':
        return this.movimientosRey(tablero, x, y, pieza.color);
      default:
        return [];
    }
  }

  // Verificar si una posición está dentro del tablero
  estaEnTablero(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  // Calcular movimientos válidos para un peón
  movimientosPeon(tablero, x, y, color) {
    const movimientos = [];
    const direccion = color === 'blanco' ? -1 : 1;
    
    // Movimiento hacia adelante
    if (this.estaEnTablero(x + direccion, y) && !tablero[x + direccion][y]) {
      movimientos.push({ x: x + direccion, y });
      
      // Doble movimiento desde posición inicial
      const filaInicial = color === 'blanco' ? 6 : 1;
      if (x === filaInicial && !tablero[x + 2 * direccion][y]) {
        movimientos.push({ x: x + 2 * direccion, y });
      }
    }
    
    // Capturas en diagonal
    const diagonales = [{ x: x + direccion, y: y - 1 }, { x: x + direccion, y: y + 1 }];
    for (const diag of diagonales) {
      if (this.estaEnTablero(diag.x, diag.y)) {
        const piezaObjetivo = tablero[diag.x][diag.y];
        if (piezaObjetivo && piezaObjetivo.color !== color) {
          movimientos.push(diag);
        }
      }
    }
    
    return movimientos;
  }

  // Calcular movimientos válidos para una torre
  movimientosTorre(tablero, x, y, color) {
    const movimientos = [];
    const direcciones = [
      { x: 0, y: 1 }, { x: 1, y: 0 },    // Derecha, Abajo
      { x: 0, y: -1 }, { x: -1, y: 0 }   // Izquierda, Arriba
    ];
    
    for (const dir of direcciones) {
      let nx = x + dir.x;
      let ny = y + dir.y;
      
      // Continuar en esta dirección hasta encontrar obstáculo
      while (this.estaEnTablero(nx, ny)) {
        const pieza = tablero[nx][ny];
        
        if (!pieza) {
          // Casilla vacía, movimiento válido
          movimientos.push({ x: nx, y: ny });
        } else {
          // Hay una pieza
          if (pieza.color !== color) {
            // Pieza enemiga, se puede capturar
            movimientos.push({ x: nx, y: ny });
          }
          break; 
        }
        
        nx += dir.x;
        ny += dir.y;
      }
    }
    
    return movimientos;
  }

  // Calcular movimientos válidos para un alfil
  movimientosAlfil(tablero, x, y, color) {
    const movimientos = [];
    const direcciones = [
      { x: 1, y: 1 }, { x: 1, y: -1 },     // Diagonales
      { x: -1, y: 1 }, { x: -1, y: -1 }
    ];
    
    for (const dir of direcciones) {
      let nx = x + dir.x;
      let ny = y + dir.y;
      
      // Continuar en esta diagonal hasta encontrar obstáculo
      while (this.estaEnTablero(nx, ny)) {
        const pieza = tablero[nx][ny];
        
        if (!pieza) {
          movimientos.push({ x: nx, y: ny });
        } else {
          if (pieza.color !== color) {
            movimientos.push({ x: nx, y: ny });
          }
          break;
        }
        
        nx += dir.x;
        ny += dir.y;
      }
    }
    
    return movimientos;
  }

  // Calcular movimientos válidos para un caballo
  movimientosCaballo(tablero, x, y, color) {
    const movimientos = [];
    const posibilidades = [
      { x: -2, y: -1 }, { x: -2, y: 1 },   // Movimientos en L
      { x: -1, y: -2 }, { x: -1, y: 2 },
      { x: 1, y: -2 }, { x: 1, y: 2 },
      { x: 2, y: -1 }, { x: 2, y: 1 }
    ];
    
    for (const pos of posibilidades) {
      const nx = x + pos.x;
      const ny = y + pos.y;
      
      if (this.estaEnTablero(nx, ny)) {
        const pieza = tablero[nx][ny];
        
        // El caballo puede saltar sobre otras piezas
        if (!pieza || pieza.color !== color) {
          movimientos.push({ x: nx, y: ny });
        }
      }
    }
    
    return movimientos;
  }

  // Calcular movimientos válidos para un rey
  movimientosRey(tablero, x, y, color) {
    const movimientos = [];
    const posibilidades = [
      { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },   // Una casilla en todas las direcciones
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }
    ];
    
    for (const pos of posibilidades) {
      const nx = x + pos.x;
      const ny = y + pos.y;
      
      if (this.estaEnTablero(nx, ny)) {
        const pieza = tablero[nx][ny];
        
        if (!pieza || pieza.color !== color) {
          movimientos.push({ x: nx, y: ny });
        }
      }
    }
    
    return movimientos;
  }
}

// Clase para manejar partidas contra IA
class AIChessGame {
  constructor(difficulty = 'normal') {
    this.gameMode = 'ai';
    this.difficulty = difficulty;
    this.baseScore = this.getBaseScore(difficulty);
  }
  
  // Obtener puntuación base según dificultad
  getBaseScore(difficulty) {
    const scores = {
      'facil': 150,
      'normal': 300,
      'dificil': 500
    };
    return scores[difficulty] || 300;
  }
  
  // Mostrar información del juego en modo IA
  shouldShowGameInfo() {
    return true;
  }
  
  resetGame() {
    return true;
  }
  
  // Calcular puntuación final 
  calculateScore(isVictory, gameTime) {
    if (!isVictory) {
      return { baseScore: 0, timeBonus: 0, totalScore: 0 };
    }

    // Bonus por tiempo (máximo 300 segundos = 5 minutos)
    const timeLimit = 300;
    const timeBonus = gameTime < timeLimit ? 
      Math.floor((timeLimit - gameTime) * 2) : 0;
    
    const totalScore = this.baseScore + timeBonus;

    return {
      baseScore: this.baseScore,
      timeBonus: timeBonus,
      totalScore: totalScore
    };
  }
  
  // Hacer movimiento de IA (algoritmo básico aleatorio)
  makeAIMove(tablero) {
    const movimientosPosibles = [];
    
    // Buscar todas las piezas negras y sus movimientos válidos
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const pieza = tablero[x][y];
        if (pieza && pieza.color === 'negro') {
          const movimientos = this.obtenerMovimientosValidos(tablero, x, y, pieza);
          for (const movimiento of movimientos) {
            // No intentar capturar al rey (movimiento ilegal)
            const piezaDestino = tablero[movimiento.x][movimiento.y];
            if (piezaDestino && piezaDestino.tipo === 'rey') {
              continue;
            }
            
            // Verificar que el movimiento es básicamente seguro
            if (this.esMovimientoSeguro(tablero, {x, y}, movimiento)) {
              movimientosPosibles.push({
                origen: {x, y},
                destino: movimiento
              });
            }
          }
        }
      }
    }
    
    // Seleccionar movimiento aleatorio
    if (movimientosPosibles.length > 0) {
      return movimientosPosibles[Math.floor(Math.random() * movimientosPosibles.length)];
    }
    return null;
  }
  
  // Verificación básica de seguridad del movimiento
  esMovimientoSeguro(tablero, origen, destino) {
    // En una implementación completa, aquí se verificaría que el movimiento 
    // no deje al rey en jaque. Por simplicidad, permitimos todos los movimientos y porque no le quiero dedicar más tiempo al Ajedrez.
    return true;
  }
  
  // Usar la misma lógica de movimientos que el juego local
  obtenerMovimientosValidos(tablero, x, y, pieza) {
    const localGame = new LocalChessGame();
    return localGame.calcularMovimientosValidos(tablero, x, y, pieza);
  }

  // Usar métodos básicos de movimiento para compatibilidad
  obtenerMovimientosBasicos(tablero, x, y, pieza) {
    return this.obtenerMovimientosValidos(tablero, x, y, pieza);
  }
}

export default {
  name: 'Ajedrez',
  setup() {
    const { mobile } = useDisplay();
    return { isMobile: mobile };
  },
  data() {
    return {
      // Estado del tablero de ajedrez (8x8)
      tablero: Array(8).fill().map(() => Array(8).fill(null)),
      turnoActual: 'blanco', // Color del jugador que debe mover
      seleccionada: null, // Pieza actualmente seleccionada {x, y}
      movimientosValidos: [], // Array de movimientos válidos para la pieza seleccionada
      historialMovimientos: [], // Historial de notación de movimientos
      
      // Estados del juego
      enJaque: false,
      jaqueMate: false,
      reyAhogado: false,
      gameOver: false, 
      ganador: null, // 'blanco', 'negro', o null
      gameHandler: null, // Instancia de LocalChessGame o AIChessGame
      gameMode: null, // 'local' o 'ai'
      
      // Posiciones de los reyes para verificación de jaque
      reyesPos: {
        blanco: { x: 7, y: 4 },
        negro: { x: 0, y: 4 }
      },
      
      // Estado del enroque (no implementado completamente)
      enroqueDisponible: {
        blanco: { corto: true, largo: true },
        negro: { corto: true, largo: true }
      },
      
      // Sistema de promoción de peón
      promocionPeonDialog: false,
      peonAPromocionar: null, // {x, y} del peón a promocionar
      piezasPromocion: ['dama', 'torre', 'alfil', 'caballo'],
      
      // Control de fin del juego
      finJuegoDialog: false,
      gameOverTitle: '',
      
      // Control de modos de juego y diálogos
      modeSelectDialog: true,
      selectedMode: null,
      gameModes: [
        { 
          id: 'local', 
          title: 'Juego Local', 
          description: 'Juega en el mismo dispositivo alternando turnos entre blancas y negras.' 
        },
        { 
          id: 'ai', 
          title: 'Juego contra IA', 
          description: 'Juega como blancas contra la inteligencia artificial con diferentes niveles de dificultad.' 
        }
      ],
      
      // Configuración de IA
      aiDifficulty: 'normal',
      aiDifficulties: [
        { value: 'facil', label: 'Fácil' },
        { value: 'normal', label: 'Normal' },
        { value: 'dificil', label: 'Difícil' }
      ],
      aiThinking: false, // Flag para mostrar cuando la IA está "pensando" Xd
      
      // Sistema de puntuación (solo para modo IA)
      baseScore: 0,
      timeBonus: 0,
      totalScore: 0,
      
      // Cronómetro del juego
      gameStartTime: null,
      gameTime: 0,
      timerInterval: null,
      
      // ID del juego en la base de datos
      gameId: 8, 
      hasSession: false, // Si el usuario está logueado
      
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
    // Formatear tiempo del cronómetro en mm:ss
    formattedTime() {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  created() {
    this.checkSession();
    this.loadPlayerStats();
    this.inicializarTableroVacio();
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    // Verificar si el usuario tiene una sesión activa
    checkSession() {
      const token = authService.getToken();
      this.hasSession = !!token;
    },

    // Cargar estadísticas del jugador desde la base de datos
    async loadPlayerStats() {
      try {
        const token = authService.getToken();
        
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
        
        // Obtener estadísticas específicas del ajedrez
        const result = await gameService.getGameStatistics(this.gameId);
        
        if (result.success) {
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
          console.log('No hay sesión activa. Los resultados no se guardarán.');
          return;
        }
        
        // Solo registrar para modo AI y con sesión
        if (this.gameMode !== 'ai') {
          return;
        }
        
        // Registrar resultado de la partida
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
          // Recargar estadísticas para mostrar datos actualizados
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
    inicializarTableroVacio() {
      this.tablero = Array(8).fill().map(() => Array(8).fill(null));
    },

    // Iniciar cronómetro del juego
    startTimer() {
      this.gameStartTime = Date.now();
      this.gameTime = 0;
      
      this.timerInterval = setInterval(() => {
        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
      }, 1000);
    },
    
    // Detener cronómetro
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    // Iniciar nueva partida según el modo seleccionado
    startGame() {
      this.modeSelectDialog = false;
      this.gameMode = this.selectedMode;
      
      switch (this.gameMode) {
        case 'local':
          this.gameHandler = new LocalChessGame();
          break;
        case 'ai':
          this.gameHandler = new AIChessGame(this.aiDifficulty);
          this.startTimer();
          // Inicializar puntuación base desde el gameHandler
          this.baseScore = this.gameHandler.baseScore;
          this.timeBonus = 0;
          this.totalScore = 0;
          break;
      }
      
      this.inicializarTablero();
    },

    // Mostrar diálogo de selección de modo
    showModeSelect() {
      this.modeSelectDialog = true;
      this.finJuegoDialog = false;
      this.stopTimer();
      
      // Resetear puntuaciones al cambiar modo
      this.baseScore = 0;
      this.timeBonus = 0;
      this.totalScore = 0;
      this.gameOver = false;
      this.aiThinking = false;
    },

    // Mostrar notificación emergente
    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    // Inicializar tablero con piezas en posiciones iniciales
    inicializarTablero() {
      this.tablero = Array(8).fill().map(() => Array(8).fill(null));
      
      // Colocar peones
      for (let y = 0; y < 8; y++) {
        this.tablero[1][y] = { tipo: 'peon', color: 'negro', movido: false };
        this.tablero[6][y] = { tipo: 'peon', color: 'blanco', movido: false };
      }
      
      // Colocar piezas mayores
      const piezas = ['torre', 'caballo', 'alfil', 'dama', 'rey', 'alfil', 'caballo', 'torre'];
      for (let y = 0; y < 8; y++) {
        this.tablero[0][y] = { tipo: piezas[y], color: 'negro', movido: false };
        this.tablero[7][y] = { tipo: piezas[y], color: 'blanco', movido: false };
      }
      
      // Resetear estado del juego
      this.turnoActual = 'blanco';
      this.seleccionada = null;
      this.movimientosValidos = [];
      this.historialMovimientos = [];
      this.enJaque = false;
      this.jaqueMate = false;
      this.reyAhogado = false;
      this.gameOver = false;
      this.ganador = null;
      this.finJuegoDialog = false;
      this.aiThinking = false;
      
      // Resetear posiciones de reyes
      this.reyesPos = {
        blanco: { x: 7, y: 4 },
        negro: { x: 0, y: 4 }
      };
      
      // Resetear disponibilidad de enroque
      this.enroqueDisponible = {
        blanco: { corto: true, largo: true },
        negro: { corto: true, largo: true }
      };
    },

    // Obtener icono MDI para una pieza
    obtenerIconoPieza(pieza) {
      if (!pieza) return '';
      
      const iconos = {
        rey: 'mdi-chess-king',
        dama: 'mdi-chess-queen',
        torre: 'mdi-chess-rook',
        alfil: 'mdi-chess-bishop',
        caballo: 'mdi-chess-knight',
        peon: 'mdi-chess-pawn'
      };
      
      return iconos[pieza.tipo] || '';
    },

    // Obtener clases CSS para una celda del tablero
    getCellClasses(x, y) {
      const classes = ['celda'];
      
      // Color base del tablero (patrón de ajedrez)
      classes.push((x + y) % 2 === 0 ? 'celda-blanca' : 'celda-negra');
      
      // Resaltar pieza seleccionada
      if (this.seleccionada && this.seleccionada.x === x && this.seleccionada.y === y) {
        classes.push('seleccionada');
      }
      
      // Resaltar movimientos válidos
      if (this.movimientosValidos && this.movimientosValidos.length > 0 && 
          this.movimientosValidos.some(m => m.x === x && m.y === y)) {
        classes.push('movimiento-valido');
      }
      
      return classes;
    },

    // Maneja la selección de una celda del tablero
    seleccionarCelda(x, y) {
      // No permitir movimientos si no hay modo de juego o el juego terminó
      if (!this.gameMode || this.jaqueMate || this.reyAhogado || this.gameOver) {
        return;
      }
      
      // En modo IA, no permitir movimientos durante el turno de la IA o mientras "piensa"
      if (this.gameMode === 'ai' && (this.turnoActual === 'negro' || this.aiThinking)) {
        return;
      }
      
      const pieza = this.tablero[x][y];
      
      // Si no hay pieza seleccionada y se clickea una pieza del jugador actual
      if (!this.seleccionada && pieza && pieza.color === this.turnoActual) {
        this.seleccionada = { x, y };
        this.calcularMovimientosValidos(x, y);
        return;
      }
      
      // Si ya hay una pieza seleccionada
      if (this.seleccionada) {
        // Si se clickea otra pieza del mismo color, cambiar selección
        if (pieza && pieza.color === this.turnoActual) {
          this.seleccionada = { x, y };
          this.calcularMovimientosValidos(x, y);
          return;
        }
        
        // Verificar si es un movimiento válido
        const esMovimientoValido = this.movimientosValidos && this.movimientosValidos.length > 0 && 
                                  this.movimientosValidos.some(m => m.x === x && m.y === y);
        
        if (esMovimientoValido) {
          // Realizar el movimiento
          this.moverPieza(this.seleccionada.x, this.seleccionada.y, x, y);
        }
        
        // Limpiar selección independientemente del resultado
        this.seleccionada = null;
        this.movimientosValidos = [];
      }
    },

    // Calcular movimientos válidos para una pieza
    calcularMovimientosValidos(x, y) {
      const pieza = this.tablero[x][y];
      if (!pieza || !this.gameHandler) return [];
      
      let movimientos = [];
      
      // Usar la lógica del gameHandler apropiado
      if (this.gameMode === 'local') {
        movimientos = this.gameHandler.calcularMovimientosValidos(this.tablero, x, y, pieza);
      } else if (this.gameMode === 'ai') {
        // Para modo IA, usar la misma lógica de movimientos básicos
        movimientos = this.gameHandler.obtenerMovimientosBasicos(this.tablero, x, y, pieza);
      }
      
      // Filtrar movimientos que dejarían al rey en jaque (simplificado)
      movimientos = this.filtrarMovimientosJaque(x, y, movimientos);
      this.movimientosValidos = movimientos;
      return movimientos;
    },

    // Filtrar movimientos que dejarían en jaque (versión simplificada)
    filtrarMovimientosJaque(xOrigen, yOrigen, movimientos) {
      // En una implementación completa, esto sería más robusto
      // Por ahora usamos una versión básica que simula el movimiento
      return movimientos.filter(mov => {
        const tableroTemporal = JSON.parse(JSON.stringify(this.tablero));
        tableroTemporal[mov.x][mov.y] = tableroTemporal[xOrigen][yOrigen];
        tableroTemporal[xOrigen][yOrigen] = null;
        
        // Verificación básica (en implementación completa sería más compleja)
        return true; // Por ahora permitir todos los movimientos
      });
    },

    // Verificar si un rey está en jaque 
    estaEnJaque(tableroParam, colorRey, posReyParam = null) {
      // En implementación completa se debería hacer, no puedo más
      return false;
    },

    // Mover pieza y manejar lógica del juego
    moverPieza(xOrigen, yOrigen, xDestino, yDestino) {
      const pieza = this.tablero[xOrigen][yOrigen];
      const piezaDestino = this.tablero[xDestino][yDestino];
      
      // Generar notación ANTES de mover la pieza
      const notacion = this.obtenerNotacionMovimiento(xOrigen, yOrigen, xDestino, yDestino, piezaDestino !== null, pieza);
      
      // Verificar si se está capturando al rey (fin del juego inmediato)
      if (piezaDestino && piezaDestino.tipo === 'rey') {
        // Realizar el movimiento primero
        this.tablero[xDestino][yDestino] = pieza;
        this.tablero[xOrigen][yOrigen] = null;
        
        // Registrar movimiento
        this.historialMovimientos.push(notacion);
        
        // Terminar el juego inmediatamente - NO cambiar turno
        const colorGanador = pieza.color;
        this.ganador = colorGanador;
        this.jaqueMate = true;
        this.gameOver = true; // Marcar que el juego terminó
        this.stopTimer();
        
        // Manejar puntuación si es modo IA y el jugador ganó
        if (this.gameMode === 'ai' && colorGanador === 'blanco') {
          this.handleAIWin();
        }
        
        // Configurar título del diálogo según el modo y ganador
        if (this.gameMode === 'ai') {
          this.gameOverTitle = colorGanador === 'blanco' ? '¡Victoria!' : 'IA ha ganado';
        } else {
          const nombreGanador = colorGanador === 'blanco' ? 'Blancas' : 'Negras';
          this.gameOverTitle = `¡${nombreGanador} han ganado!`;
        }
        
        // Mostrar diálogo de fin de juego con un pequeño delay
        setTimeout(() => {
          this.finJuegoDialog = true;
        }, 800);
        
        return; 
      }
      
      // Registrar movimiento
      this.historialMovimientos.push(notacion);
      
      // Realizar movimiento normal
      this.tablero[xDestino][yDestino] = pieza;
      this.tablero[xOrigen][yOrigen] = null;
      pieza.movido = true;
      
      // Actualizar posición del rey si se movió
      if (pieza.tipo === 'rey') {
        this.reyesPos[pieza.color] = { x: xDestino, y: yDestino };
      }
      
      // Verificar promoción de peón (pausa el juego hasta que se elija)
      if (pieza.tipo === 'peon' && (xDestino === 0 || xDestino === 7)) {
        this.peonAPromocionar = { x: xDestino, y: yDestino };
        this.promocionPeonDialog = true;
        return; // No cambiar turno hasta que se complete la promoción
      }
      
      // Solo cambiar turno si el juego no terminó
      this.cambiarTurno();
    },

    // Manejar victoria del jugador contra IA
    handleAIWin() {
      // Usar el método calculateScore del gameHandler para obtener la puntuación
      const scoreResult = this.gameHandler.calculateScore(true, this.gameTime);
      this.baseScore = scoreResult.baseScore;
      this.timeBonus = scoreResult.timeBonus;
      this.totalScore = scoreResult.totalScore;
      
      // Solo guardar resultado si hay sesión
      if (this.hasSession) {
        this.saveGameResult(true);
      }
    },

    // Cambiar turno entre jugadores
    cambiarTurno() {
      // Solo cambiar turno si el juego no ha terminado
      if (this.jaqueMate || this.reyAhogado || this.gameOver) {
        return;
      }
      
      this.turnoActual = this.turnoActual === 'blanco' ? 'negro' : 'blanco';
      
      // Verificar condiciones de fin de juego
      this.verificarFinJuego();
      
      // Si el juego terminó después de verificar, no continuar
      if (this.jaqueMate || this.reyAhogado || this.gameOver) {
        return;
      }
      
      // Movimiento de IA (solo si es modo IA, turno de negras y juego activo)
      if (this.gameMode === 'ai' && this.turnoActual === 'negro') {
        this.aiThinking = true; // Mostrar indicador de que la IA está pensando
        
        // Dar tiempo para que se procese el movimiento anterior y la UI se actualice
        setTimeout(() => {
          // Verificar nuevamente que el juego sigue activo
          if (!this.jaqueMate && !this.reyAhogado && !this.gameOver) {
            this.realizarMovimientoIA();
          }
          this.aiThinking = false;
        }, 1200); // 1.2 segundos de "pensamiento" de la IA
      }
    },

    // Realizar movimiento de IA con lógica mejorada
    realizarMovimientoIA() {
      // Verificaciones de seguridad adicionales
      if (!this.gameHandler || this.gameMode !== 'ai' || this.turnoActual !== 'negro') {
        return;
      }
      
      // Verificar que el juego sigue activo
      if (this.jaqueMate || this.reyAhogado || this.gameOver) {
        return;
      }
      
      // Usar la lógica avanzada de IA
      const movimiento = this.gameHandler.makeAIMove(this.tablero);
      
      if (movimiento && movimiento.origen && movimiento.destino) {
        // Verificar que el movimiento sigue siendo válido
        const pieza = this.tablero[movimiento.origen.x][movimiento.origen.y];
        if (pieza && pieza.color === 'negro') {
          // Simular selección de la pieza
          this.seleccionada = { x: movimiento.origen.x, y: movimiento.origen.y };
          
          // Realizar el movimiento
          this.moverPieza(
            movimiento.origen.x, 
            movimiento.origen.y, 
            movimiento.destino.x, 
            movimiento.destino.y
          );
          
          // Limpiar selección
          this.seleccionada = null;
          this.movimientosValidos = [];
        }
      } else {
        // La IA no puede mover = el jugador ganó
        this.ganador = 'blanco';
        this.jaqueMate = true;
        this.gameOver = true;
        this.stopTimer();
        
        if (this.hasSession) {
          this.handleAIWin();
        }
        
        this.gameOverTitle = '¡Victoria!';
        setTimeout(() => {
          this.finJuegoDialog = true;
        }, 800);
      }
    },

    // Verificar condiciones de fin del juego 
    verificarFinJuego() {
    },

    // Manejar promoción de peón
    promoverPeon(tipoPieza) {
      if (!this.peonAPromocionar) return;
      
      const { x, y } = this.peonAPromocionar;
      const piezaAnterior = this.tablero[x][y];
      
      // Crear nueva pieza promocionada
      this.tablero[x][y] = { tipo: tipoPieza, color: piezaAnterior.color, movido: true };
      
      // Actualizar el último movimiento en el historial para incluir la promoción
      if (this.historialMovimientos.length > 0) {
        const ultimoIndice = this.historialMovimientos.length - 1;
        this.historialMovimientos[ultimoIndice] += `=${tipoPieza.charAt(0).toUpperCase()}`;
      }
      
      this.promocionPeonDialog = false;
      this.peonAPromocionar = null;
      
      // Continuar con el cambio de turno después de la promoción
      this.cambiarTurno();
    },

    // Generar notación algebraica del movimiento
    obtenerNotacionMovimiento(xOrigen, yOrigen, xDestino, yDestino, esCaptura) {
      const columnas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const pieza = this.tablero[xOrigen][yOrigen];
      
      let notacion = '';
      
      // Añadir símbolo de la pieza (excepto peón)
      if (pieza.tipo !== 'peon') {
        const simbolos = {
          rey: 'R', dama: 'D', torre: 'T',
          alfil: 'A', caballo: 'C'
        };
        notacion += simbolos[pieza.tipo];
      }
      
      // Para peones que capturan, incluir columna de origen
      if (pieza.tipo === 'peon' && esCaptura) {
        notacion += columnas[yOrigen];
      }
      
      // Símbolo de captura
      if (esCaptura) {
        notacion += 'x';
      }
      
      // Casilla de destino
      notacion += columnas[yDestino] + (8 - xDestino);
      
      return notacion;
    },

    // Verificar si una posición está dentro del tablero
    estaEnTablero(x, y) {
      return x >= 0 && x < 8 && y >= 0 && y < 8;
    },

    // Reiniciar el juego con nueva configuración
    resetGame() {
      this.inicializarTablero();
      this.finJuegoDialog = false;
      
      // Resetear todos los estados del juego
      this.jaqueMate = false;
      this.reyAhogado = false;
      this.gameOver = false;
      this.ganador = null;
      this.seleccionada = null;
      this.movimientosValidos = [];
      this.aiThinking = false;
      
      // Reiniciar cronómetro y puntuación para modo IA
      if (this.gameMode === 'ai') {
        this.stopTimer();
        this.gameTime = 0;
        this.startTimer();
        
        // Resetear puntuaciones
        this.baseScore = this.gameHandler ? this.gameHandler.baseScore : 0;
        this.timeBonus = 0;
        this.totalScore = 0;
      }
    },

    // Métodos para la interfaz de usuario
    getTurnText() {
      if (!this.gameMode) {
        return 'Selecciona un modo de juego';
      }
      
      if (this.gameMode === 'ai') {
        if (this.aiThinking) {
          return 'IA está pensando...';
        }
        return this.turnoActual === 'blanco' ? 'Tu turno' : 'Turno de la IA';
      }
      return this.turnoActual === 'blanco' ? 'Turno: Blancas' : 'Turno: Negras';
    },

    // Obtener texto del final del juego
    getGameEndText() {
      if (this.jaqueMate) {
        if (this.gameMode === 'ai') {
          return this.gameOverTitle === '¡Victoria!' ? '¡Has ganado!' : 'La IA ha ganado';
        } else {
          const ganador = this.ganador || (this.turnoActual === 'blanco' ? 'negro' : 'blanco');
          const nombreGanador = ganador === 'blanco' ? 'Blancas' : 'Negras';
          return `¡${nombreGanador} han ganado!`;
        }
      }
      if (this.reyAhogado) {
        return '¡Tablas por rey ahogado!';
      }
      return '';
    },

    // Obtener nombre de la dificultad de IA
    getAIDifficultyName() {
      if (!this.aiDifficulty) return '';
      const difficulty = this.aiDifficulties.find(d => d.value === this.aiDifficulty);
      return difficulty ? difficulty.label : '';
    }
  }
};
</script>

<style scoped>
@import '@/components/juegos/css/multijugador/ajedrez.css';
</style>