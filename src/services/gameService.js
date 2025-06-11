import { authService } from './auth';
import { config } from "../config";

const API_URL = `${config.API_BACKEND_URL}/api`;

/**
 * Servicio para gestionar juegos y estadísticas
 */
export const gameService = {
  /**
   * Obtener todos los juegos
   * @returns {Promise<Object>} Lista de juegos
   */
  async getAllGames() {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/games`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await this._parseResponse(response);
      
      if (!data.success) {
        return data;
      }
      
      return {
        success: true,
        games: data.data
      };
    } catch (error) {
      console.error('Error al obtener juegos:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Obtener juegos de un solo jugador
   * @returns {Promise<Object>} Lista de juegos de un solo jugador
   */
  async getSinglePlayerGames() {
    try {
      const result = await this.getAllGames();
      
      if (!result.success) {
        return result;
      }
      
      // Filtrar juegos según su propiedad is_multiplayer
      const singlePlayerGames = result.games.filter(game => !game.is_multiplayer);
      
      return {
        success: true,
        games: singlePlayerGames
      };
    } catch (error) {
      console.error('Error al obtener juegos individuales:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Obtener juegos multijugador
   * @returns {Promise<Object>} Lista de juegos multijugador
   */
  async getMultiPlayerGames() {
    try {
      const result = await this.getAllGames();
      
      if (!result.success) {
        return result;
      }
      
      // Filtrar juegos según su propiedad is_multiplayer
      const multiPlayerGames = result.games.filter(game => game.is_multiplayer);
      
      return {
        success: true,
        games: multiPlayerGames
      };
    } catch (error) {
      console.error('Error al obtener juegos multijugador:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Buscar juegos por nombre
   * @param {string} query - Texto a buscar
   * @returns {Promise<Object>} Lista de juegos que coinciden con la búsqueda
   */
  async searchGames(query) {
    try {
      const result = await this.getAllGames();
      
      if (!result.success) {
        return result;
      }
      
      // Si no hay query, devolver todos
      if (!query) {
        return {
          success: true,
          games: result.games
        };
      }
      
      // Filtrar juegos que coinciden con la búsqueda
      const filteredGames = result.games.filter(game => 
        game.name.toLowerCase().includes(query.toLowerCase())
      );
      
      return {
        success: true,
        games: filteredGames
      };
    } catch (error) {
      console.error('Error al buscar juegos:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Registrar resultado de una partida
   * @param {number} gameId - ID del juego
   * @param {Object} result - Resultado de la partida
   * @param {string} result.mode - Modo de juego ('online', 'offline')
   * @param {string} result.result - Resultado ('won', 'lost', 'draw')
   * @param {number} result.score - Puntuación
   * @param {number} [result.opponentId] - ID del oponente (si aplica)
   * @param {string} [result.opponentType] - Tipo de oponente ('ai', 'human', 'local')
   * @returns {Promise<Object>} Resultado de la operación
   */
  async recordGameResult(gameId, result) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/games/${gameId}/record-result`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(result)
      });
      
      return await this._parseResponse(response);
    } catch (error) {
      console.error('Error al registrar resultado:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Obtener estadísticas de juegos para el usuario actual
   * @returns {Promise<Object>} Estadísticas de juegos
   */
  async getGameStatistics() {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await this._parseResponse(response);
      
      if (!data.success) {
        return data;
      }
      
      return {
        success: true,
        statistics: data.data
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Obtener historial de partidas del usuario
   * @param {number} [limit=10] - Número máximo de partidas a obtener
   * @returns {Promise<Object>} Historial de partidas
   */
  async getGameHistory(limit = 10) {
    try {
      const token = authService.getToken();
      if (!token) {
        return { 
          success: false, 
          message: 'No hay sesión activa' 
        };
      }
      
      const response = await fetch(`${API_URL}/game-history?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await this._parseResponse(response);
      
      if (!data.success) {
        return data;
      }
      
      return {
        success: true,
        history: data.data
      };
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Intenta de nuevo.' 
      };
    }
  },
  
  /**
   * Parsear respuesta del servidor
   * @private
   * @param {Response} response - Respuesta del servidor
   * @returns {Promise<Object>} Datos parseados
   */
  async _parseResponse(response) {
    // Obtener el texto de la respuesta
    const responseText = await response.text();
    
    // Intentar parsear como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return { 
        success: false, 
        message: `Error ${response.status}: ${response.statusText}` 
      };
    }
    
    // Si la respuesta no es exitosa
    if (!response.ok) {
      // Manejar errores de validación
      if (response.status === 422 && data.errors) {
        const errorMessages = [];
        for (const field in data.errors) {
          errorMessages.push(data.errors[field][0]);
        }
        return { 
          success: false, 
          message: errorMessages.join('\n') 
        };
      }
      
      return { 
        success: false, 
        message: data.message || 'Error en la operación' 
      };
    }
    
    return { 
      success: true, 
      data: data,
      message: data.message || 'Operación exitosa'
    };
  }
};