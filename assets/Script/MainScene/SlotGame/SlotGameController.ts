import { GAME_CONFIG } from "../../Config/GameConfig";
import SoundPlayer, { SOUNDS } from "../../Helper/Components/SoundPlayer";
import { Utils } from "../../Helper/Utils";
import { callNotificationDialog } from "../../Notification/NotificationDialog";
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

enum SpinBlockReason {
   spinProcess = `spinProcess`,
   freeSpinNotify = `freeSpinNotify`,
   freeSpinLootNotify = `freeSpinLootNotify`,
}

@ccclass
export default class SlotGameController extends cc.Component {
   public static ins: SlotGameController = null;

   @property(SlotGridView) slotGridView: SlotGridView = null;
   @property(SlotGameUIController) slotGameUICtrl: SlotGameUIController = null;
   @property(cc.Label) playerNameLb: cc.Label = null;
   @property(cc.Label) freeSpinCountLb: cc.Label = null;
   @property(cc.Label) playerBalanceLb: cc.Label = null;
   @property(cc.RichText) spinResultInfoLb: cc.RichText = null;

   private _betAmount = 0;
   private _freeSpinLeft = 0;
   private _payoutMultiplier = 1;
   private _currentBetIndex = 0;
   private _defaultBetIndex = 4;
   private _waitTimeBetweenEachSpin = 0.2;
   private _shownHoldSpinTip = false;
   private _spinBlockers: Object = {};
   private _freeSpinTurnData = {
      freeSpinStreak: 0,
      winAmount: 0,
   };

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
      if (this.isSpinBlocked()) return false;
      this.blockSpin(SpinBlockReason.spinProcess);

      const isSpinAffordable = this.checkSpinAffordable();
      if (!isSpinAffordable) return false;

      let winMultiplier = 1;

      if (this._freeSpinLeft > 0) {
         winMultiplier = GAME_CONFIG.freeSpinWinMultiplier;
      }

      const betAmount = this._betAmount;
      const balanceUpdateAmount = -betAmount;
      const spinResult = SpinResultGenerator.generateRandomSpinResult(betAmount, winMultiplier);
      const isSpinResultValid = this.validateSpinResult(spinResult);

      if (CC_DEV) console.log(`[SlotGameController:spin]`, { spinResult });

      if (isSpinResultValid) {
         let onProcessSpinResultComplete = null;
         const freeSpinLeft = this._freeSpinLeft;

         if (freeSpinLeft <= 0) {
            this.updatePlayerBalance(balanceUpdateAmount);
         } else {
            this._freeSpinTurnData.winAmount += spinResult.totalWinAmount;
            this._freeSpinTurnData.freeSpinStreak++;

            this._freeSpinLeft--;
            console.log(`_freeSpinLeft`, this._freeSpinLeft);

            if (this._freeSpinLeft == 0) {
               onProcessSpinResultComplete = () => {
                  this.blockSpin(SpinBlockReason.freeSpinLootNotify);

                  const freeSpinTurnWinAmount = Utils.formatBalance(this._freeSpinTurnData.winAmount, 2, 4);

                  let dialogMessage = `From ${this._freeSpinTurnData.freeSpinStreak} Free Spins\nYou won ${freeSpinTurnWinAmount}!`;
                  if (this._freeSpinTurnData.winAmount <= 0) {
                     dialogMessage = `From ${this._freeSpinTurnData.freeSpinStreak} Free Spins\nYou didn't win anything\nGood luck next time!`;
                  }

                  callNotificationDialog(
                     dialogMessage, 5)
                     .onDismiss = () => {
                        this.unblockSpin(SpinBlockReason.freeSpinLootNotify);
                     }

                  this._freeSpinTurnData.winAmount = 0;
                  this._freeSpinTurnData.freeSpinStreak = 0;
               }
            } else {
               this.spinResultInfoLb.string = `You have ${this._freeSpinLeft} Free Spins left!`;
            }
         }

         this.processSpinResult(spinResult, isQuickMode).then(() => {
            onProcessSpinResultComplete?.();

            this.scheduleOnce(() => {
               this.unblockSpin(SpinBlockReason.spinProcess);
            }, this._waitTimeBetweenEachSpin);

            if (freeSpinLeft - 1 == 0) {
               this.scheduleOnce(() => { this.slotGridView.clearDisplayingWinningLines(); }, 0.25);
            }

            if (CC_DEV) console.log(`[SlotGameController:spin:processSpinResult] complete`);
         });
         return true;
      } else {
         if (CC_DEV) console.error(`[SlotGameController:spin] Unexpected: isSpinResultValid == false`);
         return false;
      }
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

   private unblockSpin(reason: SpinBlockReason) {
      if (CC_DEV) console.log(`[unBlockSpin] reason: ${reason}`);
      delete this._spinBlockers[reason];
   }

   private blockSpin(reason: SpinBlockReason) {
      if (CC_DEV) console.log(`[blockSpin] reason: ${reason}`);
      this._spinBlockers[reason] = true;
   }

   private isSpinBlocked(): boolean {
      // if (CC_DEV) console.log(`[isSpinBlocked] reason:`, this._spinBlockers);
      return !(Object.keys(this._spinBlockers).length === 0);
   }

   private async processSpinResult(spinResult: SpinResult, isQuickMode): Promise<null> {
      return new Promise(resolve => {
         const winAmount = spinResult.totalWinAmount;
         const freeSpinAmount = spinResult.freeSpin;

         if (freeSpinAmount > 0) {
            this._freeSpinLeft += freeSpinAmount;
            this.blockSpin(SpinBlockReason.freeSpinNotify);
         }

         this.slotGridView.playSpinAnim(spinResult, isQuickMode).then(() => {
            if (winAmount > 0) {
               const balanceUpdateAmount = winAmount;
               this.updatePlayerBalance(balanceUpdateAmount);
            }

            this.displaySpinResultInfo(spinResult).then(() => {
               resolve(null);
               if (CC_DEV) console.log(`[SlotGameController:displaySpinResultInfo] complete`);
            });
         });
      })
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

   private displaySpinResultInfo(spinResult: SpinResult): Promise<null> {
      return new Promise(resolve => {
         if (spinResult.totalWinAmount > 0) {
            const winAmountString = Utils.formatBalance(spinResult.totalWinAmount, 2, 4);
            this.spinResultInfoLb.string = `Win <size=65>${winAmountString}</size> - x${spinResult.payoutRate}`;

            SoundPlayer.ins.play(SOUNDS.win);
            this._shownHoldSpinTip = false;

            if (spinResult.freeSpin > 0) {
               this.spinResultInfoLb.string = `Win <size=65>${winAmountString}</size> and <size=65>${spinResult.freeSpin}</size> Free Spins!`;

               let dialog = callNotificationDialog(
                  `You won ${spinResult.freeSpin} Free Spins\nwith x${GAME_CONFIG.freeSpinWinMultiplier} Multiplier!`, 3);

               dialog.onDismiss = () => {
                  this.unblockSpin(SpinBlockReason.freeSpinNotify);
                  resolve(null);
               }

               this.scheduleOnce(() => { this.slotGridView.clearDisplayingWinningLines(); }, 0.25);
            } else resolve(null);
         } else {
            if (this.spinResultInfoLb.string == `Good luck!` && !this._shownHoldSpinTip && !this.slotGameUICtrl.isOnContinuousSpinning) {
               this.spinResultInfoLb.string = `Hold for quick spin!`;
               this._shownHoldSpinTip = true;
            } else this.spinResultInfoLb.string = `Good luck!`;
            resolve(null);
         }

         this.slotGridView.displayWinningLines(spinResult.winningLines);
      })
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