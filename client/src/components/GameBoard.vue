<template>
  <div>
    <div v-for="(row, rowIndex) in game.board" :key="rowIndex" class="row">
      <div v-for="(cell, cellIndex) in row" :key="cellIndex" @click="openCell(rowIndex, cellIndex)" class="cell">
        <span v-if="cell.isOpen">{{ cell.isDiamond ? '💎' : cell.adjacentDiamonds }}</span>
      </div>
    </div>
    <div class="players">
      <div v-for="(player, index) in game.players" :key="player.id">
        Игрок {{ index + 1 }} ({{ player.id === game.currentPlayer ? 'текущий' : 'ожидание' }}): {{ player.score }}
        очков
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['game'],
  methods: {
    openCell(x, y) {
      this.$emit('open-cell', { x, y });
    }
  }
}
</script>

<style>
.row {
  display: flex;
}

.cell {
  width: 30px;
  height: 30px;
  border: 1px solid #000;
  text-align: center;
  vertical-align: middle;
  line-height: 30px;
}
</style>
