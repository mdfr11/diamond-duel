import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Cell {
  isDiamond: boolean;
  isOpen: boolean;
  adjacentDiamonds: number;
}

export interface Game {
  id: string;
  board: Cell[][];
  size: number;
  diamonds: number;
  currentPlayer: string;
  players: Player[];
  // TODO: add createdAt for TTL
}

export interface Player {
  id: string;
  score: number;
}

@Injectable()
export class GameService {
  private games: Record<string, Game> = {};

  createGame(size: number, diamonds: number): Game {
    const board: Cell[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({
        isDiamond: false,
        isOpen: false,
        adjacentDiamonds: 0,
      })),
    );

    let placedDiamonds = 0;
    while (placedDiamonds < diamonds) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (!board[x][y].isDiamond) {
        board[x][y].isDiamond = true;
        placedDiamonds++;
      }
    }

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (!board[x][y].isDiamond) {
          let count = 0;
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (
                x + dx >= 0 &&
                x + dx < size &&
                y + dy >= 0 &&
                y + dy < size &&
                board[x + dx][y + dy].isDiamond
              ) {
                count++;
              }
            }
          }
          board[x][y].adjacentDiamonds = count;
        }
      }
    }

    const game: Game = {
      id: uuidv4(),
      board,
      size,
      diamonds,
      currentPlayer: '',
      players: [],
    };
    this.games[game.id] = game;
    return game;
  }

  joinPlayer(gameId: string, playerId: string): Game {
    this.getGame(gameId);

    if (this.games[gameId].players.length >= 2) {
      throw new Error('Game is full');
    }

    const player = { id: playerId, score: 0 };
    this.games[gameId].players.push(player);

    if (this.games[gameId].players.length === 1) {
      this.games[gameId].currentPlayer = player.id;
    }

    return this.games[gameId];
  }

  getGame(gameId: string): Game {
    const game = this.games[gameId];

    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  openCell(gameId: string, x: number, y: number, playerId: string): Game {
    const game = this.getGame(gameId);

    if (this.games[gameId].players.length === 1) {
      throw new Error('Need 2 players to start');
    }

    if (game.currentPlayer !== playerId) {
      throw new Error('Not your turn');
    }

    // TODO: send event if all cells is already open

    const cell = game.board[x][y];
    if (!cell.isOpen) {
      cell.isOpen = true;

      const currentPlayer = game.players.find(
        (player) => player.id === game.currentPlayer,
      );
      const anotherPlayer = game.players.find(
        (player) => player.id !== game.currentPlayer,
      );

      if (cell.isDiamond) {
        currentPlayer.score++;
      } else {
        game.currentPlayer = anotherPlayer.id;
      }
    }
    return game;
  }
}
