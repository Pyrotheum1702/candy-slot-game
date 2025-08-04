import { COUNT_WINNING_LINES, GAME_CONFIG, POSSIBLE_SPIN_RESULT_TILES } from "../../../Config/GameConfig";

export default class SpinResultGenerator {
   private static getRandomSpinTile() {
      const totalWeight = POSSIBLE_SPIN_RESULT_TILES.reduce((sum, tile) => sum + tile.spawnChance, 0);
      const rand = Math.random() * totalWeight;

      let cumulative = 0;
      for (const tile of POSSIBLE_SPIN_RESULT_TILES) {
         cumulative += tile.spawnChance;
         if (rand <= cumulative) return tile;
      }

      return POSSIBLE_SPIN_RESULT_TILES[POSSIBLE_SPIN_RESULT_TILES.length - 1];
   }

   private static getWinningLinesFromResultGrid(resultGrid: Array<Array<any>>) {
      const winningLines = [];

      for (const line of COUNT_WINNING_LINES) {
         const firstTile = resultGrid[line[0].r][line[0].c];
         const isWinning = line.every(pos => resultGrid[pos.r][pos.c].tileID === firstTile.tileID);

         if (isWinning) winningLines.push(line);
      }

      return winningLines;
   }

   public static generateRandomResultGrid(row, column): Array<Array<any>> {
      let resultGrid = [];

      for (let r = 0; r < row; r++) {
         resultGrid.push([]);
         for (let c = 0; c < column; c++) {
            const tileResult = this.getRandomSpinTile();
            resultGrid[r].push(tileResult);
         }
      }

      return resultGrid;
   }

   public static generateRandomSpinResult(betAmount: number = 0) {
      if (betAmount < 0) {
         throw new Error(`[SpinResultGenerator:generateRandomSpinResult] Unexpected behavior: betAmount is a negative number`);
      }

      const gridSize = {
         row: GAME_CONFIG.slotGame.gridRow,
         column: GAME_CONFIG.slotGame.gridColumn,
      }

      let resultGrid = this.generateRandomResultGrid(gridSize.row, gridSize.column);
      const winningLines = this.getWinningLinesFromResultGrid(resultGrid);

      let totalWinningPoint = 0;

      for (const line of winningLines) {
         const tile = resultGrid[line[0].r][line[0].c];
         totalWinningPoint += tile.pointMultiply * betAmount;
      }

      return {
         row: gridSize.row,
         column: gridSize.column,
         grid: resultGrid,
         winningLines,
         totalWinningPoint,
      }
   }
}


