/**
 * Tetris Game Logic
 * Implementa la lógica básica del juego Tetris
 */

export class tetrisGame {
  constructor(config) {
    // Configuración del tablero
    this.rows = config.rows || 20;
    this.cols = config.cols || 10;
    
    // Callbacks
    this.onRender = config.onRender || (() => {});
    this.onGameOver = config.onGameOver || (() => {});
    this.onScoreUpdate = config.onScoreUpdate || (() => {});
    
    // Variables del juego
    this.board = [];
    this.nextPieceBoard = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.gameOver = false;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    
    // Inicializar el juego
    this.init();
  }
  
  /**
   * Inicializa el juego
   */
  init() {
    // Crear tablero vacío
    this.board = Array(this.rows).fill().map(() => 
      Array(this.cols).fill().map(() => ({ color: '', isActive: false }))
    );
    
    // Crear tablero para la siguiente pieza
    this.nextPieceBoard = Array(4).fill().map(() => 
      Array(4).fill().map(() => ({ color: '' }))
    );
    
    // Generar primera pieza
    this.currentPiece = this.generateRandomPiece();
    
    // Generar siguiente pieza
    this.nextPiece = this.generateRandomPiece();
    this.updateNextPiecePreview();
    
    // Colocar la pieza actual en el tablero
    this.renderCurrentPiece();
    
    // Renderizar estado inicial
    this.updateGameState();
  }
  
  /**
   * Actualiza el estado del juego y notifica para renderizar
   */
  updateGameState() {
    // Crear copia del estado actual, asegurando que no afecte a las piezas originales
    const gameState = {
      board: this.board.map(row => row.map(cell => ({
        color: cell.color,
        isActive: cell.isActive || false
      }))),
      nextPieceBoard: this.nextPieceBoard.map(row => row.map(cell => ({
        color: cell.color
      }))),
      score: this.score,
      lines: this.lines,
      level: this.level
    };
    
    // Llamar al callback de renderizado
    this.onRender(gameState);
  }
  
  /**
   * Genera una pieza aleatoria (tetromino)
   * @returns {Object} Pieza generada
   */
  generateRandomPiece() {
    // Definición de tetrominos
    const tetrominos = [
      {
        // I - pieza
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        color: 'tetris-cyan'
      },
      {
        // J - pieza
        shape: [
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0]
        ],
        color: 'tetris-blue'
      },
      {
        // L - pieza
        shape: [
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0]
        ],
        color: 'tetris-orange'
      },
      {
        // O - pieza
        shape: [
          [1, 1],
          [1, 1]
        ],
        color: 'tetris-yellow'
      },
      {
        // S - pieza
        shape: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0]
        ],
        color: 'tetris-green'
      },
      {
        // T - pieza
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0]
        ],
        color: 'tetris-purple'
      },
      {
        // Z - pieza
        shape: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0]
        ],
        color: 'tetris-red'
      }
    ];
    
    // Seleccionar pieza aleatoria
    const randomIndex = Math.floor(Math.random() * tetrominos.length);
    const tetromino = tetrominos[randomIndex];
    
    // Crear objeto con la información de la pieza
    return {
      shape: JSON.parse(JSON.stringify(tetromino.shape)), 
      color: tetromino.color,
      position: {
        // Posición inicial centrada en la parte superior
        x: Math.floor((this.cols - tetromino.shape[0].length) / 2),
        y: 0
      },
      rotation: 0
    };
  }
  
  /**
   * Actualiza la vista previa de la siguiente pieza
   */
  updateNextPiecePreview() {
    // Limpiar tablero de vista previa
    this.nextPieceBoard = Array(4).fill().map(() => 
      Array(4).fill().map(() => ({ color: '' }))
    );
    
    // Colocar la siguiente pieza en el centro
    const shape = this.nextPiece.shape;
    const offsetX = Math.floor((4 - shape[0].length) / 2);
    const offsetY = Math.floor((4 - shape.length) / 2);
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          this.nextPieceBoard[y + offsetY][x + offsetX] = {
            color: this.nextPiece.color
          };
        }
      }
    }
  }
  
  /**
   * Renderiza la pieza actual en el tablero
   */
  renderCurrentPiece() {
    // Mantener dos representaciones: tablero fijo y pieza activa
    this.clearActivePiece();
    
    // Dibujar la pieza actual en el tablero
    const shape = this.currentPiece.shape;
    const pos = this.currentPiece.position;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = y + pos.y;
          const boardX = x + pos.x;
          
          // Verificar que esté dentro del tablero
          if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
            this.board[boardY][boardX] = {
              color: this.currentPiece.color,
              isActive: true // Marcar como parte de la pieza activa
            };
          }
        }
      }
    }
  }

  /**
   * Limpia la pieza activa del tablero
   */
  clearActivePiece() {
    // Eliminar solamente las celdas de la pieza activa
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x] && this.board[y][x].isActive) {
          this.board[y][x] = { color: '' };
        }
      }
    }
  }
  
  /**
   * Obtiene una copia del tablero solo con las piezas fijas
   * @returns {Array} Tablero limpio
   */
  getCleanBoard() {
    // Crear una copia vacía del tablero
    const newBoard = Array(this.rows).fill().map(() => 
      Array(this.cols).fill().map(() => ({ color: '' }))
    );
    
    // Copiar solo las celdas fijas (no de la pieza activa)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x] && this.board[y][x].color && !this.board[y][x].isActive) {
          newBoard[y][x] = { color: this.board[y][x].color };
        }
      }
    }
    
    return newBoard;
  }
  
  /**
   * Comprueba si la pieza actual tiene una colisión con el tablero o los bordes
   * @param {Object} piece - Pieza a comprobar
   * @returns {boolean} - True si hay colisión, false en caso contrario
   */
  checkCollision(piece) {
    const shape = piece.shape;
    const pos = piece.position;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = y + pos.y;
          const boardX = x + pos.x;
          
          // Colisión con los límites del tablero
          if (
            boardX < 0 || 
            boardX >= this.cols || 
            boardY >= this.rows
          ) {
            return true;
          }
          
          // Colisión con bloques existentes (solo si la posición Y está dentro del tablero)
          if (
            boardY >= 0 && 
            this.board[boardY] && 
            this.board[boardY][boardX] && 
            this.board[boardY][boardX].color !== '' && 
            !this.board[boardY][boardX].isActive // Solo colisiona con piezas fijas, no con la activa
          ) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Rota la pieza actual en el sentido horario
   */
  rotate() {
    if (this.gameOver) return;
    
    // Crear copia de la pieza actual
    const rotatedPiece = {
      ...this.currentPiece,
      shape: this.rotateMatrix(this.currentPiece.shape)
    };
    
    // Verificar colisiones
    if (!this.checkCollision(rotatedPiece)) {
      this.currentPiece = rotatedPiece;
      this.renderCurrentPiece();
      this.updateGameState();
    }
  }
  
  /**
   * Rota una matriz en sentido horario
   * @param {Array} matrix - Matriz a rotar
   * @returns {Array} Matriz rotada
   */
  rotateMatrix(matrix) {
    const N = matrix.length;
    const result = Array(N).fill().map(() => Array(N).fill(0));
    
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        result[x][N - 1 - y] = matrix[y][x];
      }
    }
    
    return result;
  }
  
  /**
   * Mueve la pieza actual a la izquierda
   */
  moveLeft() {
    if (this.gameOver) return;
    
    // Crear copia de la pieza con nueva posición
    const movedPiece = {
      ...this.currentPiece,
      position: {
        ...this.currentPiece.position,
        x: this.currentPiece.position.x - 1
      }
    };
    
    // Verificar colisiones
    if (!this.checkCollision(movedPiece)) {
      this.currentPiece = movedPiece;
      this.renderCurrentPiece();
      this.updateGameState();
    }
  }
  
  /**
   * Mueve la pieza actual a la derecha
   */
  moveRight() {
    if (this.gameOver) return;
    
    // Crear copia de la pieza con nueva posición
    const movedPiece = {
      ...this.currentPiece,
      position: {
        ...this.currentPiece.position,
        x: this.currentPiece.position.x + 1
      }
    };
    
    // Verificar colisiones
    if (!this.checkCollision(movedPiece)) {
      this.currentPiece = movedPiece;
      this.renderCurrentPiece();
      this.updateGameState();
    }
  }
  
  /**
   * Mueve la pieza actual hacia abajo
   */
  moveDown() {
    if (this.gameOver) return;
    
    // Crear copia de la pieza con nueva posición
    const movedPiece = {
      ...this.currentPiece,
      position: {
        ...this.currentPiece.position,
        y: this.currentPiece.position.y + 1
      }
    };
    
    // Verificar colisiones
    if (!this.checkCollision(movedPiece)) {
      this.currentPiece = movedPiece;
      this.renderCurrentPiece();
      this.updateGameState();
    } else {
      // Fijar la pieza al tablero
      this.lockPiece();
      
      // Verificar líneas completas
      this.checkLines();
      
      // Generar nueva pieza
      this.spawnNextPiece();
    }
  }
  
  /**
   * Deja caer la pieza actual hasta el fondo
   */
  dropDown() {
    if (this.gameOver) return;
    
    // Mover la pieza hacia abajo hasta que colisione
    let dropped = false;
    while (!dropped) {
      // Crear copia de la pieza con nueva posición
      const movedPiece = {
        ...this.currentPiece,
        position: {
          ...this.currentPiece.position,
          y: this.currentPiece.position.y + 1
        }
      };
      
      // Verificar colisiones
      if (!this.checkCollision(movedPiece)) {
        this.currentPiece = movedPiece;
      } else {
        dropped = true;
        
        // Fijar la pieza al tablero
        this.lockPiece();
        
        // Verificar líneas completas
        this.checkLines();
        
        // Generar nueva pieza
        this.spawnNextPiece();
      }
    }
    
    // Renderizar
    this.renderCurrentPiece();
    this.updateGameState();
  }
  
  /**
   * Fija la pieza actual al tablero
   */
  lockPiece() {
    // Transferir la pieza actual a celdas fijas
    const shape = this.currentPiece.shape;
    const pos = this.currentPiece.position;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = y + pos.y;
          const boardX = x + pos.x;
          
          // Verificar que esté dentro del tablero
          if (boardY >= 0 && boardY < this.rows && boardX >= 0 && boardX < this.cols) {
            // Marcar como celda fija (ya no es parte de la pieza activa)
            this.board[boardY][boardX] = {
              color: this.currentPiece.color,
              isActive: false
            };
          }
        }
      }
    }
  }
  
  /**
   * Genera la siguiente pieza
   */
  spawnNextPiece() {
    // La siguiente pieza se convierte en la actual
    this.currentPiece = this.nextPiece;
    
    // Generar nueva pieza para "siguiente"
    this.nextPiece = this.generateRandomPiece();
    this.updateNextPiecePreview();
    
    // Verificar si hay colisión inmediata (game over)
    if (this.checkCollision(this.currentPiece)) {
      this.gameOver = true;
      this.onGameOver(this.score);
    } else {
      // Renderizar la nueva pieza
      this.renderCurrentPiece();
      this.updateGameState();
    }
  }
  
  /**
   * Verifica si hay líneas completas y las elimina
   */
  checkLines() {
    let linesCleared = 0;
    
    // Verificar cada fila
    for (let y = this.rows - 1; y >= 0; y--) {
      // Verificar si toda la fila está ocupada
      const isLineComplete = this.board[y].every(cell => cell.color !== '');
      
      if (isLineComplete) {
        // Eliminar la línea
        this.removeLine(y);
        linesCleared++;
        
        // Volver a verificar la misma fila (ahora contiene la fila superior)
        y++;
      }
    }
    
    // Actualizar puntuación si hay líneas eliminadas
    if (linesCleared > 0) {
      this.updateScore(linesCleared);
    }
  }
  
  /**
   * Elimina una línea y mueve todo hacia abajo
   * @param {number} line - Índice de la línea a eliminar
   */
  removeLine(line) {
    // Eliminar la línea
    for (let y = line; y > 0; y--) {
      for (let x = 0; x < this.cols; x++) {
        this.board[y][x] = { ...this.board[y - 1][x] };
      }
    }
    
    // Limpiar la primera línea
    for (let x = 0; x < this.cols; x++) {
      this.board[0][x] = { color: '' };
    }
  }
  
  /**
   * Actualiza la puntuación basada en las líneas eliminadas
   * @param {number} linesCleared - Número de líneas eliminadas
   */
  updateScore(linesCleared) {
    // Puntos base por líneas eliminadas (Sistema de puntuación de NES Tetris)
    const basePoints = {
      1: 40,
      2: 100,
      3: 300,
      4: 1200
    };
    
    // Calcular nivel basado en líneas totales (cada 10 líneas sube un nivel)
    this.lines += linesCleared;
    const newLevel = Math.floor(this.lines / 10) + 1;
    
    // Si subió de nivel
    if (newLevel > this.level) {
      this.level = newLevel;
    }
    
    // Calcular puntos con multiplicador de nivel
    const points = basePoints[linesCleared] * this.level;
    this.score += points;
    
    // Notificar cambio en puntuación
    this.onScoreUpdate(this.score, this.lines, this.level);
  }
}