/**
 * Clase para el modo de juego local (en el mismo dispositivo)
 * En este modo, dos jugadores se turnan en el mismo dispositivo
 * No se guardan puntuaciones en este modo
 */
export default class LocalGame {
  constructor() {
    this.initialize();
  }
  
  /**
   * Inicializa el estado del juego
   */
  initialize() {
    // No se necesita una inicialización especial para el modo local
  }
  
  /**
   * Realiza un movimiento en el tablero
   * @param {number} index - Posición en el tablero (0-8)
   * @param {Array} board - Estado actual del tablero
   * @param {string} currentPlayer - Jugador actual ('X' u 'O')
   * @returns {Object} - Nuevo estado del tablero y jugador actual
   */
  makeMove(index, board, currentPlayer) {
    // Verificar si la celda está ocupada
    if (board[index] !== null) {
      return null;
    }
    
    // Crear una copia del tablero para no modificar el original
    const newBoard = [...board];
    
    // Realizar el movimiento
    newBoard[index] = currentPlayer;
    
    // Cambiar el turno al otro jugador
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    // Devolver el nuevo estado
    return {
      board: newBoard,
      currentPlayer: nextPlayer
    };
  }
  
  /**
   * Reinicia el juego
   */
  resetGame() {
    // No se necesita una reinicialización especial para el modo local
  }
}