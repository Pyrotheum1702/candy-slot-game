import { GAME_CONFIG } from "../../Config/GameConfig";
import SlotGameUIController from "./SlotGameUIController";
import SlotGridView from "./SpinResult/SlotGridView";
import SpinResultGenerator from "./SpinResult/SpinResultGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameController extends cc.Component {
   public static ins: SlotGameController = null;

   @property(SlotGridView) slotGridView: SlotGridView = null;
   @property(SlotGameUIController) slotGameUICtrl: SlotGameUIController = null;

   protected onLoad(): void {
      SlotGameController.ins = this;
      this.slotGridView.buildCellGrid(GAME_CONFIG.slotGame.gridRow, GAME_CONFIG.slotGame.gridColumn);

      const initGrid = SpinResultGenerator.generateRandomResultGrid(
         GAME_CONFIG.slotGame.gridRow,
         GAME_CONFIG.slotGame.gridColumn);

      this.slotGridView.displayGrid(initGrid);
   }

   public async spin() {
      const spinResult = SpinResultGenerator.generateRandomSpinResult(10);
      const isSpinResultValid = this.validateSpinResult(spinResult);

      if (isSpinResultValid) {
         this.slotGridView.playSpinAnimation(spinResult);
         this.slotGridView.displayGrid(spinResult.grid);
      }
   }

   private validateSpinResult(spinResult) {
      if (spinResult?.grid == null) return false;

      const expectedRow = GAME_CONFIG.slotGame.gridRow;
      const expectedColumn = GAME_CONFIG.slotGame.gridColumn;

      let isValid = true;

      if (!Array.isArray(spinResult.grid) ||
         spinResult.grid.length !== expectedRow ||
         !spinResult.grid.every(row => Array.isArray(row) && row.length === expectedColumn)
      ) {
         console.error("[SlotGameController:validateSpinResult] Grid size is invalid.");
         isValid = false;
      }

      for (const line of spinResult.winningLines) {
         const lineValid = Array.isArray(line) && line.every(pos =>
            pos &&
            typeof pos.r === "number" &&
            typeof pos.c === "number" &&
            pos.r >= 0 && pos.r < expectedRow &&
            pos.c >= 0 && pos.c < expectedColumn
         );

         if (!lineValid) {
            console.error("[SlotGameController:validateSpinResult] Found invalid position in winningLines:", line);
            isValid = false;
         }
      }

      return isValid;
   }

   protected onDestroy(): void { SlotGameController.ins = null; }
}