import { Utils } from "../Helper/Utils";
import { SpinResultTile } from "../MainScene/SlotGame/SpinResult/SpinResultGenerator";

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
   new SpinResultTile(Utils.getRandomId(16), 0, 1.5, 22),
   new SpinResultTile(Utils.getRandomId(16), 1, 3, 20),
   new SpinResultTile(Utils.getRandomId(16), 2, 5, 15),
   new SpinResultTile(Utils.getRandomId(16), 3, 10, 10),
   new SpinResultTile(Utils.getRandomId(16), 4, 20, 8),
   new SpinResultTile(Utils.getRandomId(16), 5, 50, 6),
   // new SpinResultTile(Utils.getRandomId(16), 6, 75, 5),
   // new SpinResultTile(Utils.getRandomId(16), 7, 100, 3),
   // new SpinResultTile(Utils.getRandomId(16), 8, 250, 2),
   new SpinResultTile(Utils.getRandomId(16), 9, 500, 1),
];

export const COUNT_WINNING_LINES = [
   [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
   [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
   [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }],
   [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }],
   [{ r: 0, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 0 }],
];

// author: `Pyro`
