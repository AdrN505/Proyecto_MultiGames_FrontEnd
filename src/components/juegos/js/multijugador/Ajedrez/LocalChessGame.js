// LocalChessGame.js - Lógica para juego local de ajedrez
export default class LocalChessGame {
  constructor() {
    this.gameMode = 'local';
  }

  // Método para realizar un movimiento en modo local
  makeMove(turnoActual) {
    // En modo local, simplemente permitir el movimiento si es válido
    // La validación ya se hace en el componente principal
    return {
      success: true,
      nextTurn: turnoActual === 'blanco' ? 'negro' : 'blanco'
    };
  }

  // Método para reiniciar el juego
  resetGame() {
    // No hay estado específico que mantener para juego local
    return true;
  }

  // Método para obtener el nombre del jugador
  getPlayerName(color) {
    return color === 'blanco' ? 'Jugador Blanco' : 'Jugador Negro';
  }

  // Método para determinar si se debe mostrar información adicional
  shouldShowGameInfo() {
    return false; // En modo local no necesitamos cronómetro ni dificultad
  }
}