// services/games.js
export const gamesService = {
  getSinglePlayerGames: () => {
    return [
      {
        id: 1,
        title: 'BuscaMinas',
        route: '/juegos/busca-minas',
        imageSrc: '/src/assets/images/games/solitario/buscaminas.png'
      },
      {
        id: 2,
        title: 'Tetris',
        route: '/juegos/tetris',
        imageSrc: '/src/assets/images/games/solitario/tetris.png'
      },
      {
        id: 3,
        title: 'Ahorcado',
        route: '/juegos/ahorcado',
        imageSrc: '/src/assets/images/games/solitario/ahorcado.png'
      },
      {
        id: 4,
        title: 'Wordle',
        route: '/juegos/wordle',
        imageSrc: '/src/assets/images/games/solitario/Wordle.png'
      },
      {
        id: 8,
        title: 'Puzzle',
        route: '/juegos/puzzle',
        imageSrc: '/src/assets/images/games/solitario/puzzle.png'
      },
      // Añadir más juegos
    ];
  },
  
  getMultiPlayerGames: () => {
    return [
      {
        id: 6,
        title: 'Tres En Raya',
        route: '/juegos/tres-en-raya',
        imageSrc: '/src/assets/images/games/multijugador/tictactoe.png'
      },
      {
        id: 7,
        title: 'Ajedrez',
        route: '/juegos/ajedrez',
        imageSrc: '/src/assets/images/games/multijugador/ajedrez.png'
      },
    ];
  },
  
  searchGames: (query) => {

    const allGames = [
      ...gamesService.getSinglePlayerGames(),
      ...gamesService.getMultiPlayerGames()
    ];
    
    if (!query) return allGames;
    
    return allGames.filter(game => 
      game.title.toLowerCase().includes(query.toLowerCase())
    );
  }
};