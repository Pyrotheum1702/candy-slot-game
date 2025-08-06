import { Utils } from "../Helper/Utils";
import { SpinResultTile, TileAttribute } from "../MainScene/SlotGame/SpinResult/SpinResultGenerator";

export class SpinAnimSetting {
   constructor(
      public offsetDummyCount: number,
      public columnDuration: number,
      public columnTurnOffsetTime: number
   ) { }
}

export const GAME_CONFIG = {
   gameName: `SlotCandy`,
   newPlayerInitBalance: 1_000_000,
   playerBalanceCap: 1_000_000_000,
   freeSpinWinMultiplier: 3,
   slotGame: {
      gridRow: 3,
      gridColumn: 3,
      gridRowCap: 3,
      gridColumnCap: 3,
   }
}

export const POSSIBLE_SPIN_RESULT_TILES = [
   // new SpinResultTile(Utils.getRandomId(16), 0, 1.5, 22),
   new SpinResultTile(Utils.getRandomId(16), 1, 0.5, 20),
   new SpinResultTile(Utils.getRandomId(16), 2, 1.5, 15),
   new SpinResultTile(Utils.getRandomId(16), 3, 3, 10),
   new SpinResultTile(Utils.getRandomId(16), 4, 10, 8),
   new SpinResultTile(Utils.getRandomId(16), 5, 50, 3),
   // new SpinResultTile(Utils.getRandomId(16), 6, 75, 5),
   // new SpinResultTile(Utils.getRandomId(16), 7, 100, 3),
   // new SpinResultTile(Utils.getRandomId(16), 8, 250, 2),
   // new SpinResultTile(Utils.getRandomId(16), 9, 500, 1, TileAttribute.WILD),
   new SpinResultTile(Utils.getRandomId(16), 10, 1, 13, TileAttribute.FREE_SPIN),
];

export const COUNT_WINNING_LINES = [
   [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
   [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
   [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }],
   [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }],
   [{ r: 0, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 0 }],
];

export const SPIN_ANIM_SETTING_PRESET = {
   normal: new SpinAnimSetting(3, 0.5, 0.275),
   fast: new SpinAnimSetting(0, 0.25, 0.15),
   turbo: new SpinAnimSetting(0, 0.25, 0),
};

export const BET_AMOUNT_PRESET = [0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100];

// author: `Pyro`
