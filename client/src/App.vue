<template>
  <div id="app">
    <form @submit.prevent="createGame">
      <label for="size">Размер поля:</label>
      <input v-model.number="size" type="number" id="size" name="size" min="2" max="6" required />

      <label for="diamonds">Количество алмазов:</label>
      <input v-model.number="diamonds" type="number" id="diamonds" name="diamonds" :max="size * size" required />

      <button type="submit">Создать игру</button>
    </form>

    <form @submit.prevent="joinGame">
      <label for="gameId">ID игры:</label>
      <input v-model="gameId" type="text" id="gameId" name="gameId" required />
      <button type="submit">Подключиться к игре</button>
    </form>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <GameBoard v-if="game" :game="game" @open-cell="handleOpenCell" />
  </div>
</template>

<script>
import io from 'socket.io-client';
import GameBoard from './components/GameBoard.vue';

export default {
  name: 'App',
  components: {
    GameBoard,
  },
  data() {
    return {
      socket: null,
      game: null,
      size: 6,
      diamonds: 3,
      gameId: '',
      errorMessage: '',
    };
  },
  created() {
    this.socket = io('http://localhost:3000');
    this.socket.on('gameUpdate', (game) => {
      this.game = game;
    });
    this.socket.on('error', (error) => {
      this.errorMessage = error.message;
    });
  },
  methods: {
    createGame() {
      fetch('http://localhost:3000/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ size: this.size, diamonds: this.diamonds }),
      })
        .then((response) => response.json())
        .then((game) => {
          this.gameId = game.id;
          this.socket.emit('joinGame', { gameId: game.id });
        });
    },
    joinGame() {
      this.socket.emit('joinGame', { gameId: this.gameId });
    },
    handleOpenCell({ x, y }) {
      this.socket.emit('openCell', { gameId: this.game.id, x, y, playerId: this.socket.id });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

form {
  margin-bottom: 20px;
}
</style>
