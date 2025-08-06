import { COUNT_WINNING_LINES, GAME_CONFIG, POSSIBLE_SPIN_RESULT_TILES } from "../../../Config/GameConfig";

export class SpinResult {
   constructor(
      public grid: Array<Array<SpinResultTile>>,
      public winningLines: Array<Array<GridPosition>>,
      public totalWinAmount: number,
      public payoutRate: number,
      public freeSpin: number,
   ) { }
}

export type GridPosition = { r: number; c: number };

export enum TileAttribute {
   NONE = "None",
   FREE_SPIN = "FreeSpin",
   WILD = "Wild",
   SCATTER = "Scatter"
}

export class SpinResultTile {
   constructor(
      public tileID: string,
      public sprFrameIndex: number,
      public pointMultiply: number,
      public spawnChance: number,
      public attribute: TileAttribute = TileAttribute.NONE,
   ) { }
}

export class SpinResultColumn {
   public tiles: SpinResultTile[] = [];
   constructor(initialTiles: SpinResultTile[] = []) { this.tiles = initialTiles; }
}

export default class SpinResultGenerator {
   public static generateRandomSpinResultTile() {
      const totalWeight = POSSIBLE_SPIN_RESULT_TILES.reduce((sum, tile) => sum + tile.spawnChance, 0);
      const rand = Math.random() * totalWeight;

      let cumulative = 0;
      for (const tile of POSSIBLE_SPIN_RESULT_TILES) {
         cumulative += tile.spawnChance;
         if (rand <= cumulative) return tile;
      }

      return POSSIBLE_SPIN_RESULT_TILES[POSSIBLE_SPIN_RESULT_TILES.length - 1];
   }

   private static getWinningLinesFromResultGrid(resultGrid: Array<Array<SpinResultTile>>): Array<Array<GridPosition>> {
      const winningLines = [];

      for (const line of COUNT_WINNING_LINES) {
         const firstTile = resultGrid[line[0].r][line[0].c];
         const isWinning = line.every(pos => resultGrid[pos.r][pos.c].tileID === firstTile.tileID);

         if (isWinning) winningLines.push(line);
      }

      return winningLines;
   }

   public static generateRandomResultGrid(row, column): Array<Array<SpinResultTile>> {
      let resultGrid: Array<Array<SpinResultTile>> = [];

      for (let r = 0; r < row; r++) {
         resultGrid.push([]);
         for (let c = 0; c < column; c++) {
            const tileResult = this.generateRandomSpinResultTile();
            resultGrid[r].push(tileResult);
         }
      }

      return resultGrid;
   }

   public static generateRandomSpinResult(betAmount: number = 0, payoutMultiplier = 1): SpinResult {
      if (betAmount < 0) {
         throw new Error(`[SpinResultGenerator:generateRandomSpinResult] Unexpected behavior: betAmount is a negative number`);
      }

      const gridSize = {
         row: GAME_CONFIG.slotGame.gridRow,
         column: GAME_CONFIG.slotGame.gridColumn,
      }

      let resultGrid = this.generateRandomResultGrid(gridSize.row, gridSize.column);
      const winningLines = this.getWinningLinesFromResultGrid(resultGrid);

      let totalWinAmount = 0;
      let payoutRate = 0;
      let freeSpin = 0;

      for (const line of winningLines) {
         const tile = resultGrid[line[0].r][line[0].c];
         totalWinAmount += tile.pointMultiply * betAmount * payoutMultiplier;
         payoutRate += tile.pointMultiply;
         if (tile.attribute == TileAttribute.FREE_SPIN) freeSpin += line.length;
      }

      payoutRate *= payoutMultiplier;

      return new SpinResult(resultGrid, winningLines, totalWinAmount, payoutRate, freeSpin);
   }
}