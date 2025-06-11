// AIChessGame.js - Lógica para juego contra IA de ajedrez 
export default class AIChessGame {
  constructor(difficulty = 'normal') {
    this.gameMode = 'ai';
    this.difficulty = difficulty;
    this.baseScore = this.getBaseScore(difficulty);
  }

  getBaseScore(difficulty) {
    const scores = {
      'facil': 150,
      'normal': 300,
      'dificil': 500
    };
    return scores[difficulty] || 300;
  }

  // Método para realizar movimiento contra IA
  makeMove(turnoActual) {
    if (turnoActual === 'negro') {
      return { success: false };
    }
    return {
      success: true,
      nextTurn: 'negro'
    };
  }

  // Método principal para que la IA haga su movimiento
  makeAIMove(tablero) {
    const profundidad = this.getDifficultyDepth();
    return this.movimientoIA(tablero, profundidad);
  }

  getDifficultyDepth() {
    const depths = {
      'facil': 1,
      'normal': 2,
      'dificil': 3
    };
    return depths[this.difficulty] || 2;
  }

  // Calcular puntuación basada en victoria y tiempo
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

  resetGame() {
    return true;
  }

  getPlayerName(color) {
    return color === 'blanco' ? 'Jugador' : 'IA';
  }

  shouldShowGameInfo() {
    return true;
  }

  // Valores de las piezas con posiciones
  VALORES_PIEZAS = {
    peon: 100,
    caballo: 320,
    alfil: 330,
    torre: 500,
    dama: 900,
    rey: 20000
  };

  // Tablas de posición para evaluar mejores ubicaciones
  TABLAS_POSICION = {
    peon: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -20, -20, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    caballo: [
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50]
    ],
    rey: [
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-20, -30, -30, -40, -40, -30, -30, -20],
      [-10, -20, -20, -20, -20, -20, -20, -10],
      [20, 20, 0, 0, 0, 0, 20, 20],
      [20, 30, 10, 0, 0, 10, 30, 20]
    ]
  };

  // Evaluar tablero desde perspectiva de negras (IA)
  evaluarTablero(tablero) {
    let valorTotal = 0;
    let materialBlanco = 0;
    let materialNegro = 0;
    
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const pieza = tablero[x][y];
        if (!pieza) continue;
        
        const valorBase = this.VALORES_PIEZAS[pieza.tipo];
        let valorPosicion = 0;
        
        // Aplicar tabla de posición si existe
        if (this.TABLAS_POSICION[pieza.tipo]) {
          const fila = pieza.color === 'blanco' ? x : 7 - x;
          valorPosicion = this.TABLAS_POSICION[pieza.tipo][fila][y];
        }
        
        const valorTotal = valorBase + valorPosicion;
        
        if (pieza.color === 'negro') {
          materialNegro += valorTotal;
        } else {
          materialBlanco += valorTotal;
        }
      }
    }
    
    return materialNegro - materialBlanco;
  }

  // Verificar si el rey está en jaque
  estaEnJaque(tablero, colorRey, posRey = null) {
    if (!posRey) {
      // Encontrar posición del rey
      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          const pieza = tablero[x][y];
          if (pieza && pieza.tipo === 'rey' && pieza.color === colorRey) {
            posRey = { x, y };
            break;
          }
        }
        if (posRey) break;
      }
    }
    
    if (!posRey) return false;
    
    const colorEnemigo = colorRey === 'blanco' ? 'negro' : 'blanco';
    
    // Verificar ataques de todas las piezas enemigas
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const pieza = tablero[x][y];
        if (pieza && pieza.color === colorEnemigo) {
          const movimientos = this.obtenerMovimientosBasicos(tablero, x, y, pieza);
          if (movimientos.some(mov => mov.x === posRey.x && mov.y === posRey.y)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Verificar si un movimiento es seguro (no deja al rey en jaque)
  esMovimientoSeguro(tablero, origen, destino, colorPropio) {
    // Simular movimiento
    const tableroTemporal = JSON.parse(JSON.stringify(tablero));
    tableroTemporal[destino.x][destino.y] = tableroTemporal[origen.x][origen.y];
    tableroTemporal[origen.x][origen.y] = null;
    
    // Verificar si el rey queda en jaque
    return !this.estaEnJaque(tableroTemporal, colorPropio);
  }

  // Evaluar si una posición está bajo amenaza
  estaAmenazada(tablero, x, y, colorDefensor) {
    const colorAtacante = colorDefensor === 'blanco' ? 'negro' : 'blanco';
    
    for (let ax = 0; ax < 8; ax++) {
      for (let ay = 0; ay < 8; ay++) {
        const pieza = tablero[ax][ay];
        if (pieza && pieza.color === colorAtacante) {
          const movimientos = this.obtenerMovimientosBasicos(tablero, ax, ay, pieza);
          if (movimientos.some(mov => mov.x === x && mov.y === y)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Obtener todos los movimientos legales para un color
  obtenerMovimientosLegales(tablero, color) {
    const movimientos = [];
    
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const pieza = tablero[x][y];
        if (pieza && pieza.color === color) {
          const movimientosPieza = this.obtenerMovimientosBasicos(tablero, x, y, pieza);
          
          for (const destino of movimientosPieza) {
            // Verificar que el movimiento es seguro
            if (this.esMovimientoSeguro(tablero, { x, y }, destino, color)) {
              movimientos.push({
                origen: { x, y },
                destino: destino,
                pieza: pieza.tipo,
                captura: tablero[destino.x][destino.y] !== null
              });
            }
          }
        }
      }
    }
    
    return movimientos;
  }

  // Obtener movimientos básicos sin considerar jaque
  obtenerMovimientosBasicos(tablero, x, y, pieza) {
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
        return [...this.movimientosTorre(tablero, x, y, pieza.color), 
                ...this.movimientosAlfil(tablero, x, y, pieza.color)];
      case 'rey':
        return this.movimientosRey(tablero, x, y, pieza.color);
      default:
        return [];
    }
  }

  estaEnTablero(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

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

  movimientosTorre(tablero, x, y, color) {
    const movimientos = [];
    const direcciones = [
      { x: 0, y: 1 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: -1, y: 0 }
    ];
    
    for (const dir of direcciones) {
      let nx = x + dir.x;
      let ny = y + dir.y;
      
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

  movimientosAlfil(tablero, x, y, color) {
    const movimientos = [];
    const direcciones = [
      { x: 1, y: 1 }, { x: 1, y: -1 },
      { x: -1, y: 1 }, { x: -1, y: -1 }
    ];
    
    for (const dir of direcciones) {
      let nx = x + dir.x;
      let ny = y + dir.y;
      
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

  movimientosCaballo(tablero, x, y, color) {
    const movimientos = [];
    const posibilidades = [
      { x: -2, y: -1 }, { x: -2, y: 1 },
      { x: -1, y: -2 }, { x: -1, y: 2 },
      { x: 1, y: -2 }, { x: 1, y: 2 },
      { x: 2, y: -1 }, { x: 2, y: 1 }
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

  movimientosRey(tablero, x, y, color) {
    const movimientos = [];
    const posibilidades = [
      { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }
    ];
    
    for (const pos of posibilidades) {
      const nx = x + pos.x;
      const ny = y + pos.y;
      
      if (this.estaEnTablero(nx, ny)) {
        const pieza = tablero[nx][ny];
        
        // El rey puede moverse a casillas vacías o capturar piezas enemigas
        if (!pieza || pieza.color !== color) {
          // Verificar que la casilla no esté amenazada DESPUÉS del movimiento
          // Simular el movimiento para verificar si es seguro
          const tableroTemp = JSON.parse(JSON.stringify(tablero));
          tableroTemp[nx][ny] = tableroTemp[x][y];
          tableroTemp[x][y] = null;
          
          // Verificar si el rey estaría en jaque en la nueva posición
          if (!this.estaAmenazada(tableroTemp, nx, ny, color)) {
            movimientos.push({ x: nx, y: ny });
          }
        }
      }
    }
    
    return movimientos;
  }

  // Algoritmo Minimax mejorado con evaluación inteligente
  minimax(tablero, profundidad, alpha, beta, esMaximizador) {
    if (profundidad === 0) {
      return this.evaluarTablero(tablero);
    }
    
    const color = esMaximizador ? 'negro' : 'blanco';
    const movimientos = this.obtenerMovimientosLegales(tablero, color);
    
    if (movimientos.length === 0) {
      // Sin movimientos legales
      if (this.estaEnJaque(tablero, color)) {
        // Jaque mate
        return esMaximizador ? -50000 : 50000;
      } else {
        // Rey ahogado (tablas)
        return 0;
      }
    }
    
    // Ordenar movimientos 
    movimientos.sort((a, b) => {
      let valorA = a.captura ? 1000 : 0;
      let valorB = b.captura ? 1000 : 0;
      return valorB - valorA;
    });
    
    if (esMaximizador) {
      let mejorValor = -Infinity;
      
      for (const movimiento of movimientos) {
        const tableroTemporal = JSON.parse(JSON.stringify(tablero));
        
        tableroTemporal[movimiento.destino.x][movimiento.destino.y] = 
          tableroTemporal[movimiento.origen.x][movimiento.origen.y];
        tableroTemporal[movimiento.origen.x][movimiento.origen.y] = null;
        
        const valor = this.minimax(tableroTemporal, profundidad - 1, alpha, beta, false);
        mejorValor = Math.max(mejorValor, valor);
        
        alpha = Math.max(alpha, mejorValor);
        if (beta <= alpha) {
          break; 
        }
      }
      
      return mejorValor;
    } else {
      let mejorValor = Infinity;
      
      for (const movimiento of movimientos) {
        const tableroTemporal = JSON.parse(JSON.stringify(tablero));
        
        tableroTemporal[movimiento.destino.x][movimiento.destino.y] = 
          tableroTemporal[movimiento.origen.x][movimiento.origen.y];
        tableroTemporal[movimiento.origen.x][movimiento.origen.y] = null;
        
        const valor = this.minimax(tableroTemporal, profundidad - 1, alpha, beta, true);
        mejorValor = Math.min(mejorValor, valor);
        
        beta = Math.min(beta, mejorValor);
        if (beta <= alpha) {
          break; // Poda alpha-beta
        }
      }
      
      return mejorValor;
    }
  }

  // Generar movimiento inteligente de la IA
  movimientoIA(tablero, profundidad) {
    const movimientosLegales = this.obtenerMovimientosLegales(tablero, 'negro');
    
    if (movimientosLegales.length === 0) {
      return null;
    }
    
    // Verificar si estamos en jaque y priorizar salir de él
    const enJaque = this.estaEnJaque(tablero, 'negro');
    
    if (enJaque) {
      // Buscar movimientos que saquen del jaque
      const movimientosSeguros = movimientosLegales.filter(mov => {
        const tableroTemp = JSON.parse(JSON.stringify(tablero));
        tableroTemp[mov.destino.x][mov.destino.y] = tableroTemp[mov.origen.x][mov.origen.y];
        tableroTemp[mov.origen.x][mov.origen.y] = null;
        return !this.estaEnJaque(tableroTemp, 'negro');
      });
      
      if (movimientosSeguros.length > 0) {
        // Si hay movimientos seguros, elegir el mejor
        let mejorMovimiento = movimientosSeguros[0];
        let mejorValor = -Infinity;
        
        for (const movimiento of movimientosSeguros) {
          const tableroTemp = JSON.parse(JSON.stringify(tablero));
          tableroTemp[movimiento.destino.x][movimiento.destino.y] = tableroTemp[movimiento.origen.x][movimiento.origen.y];
          tableroTemp[movimiento.origen.x][movimiento.origen.y] = null;
          
          const valor = this.evaluarTablero(tableroTemp);
          if (valor > mejorValor) {
            mejorValor = valor;
            mejorMovimiento = movimiento;
          }
        }
        
        return mejorMovimiento;
      }
    }
    
    // Aplicar factor de aleatoriedad según dificultad
    let probabilidadAleatorio = 0;
    switch (this.difficulty) {
      case 'facil':
        probabilidadAleatorio = 0.4; // 40% de movimientos aleatorios
        break;
      case 'normal':
        probabilidadAleatorio = 0.2; // 20% de movimientos aleatorios
        break;
      case 'dificil':
        probabilidadAleatorio = 0.05; // 5% de movimientos aleatorios
        break;
    }
    
    if (Math.random() < probabilidadAleatorio) {
      // Movimiento aleatorio (pero seguro, creo)
      const movimientosSeguros = movimientosLegales.filter(mov => {
        const tableroTemp = JSON.parse(JSON.stringify(tablero));
        tableroTemp[mov.destino.x][mov.destino.y] = tableroTemp[mov.origen.x][mov.origen.y];
        tableroTemp[mov.origen.x][mov.origen.y] = null;
        return !this.estaEnJaque(tableroTemp, 'negro');
      });
      
      if (movimientosSeguros.length > 0) {
        return movimientosSeguros[Math.floor(Math.random() * movimientosSeguros.length)];
      }
    }
    
    // Usar minimax para encontrar el mejor movimiento
    let mejorMovimiento = null;
    let mejorValor = -Infinity;
    
    // Ordenar movimientos: capturas primero
    movimientosLegales.sort((a, b) => {
      if (a.captura && !b.captura) return -1;
      if (!a.captura && b.captura) return 1;
      return 0;
    });
    
    for (const movimiento of movimientosLegales) {
      const tableroTemporal = JSON.parse(JSON.stringify(tablero));
      
      tableroTemporal[movimiento.destino.x][movimiento.destino.y] = 
        tableroTemporal[movimiento.origen.x][movimiento.origen.y];
      tableroTemporal[movimiento.origen.x][movimiento.origen.y] = null;
      
      const valor = this.minimax(tableroTemporal, profundidad - 1, -Infinity, Infinity, false);
      
      if (valor > mejorValor) {
        mejorValor = valor;
        mejorMovimiento = movimiento;
      }
    }
    
    return mejorMovimiento;
  }
}