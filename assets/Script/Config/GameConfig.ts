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
   { sprFrameIndex: 0, pointMultiply: 1, spawnChance: 22 },
   { sprFrameIndex: 1, pointMultiply: 2, spawnChance: 20 },
   { sprFrameIndex: 2, pointMultiply: 5, spawnChance: 15 },
   { sprFrameIndex: 3, pointMultiply: 10, spawnChance: 10 },
   { sprFrameIndex: 4, pointMultiply: 20, spawnChance: 8 },
   { sprFrameIndex: 5, pointMultiply: 50, spawnChance: 6 },
   { sprFrameIndex: 6, pointMultiply: 75, spawnChance: 5 },
   { sprFrameIndex: 7, pointMultiply: 100, spawnChance: 3 },
   { sprFrameIndex: 8, pointMultiply: 250, spawnChance: 2 },
   { sprFrameIndex: 9, pointMultiply: 500, spawnChance: 1 },
];

// author: `Pyro`
