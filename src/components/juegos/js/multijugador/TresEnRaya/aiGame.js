/**
 * Clase para el modo de juego contra IA
 * Implementa diferentes niveles de dificultad para la IA
 */
export default class AIGame {
  /**
   * Constructor
   * @param {string} difficulty - Nivel de dificultad ('normal', 'hard', 'impossible')
   */
  constructor(difficulty = 'normal') {
    this.difficulty = difficulty;
    this.baseScore = this.getBaseScore(difficulty);
    this.timeLimit = this.getTimeLimit(difficulty);
    this.initialize();
  }
  
  /**
   * Inicializa el estado del juego
   */
  initialize() {
    // No se necesita una inicialización especial para el modo IA
  }
  
  /**
   * Obtiene la puntuación base según la dificultad
   * @param {string} difficulty - Nivel de dificultad
   * @returns {number} - Puntuación base
   */
  getBaseScore(difficulty) {
    switch (difficulty) {
      case 'normal':
        return 50;
      case 'hard':
        return 100;
      case 'impossible':
        return 200;
      default:
        return 50;
    }
  }
  
  /**
   * Obtiene el límite de tiempo para el bonus según la dificultad
   * @param {string} difficulty - Nivel de dificultad
   * @returns {number} - Límite de tiempo en segundos
   */
  getTimeLimit(difficulty) {
    switch (difficulty) {
      case 'normal':
        return 60; // 1 minuto
      case 'hard':
        return 90; // 1.5 minutos
      case 'impossible':
        return 120; // 2 minutos
      default:
        return 60;
    }
  }
  
  /**
   * Calcula la puntuación de la partida
   * @param {boolean} isVictory - Si el jugador ha ganado
   * @param {number} gameTime - Tiempo de juego en segundos
   * @returns {Object} - Objeto con puntuación base, bonus por tiempo y puntuación total
   */
  calculateScore(isVictory, gameTime) {
    // Si es una derrota o empate, no hay puntos
    if (!isVictory) {
      return {
        baseScore: this.baseScore,
        timeBonus: 0,
        totalScore: 0
      };
    }
    
    // Calcular bonus por tiempo
    let timeBonus = 0;
    if (gameTime < this.timeLimit) {
      const timeRatio = 1 - (gameTime / this.timeLimit);
      timeBonus = Math.floor(this.baseScore * timeRatio);
    }
    
    // Sumar bonus al total
    const totalScore = this.baseScore + timeBonus;
    
    return {
      baseScore: this.baseScore,
      timeBonus: timeBonus,
      totalScore: totalScore
    };
  }
  
  /**
   * Realiza un movimiento del jugador en el tablero
   * @param {number} index - Posición en el tablero (0-8)
   * @param {Array} board - Estado actual del tablero
   * @param {string} currentPlayer - Jugador actual ('X' u 'O')
   * @returns {Object} - Nuevo estado del tablero y jugador actual
   */
  makeMove(index, board, currentPlayer) {
    // Solo permitir movimientos del jugador (X)
    if (currentPlayer !== 'X' || board[index] !== null) {
      return null;
    }
    
    // Crear una copia del tablero para no modificar el original
    const newBoard = [...board];
    
    // Realizar el movimiento
    newBoard[index] = currentPlayer;
    
    // Cambiar el turno a la IA (O)
    return {
      board: newBoard,
      currentPlayer: 'O'
    };
  }
  
  /**
   * Realiza el movimiento de la IA
   * @param {Array} board - Estado actual del tablero
   * @returns {Object} - Nuevo estado del tablero y jugador actual
   */
  makeAIMove(board) {
    // Seleccionar movimiento según dificultad
    let moveIndex;
    
    switch (this.difficulty) {
      case 'normal':
        moveIndex = this.getNormalMove(board);
        break;
      case 'hard':
        moveIndex = this.getHardMove(board);
        break;
      case 'impossible':
        moveIndex = this.getImpossibleMove(board);
        break;
      default:
        moveIndex = this.getNormalMove(board);
    }
    
    // Si no hay movimiento válido, retornar null
    if (moveIndex === null) {
      return null;
    }
    
    // Crear una copia del tablero para no modificar el original
    const newBoard = [...board];
    
    // Realizar el movimiento
    newBoard[moveIndex] = 'O';
    
    // Cambiar el turno al jugador
    return {
      board: newBoard,
      currentPlayer: 'X'
    };
  }
  
  /**
   * Obtiene un movimiento para la dificultad normal
   * En este nivel, la IA combina movimientos aleatorios con algunos
   * movimientos inteligentes (bloquear victoria del jugador)
   * @param {Array} board - Estado actual del tablero
   * @returns {number|null} - Índice del movimiento o null si no hay movimiento
   */
  getNormalMove(board) {
    // 70% de las veces toma decisiones aleatorias, 30% inteligentes
    if (Math.random() < 0.7) {
      return this.getRandomMove(board);
    } else {
      // Intentar bloquear al jugador o ganar
      const smartMove = this.findWinningMove(board, 'O') || this.findWinningMove(board, 'X');
      
      if (smartMove !== null) {
        return smartMove;
      }
      
      // Si no hay movimiento inteligente, hacer uno aleatorio
      return this.getRandomMove(board);
    }
  }
  
  /**
   * Obtiene un movimiento para la dificultad difícil
   * En este nivel, la IA prioriza jugadas inteligentes pero a veces comete errores
   * @param {Array} board - Estado actual del tablero
   * @returns {number|null} - Índice del movimiento o null si no hay movimiento
   */
  getHardMove(board) {
    // 80% del tiempo juega inteligentemente
    if (Math.random() < 0.8) {
      // Intentar ganar primero
      const winningMove = this.findWinningMove(board, 'O');
      if (winningMove !== null) {
        return winningMove;
      }
      
      // Bloquear al jugador si está a punto de ganar
      const blockingMove = this.findWinningMove(board, 'X');
      if (blockingMove !== null) {
        return blockingMove;
      }
      
      // Estrategia: ocupar el centro si está libre
      if (board[4] === null) {
        return 4;
      }
      
      // Estrategia: ocupar las esquinas libres
      const corners = [0, 2, 6, 8];
      const emptyCorners = corners.filter(index => board[index] === null);
      if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
      }
      
      // Si no hay esquinas, usar los lados
      return this.getRandomMove(board);
    } else {
      // 20% del tiempo juega aleatoriamente (simula errores)
      return this.getRandomMove(board);
    }
  }
  
  /**
   * Obtiene un movimiento para la dificultad imposible
   * En este nivel, la IA utiliza el algoritmo Minimax para tomar decisiones óptimas
   * @param {Array} board - Estado actual del tablero
   * @returns {number|null} - Índice del movimiento o null si no hay movimiento
   */
  getImpossibleMove(board) {
    // Verificar si es el primer movimiento y el centro está libre
    if (board.filter(cell => cell !== null).length === 0 || board.filter(cell => cell !== null).length === 1) {
      if (board[4] === null) {
        return 4; // Tomar el centro en el primer movimiento si está disponible
      }
    }
    
    // Usar algoritmo Minimax para encontrar el mejor movimiento
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < board.length; i++) {
      // Solo considerar celdas vacías
      if (board[i] === null) {
        // Probar este movimiento
        const boardCopy = [...board];
        boardCopy[i] = 'O';
        
        // Calcular puntuación de este movimiento
        const score = this.minimax(boardCopy, 0, false);
        
        // Actualizar mejor movimiento si es necesario
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  }
  
  /**
   * Algoritmo Minimax para encontrar el mejor movimiento
   * @param {Array} board - Estado actual del tablero
   * @param {number} depth - Profundidad actual en el árbol de búsqueda
   * @param {boolean} isMaximizing - True si es el turno del maximizador (IA), false si es el jugador
   * @returns {number} - Puntuación de este estado del tablero
   */
  minimax(board, depth, isMaximizing) {
    // Comprobar si el juego ha terminado
    const winner = this.checkWinner(board);
    
    // Casos base
    if (winner === 'O') return 10 - depth; // IA gana
    if (winner === 'X') return depth - 10; // Jugador gana
    if (this.isBoardFull(board)) return 0; // Empate
    
    if (isMaximizing) {
      // Turno de la IA, maximizar puntuación
      let bestScore = -Infinity;
      
      for (let i = 0; i < board.length; i++) {
        // Solo considerar celdas vacías
        if (board[i] === null) {
          // Probar este movimiento
          const boardCopy = [...board];
          boardCopy[i] = 'O';
          
          // Recursivamente calcular puntuación
          const score = this.minimax(boardCopy, depth + 1, false);
          bestScore = Math.max(score, bestScore);
        }
      }
      
      return bestScore;
    } else {
      // Turno del jugador, minimizar puntuación
      let bestScore = Infinity;
      
      for (let i = 0; i < board.length; i++) {
        // Solo considerar celdas vacías
        if (board[i] === null) {
          // Probar este movimiento
          const boardCopy = [...board];
          boardCopy[i] = 'X';
          
          // Recursivamente calcular puntuación
          const score = this.minimax(boardCopy, depth + 1, true);
          bestScore = Math.min(score, bestScore);
        }
      }
      
      return bestScore;
    }
  }
  
  /**
   * Obtiene un movimiento aleatorio en las celdas disponibles
   * @param {Array} board - Estado actual del tablero
   * @returns {number|null} - Índice del movimiento o null si no hay movimiento
   */
  getRandomMove(board) {
    // Encontrar celdas disponibles
    const availableMoves = board
      .map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null);
    
    // Si no hay movimientos disponibles
    if (availableMoves.length === 0) {
      return null;
    }
    
    // Seleccionar un movimiento aleatorio
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }
  
  /**
   * Busca un movimiento ganador o de bloqueo
   * @param {Array} board - Estado actual del tablero
   * @param {string} player - Jugador ('X' u 'O')
   * @returns {number|null} - Índice del movimiento o null si no hay movimiento
   */
  findWinningMove(board, player) {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
      [0, 4, 8], [2, 4, 6]             // diagonales
    ];
    
    // Buscar en cada combinación ganadora
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      
      // Contar cuántas celdas ocupadas por el jugador hay en la combinación
      const cells = [board[a], board[b], board[c]];
      const playerCells = cells.filter(cell => cell === player).length;
      
      // Si hay dos celdas del jugador y una vacía, encontrar la vacía
      if (playerCells === 2 && cells.includes(null)) {
        // Encontrar la celda vacía
        if (board[a] === null) return a;
        if (board[b] === null) return b;
        if (board[c] === null) return c;
      }
    }
    
    return null;
  }
  
  /**
   * Comprueba si hay un ganador
   * @param {Array} board - Estado actual del tablero
   * @returns {string|null} - 'X', 'O', 'draw' o null si no hay ganador
   */
  checkWinner(board) {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
      [0, 4, 8], [2, 4, 6]             // diagonales
    ];
    
    // Verificar victoria
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        board[a] && 
        board[a] === board[b] && 
        board[a] === board[c]
      ) {
        return board[a];
      }
    }
    
    // Verificar empate
    if (!board.includes(null)) {
      return 'draw';
    }
    
    // No hay ganador todavía
    return null;
  }
  
  /**
   * Comprueba si el tablero está lleno
   * @param {Array} board - Estado actual del tablero
   * @returns {boolean} - True si el tablero está lleno
   */
  isBoardFull(board) {
    return !board.includes(null);
  }
  
  /**
   * Reinicia el juego
   */
  resetGame() {
    // No se necesita una reinicialización especial para el modo IA
  }
}