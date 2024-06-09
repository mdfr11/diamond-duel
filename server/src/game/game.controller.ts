import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { GameService, Game } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  createGame(@Body() createGameDto: { size: number; diamonds: number }): Game {
    return this.gameService.createGame(
      createGameDto.size,
      createGameDto.diamonds,
    );
  }

  @Get(':id')
  getGame(@Param('id') id: string): Game {
    return this.gameService.getGame(id);
  }

  // @Post(':id/open')
  // openCell(
  //   @Param('id') id: string,
  //   @Body() openCellDto: { x: number; y: number },
  // ): Game {
  //   return this.gameService.openCell(id, openCellDto.x, openCellDto.y);
  // }
}
