import { Utils } from "../Helper/Utils";

export const GAME_CONFIG = {
   gameName: `SlotCandy`,
   newPlayerInitBalance: 1000,
   playerBalanceCap: 1_000_000_000,
   slotGame: {
      gridRow: 3,
      gridColumn: 3,
      gridRowCap: 5,
      gridColumnCap: 5,
   }
}

export const POSSIBLE_SPIN_RESULT_TILES = [
   { tileID: Utils.getRandomId(16), sprFrameIndex: 0, pointMultiply: 1.5, spawnChance: 22 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 1, pointMultiply: 3, spawnChance: 20 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 2, pointMultiply: 5, spawnChance: 15 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 3, pointMultiply: 10, spawnChance: 10 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 4, pointMultiply: 20, spawnChance: 8 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 5, pointMultiply: 50, spawnChance: 6 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 6, pointMultiply: 75, spawnChance: 5 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 7, pointMultiply: 100, spawnChance: 3 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 8, pointMultiply: 250, spawnChance: 2 },
   { tileID: Utils.getRandomId(16), sprFrameIndex: 9, pointMultiply: 500, spawnChance: 1 },
];

export const COUNT_WINNING_LINES = [
   [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
   [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
   [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }],
   [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }],
   [{ r: 0, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 0 }],
];

// author: `Pyro`
