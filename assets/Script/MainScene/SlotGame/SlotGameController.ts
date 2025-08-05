import { GAME_CONFIG } from "../../Config/GameConfig";
import { Utils } from "../../Helper/Utils";
import SlotGameUIController from "./SlotGameUIController";
import SlotGridView from "./SpinResult/SlotGridView";
import SpinResultGenerator, { SpinResult } from "./SpinResult/SpinResultGenerator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameController extends cc.Component {
   public static ins: SlotGameController = null;

   @property(SlotGridView) slotGridView: SlotGridView = null;
   @property(SlotGameUIController) slotGameUICtrl: SlotGameUIController = null;
   @property(cc.RichText) spinResultInfoLb: cc.RichText = null;

   _isSpinBlocked = false;
   _waitTimeBetweenEachSpin = 0.2;

   protected onLoad(): void {
      SlotGameController.ins = this;

      this.spinResultInfoLb.string = ``;

      this.slotGridView.buildCellGrid(GAME_CONFIG.slotGame.gridRow, GAME_CONFIG.slotGame.gridColumn);

      const initGrid = SpinResultGenerator.generateRandomResultGrid(
         GAME_CONFIG.slotGame.gridRow,
         GAME_CONFIG.slotGame.gridColumn);

      this.slotGridView.displayGrid(initGrid);
   }

   public spin(quickMode = false) {
      if (this._isSpinBlocked) return false;
      this._isSpinBlocked = true;

      const spinResult = SpinResultGenerator.generateRandomSpinResult(100);
      const isSpinResultValid = this.validateSpinResult(spinResult);

      if (isSpinResultValid) {
         this.slotGridView.playSpinAnim(spinResult, quickMode).then(() => {
            this.displaySpinResultInfo(spinResult);

            this.scheduleOnce(() => {
               this._isSpinBlocked = false;
            }, this._waitTimeBetweenEachSpin);
         });
         return true;
      } else return false;
   }

   private displaySpinResultInfo(spinResult: SpinResult) {
      if (spinResult.totalWinningPoint > 0) {
         const winAmountString = Utils.formatBalance(spinResult.totalWinningPoint, 2, 4);
         this.spinResultInfoLb.string = `Win <size=65>${winAmountString}</size>`;
      } else {
         this.spinResultInfoLb.string = `Good luck!`;
      }

      this.slotGridView.displayWinningLines(spinResult.winningLines);
   }

   private validateSpinResult(spinResult: SpinResult) {
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