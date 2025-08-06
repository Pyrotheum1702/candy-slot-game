import { GAME_CONFIG } from "../../Config/GameConfig";
import SoundPlayer, { SOUNDS } from "../../Helper/Components/SoundPlayer";
import { Utils } from "../../Helper/Utils";
import Player from "../../Player/Player";
import SlotGameUIController from "./SlotGameUIController";
import SlotGridView from "./SpinResult/SlotGridView";
import SpinResultGenerator, { SpinResult } from "./SpinResult/SpinResultGenerator";

const { ccclass, property } = cc._decorator;

export class SpinAnimSetting {
   constructor(
      public offsetDummyCount: number,
      public columnDuration: number,
      public columnTurnOffsetTime: number
   ) { }
}

export const SPIN_ANIM_SETTING_PRESET = {
   normal: new SpinAnimSetting(3, 0.5, 0.275),
   fast: new SpinAnimSetting(0, 0.25, 0.15),
   turbo: new SpinAnimSetting(0, 0.25, 0),
};

export const BET_AMOUNT_PRESET = [0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100];

@ccclass
export default class SlotGameController extends cc.Component {
   public static ins: SlotGameController = null;

   @property(SlotGridView) slotGridView: SlotGridView = null;
   @property(SlotGameUIController) slotGameUICtrl: SlotGameUIController = null;
   @property(cc.Label) playerNameLb: cc.Label = null;
   @property(cc.Label) playerBalanceLb: cc.Label = null;
   @property(cc.RichText) spinResultInfoLb: cc.RichText = null;

   private _betAmount = 0;
   private _freeSpinLeft = 0;
   private _currentBetIndex = 0;
   private _defaultBetIndex = 4;
   private _waitTimeBetweenEachSpin = 0.2;
   private _isSpinBlocked = false;
   private _shownHoldSpinTip = false;

   public spinAnimSetting: SpinAnimSetting = SPIN_ANIM_SETTING_PRESET.normal;

   protected onLoad(): void {
      SlotGameController.ins = this;

      this.spinResultInfoLb.string = ``;

      this.slotGridView.buildCellGrid(GAME_CONFIG.slotGame.gridRow, GAME_CONFIG.slotGame.gridColumn);
      this.updatePlayerInfo();

      const initGrid = SpinResultGenerator.generateRandomResultGrid(
         GAME_CONFIG.slotGame.gridRow,
         GAME_CONFIG.slotGame.gridColumn);

      this.slotGridView.displayGrid(initGrid);
   }

   public spin(isQuickMode = false) {
      if (this._isSpinBlocked) return false;
      this._isSpinBlocked = true;

      const isSpinAffordable = this.checkSpinAffordable();
      if (!isSpinAffordable) return false;

      const betAmount = this._betAmount;
      const balanceUpdateAmount = -betAmount;
      const spinResult = SpinResultGenerator.generateRandomSpinResult(betAmount);
      const isSpinResultValid = this.validateSpinResult(spinResult);

      if (CC_DEV) console.log(`[SlotGameController:spin]`, { spinResult });

      if (isSpinResultValid) {
         this.updatePlayerBalance(balanceUpdateAmount);
         this.processSpinResult(spinResult, isQuickMode);
         return true;
      } else return false;
   }

   public setDefaultBetAmount(): number {
      this._currentBetIndex = this._defaultBetIndex;
      return this.updateBetAmount();
   }

   public incrementBetAmount(): number {
      if (this._currentBetIndex < BET_AMOUNT_PRESET.length - 1) this._currentBetIndex++;
      return this.updateBetAmount();
   }

   public decrementBetAmount(): number {
      if (this._currentBetIndex > 0) this._currentBetIndex--;
      return this.updateBetAmount();
   }

   public setMinBetAmount(): number {
      this._currentBetIndex = 0;
      return this.updateBetAmount();
   }

   public setMaxBetAmount(): number {
      this._currentBetIndex = BET_AMOUNT_PRESET.length - 1;
      return this.updateBetAmount();
   }

   public switchSpinAnimSetting(): number {
      const presets = [SPIN_ANIM_SETTING_PRESET.normal, SPIN_ANIM_SETTING_PRESET.fast, SPIN_ANIM_SETTING_PRESET.turbo];
      const currentIndex = presets.indexOf(this.spinAnimSetting);
      const nextIndex = (currentIndex + 1) % presets.length;

      this.spinAnimSetting = presets[nextIndex];
      return nextIndex;
   }

   private processSpinResult(spinResult: SpinResult, isQuickMode) {
      const winAmount = spinResult.totalWinningPoint;

      this.slotGridView.playSpinAnim(spinResult, isQuickMode).then(() => {
         if (winAmount > 0) {
            const balanceUpdateAmount = winAmount;
            this.updatePlayerBalance(balanceUpdateAmount);
         }

         this.displaySpinResultInfo(spinResult);

         this.scheduleOnce(() => {
            this._isSpinBlocked = false;
         }, this._waitTimeBetweenEachSpin);
      });
   }

   private updateBetAmount() {
      this._betAmount = BET_AMOUNT_PRESET[this._currentBetIndex];
      return this._betAmount;
   }

   private checkSpinAffordable() {
      const balance = Player.getBalance();
      return (balance - this._betAmount > 0);
   }

   private updatePlayerInfo() {
      this.playerNameLb.string = Player.getName();
      this.playerBalanceLb.string = Utils.formatBalance(Player.getBalance(), 2, 2) + ` TKN`;
   }

   private updatePlayerBalance(updateAmount: number) {
      let balance = Player.getBalance();
      balance = Math.max(0, balance + updateAmount);
      Player.setBalance(balance);
      this.updatePlayerInfo();
   }

   private displaySpinResultInfo(spinResult: SpinResult) {
      if (spinResult.totalWinningPoint > 0) {
         const winAmountString = Utils.formatBalance(spinResult.totalWinningPoint, 2, 4);
         this.spinResultInfoLb.string = `Win <size=65>${winAmountString}</size> - x${spinResult.payoutRate}`;

         if (spinResult.freeSpin > 0) {
            this.spinResultInfoLb.string = `Win <size=65>${spinResult.freeSpin}</size> Free Spin!`;
         }

         SoundPlayer.ins.play(SOUNDS.win);
         this._shownHoldSpinTip = false;
      } else {
         if (this.spinResultInfoLb.string == `Good luck!` && !this._shownHoldSpinTip && !this.slotGameUICtrl.isOnContinuousSpinning) {
            this.spinResultInfoLb.string = `Hold for quick spin!`;
            this._shownHoldSpinTip = true;
         } else this.spinResultInfoLb.string = `Good luck!`;
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