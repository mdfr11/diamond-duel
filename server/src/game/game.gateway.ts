import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: true })
export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, payload: { gameId: string }) {
    try {
      client.join(payload.gameId);
      this.gameService.joinPlayer(payload.gameId, client.id);
      const game = this.gameService.getGame(payload.gameId);
      client.emit('gameUpdate', game);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('openCell')
  handleOpenCell(
    client: Socket,
    payload: { gameId: string; x: number; y: number; playerId: string },
  ) {
    try {
      const game = this.gameService.openCell(
        payload.gameId,
        payload.x,
        payload.y,
        payload.playerId,
      );
      this.server.to(payload.gameId).emit('gameUpdate', game);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // TODO: remove player from game when they disconnect
  @SubscribeMessage('OnGatewayDisconnect')
  handleDisconnect(client: Socket) {}
}
