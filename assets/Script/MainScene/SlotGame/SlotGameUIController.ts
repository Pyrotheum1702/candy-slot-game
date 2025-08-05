import SoundPlayer, { SOUNDS } from "../../Helper/Components/SoundPlayer";
import { Utils } from "../../Helper/Utils";
import SlotGameController from "./SlotGameController";
import { SPIN_ANIM_SETTING_PRESET } from "./SpinResult/SlotGridView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameUIController extends cc.Component {
   @property(cc.Node) spinBtnNode: cc.Node = null;
   @property(cc.Node) spinBtnRefreshIcon: cc.Node = null;
   @property(cc.Node) autoSpinBtnIcon: cc.Node = null;
   @property([cc.SpriteFrame]) autoSpinIconSprFrames: cc.SpriteFrame[] = [];

   private _blockedActions = {};
   private _isAutoSpin = false;
   private _isBlockingAllActions = false;
   private _autoSpinRotateDummy: cc.Node = null;

   protected onLoad(): void {
      this.registerSpinBtnEvents();
   }

   private playSpinBtnPressAnim(duration) {
      Utils.mushroomBounceNode(this.spinBtnNode);
      this.spinBtnRefreshIcon.angle = 0;
      cc.Tween.stopAllByTarget(this.spinBtnRefreshIcon);
      cc.tween(this.spinBtnRefreshIcon).to(duration, { angle: -360 }).start();
   }

   private registerSpinBtnEvents() {
      let spinBtnHoldDummy: cc.Node = null;


      this.spinBtnNode.on(cc.Node.EventType.TOUCH_START, () => {
         if (this._blockedActions[`SpinBtnEvents`] == true) return;

         spinBtnHoldDummy = new cc.Node();
         spinBtnHoldDummy.setParent(this.node);
         cc.tween(spinBtnHoldDummy).to(1e10, { y: 1e10 }, {
            easing: 'linear',
            onUpdate: () => {
               const heat = spinBtnHoldDummy.y;
               const doesSpin = SlotGameController.ins?.spin((heat > 1));
               if (doesSpin) this.playSpinBtnPressAnim(SPIN_ANIM_SETTING_PRESET.turbo.columnDuration);
            }
         }).start();
      }, this);

      const onReleaseSpinBtn = () => {
         if (this._isBlockingAllActions) return;
         spinBtnHoldDummy?.destroy();
         const doesSpin = SlotGameController.ins?.spin();
         if (doesSpin) this.playSpinBtnPressAnim(Math.min(1, SPIN_ANIM_SETTING_PRESET.normal.columnDuration));
         SoundPlayer.ins.play(SOUNDS.clickSoft);
      }

      this.spinBtnNode.on(cc.Node.EventType.TOUCH_END, () => {
         if (this._blockedActions[`SpinBtnEvents`] == true) return;
         onReleaseSpinBtn();
      }, this);
      this.spinBtnNode.on(cc.Node.EventType.TOUCH_CANCEL, () => {
         if (this._blockedActions[`SpinBtnEvents`] == true) return;
         onReleaseSpinBtn();
      }, this);
   }

   public onClickHistory() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickHistory");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickAutoSpin() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickAutoSpin");

      if (this._blockedActions[`ClickAutoSpin`] == true) return;
      this._blockedActions[`ClickAutoSpin`] = true;
      this._blockedActions[`SpinBtnEvents`] = true;

      if (!this._isAutoSpin) {
         cc.tween(this.autoSpinBtnIcon).to(0.33, { angle: -360 }).call(() => {
            const spr = this.autoSpinBtnIcon.getComponent(cc.Sprite);
            this.autoSpinBtnIcon.angle = 0;
            spr.spriteFrame = this.autoSpinIconSprFrames[1];
            this.autoSpinBtnIcon.setContentSize(70, 70);

            this._autoSpinRotateDummy = new cc.Node();
            this._autoSpinRotateDummy.setParent(this.node);
            this._autoSpinRotateDummy.angle = 0;

            delete this._blockedActions[`ClickAutoSpin`];
            this._isAutoSpin = true;

            cc.tween(this._autoSpinRotateDummy).to(1e10, { angle: 1e10 }, {
               easing: 'linear',
               onUpdate: () => {
                  this.autoSpinBtnIcon.angle = -(this._autoSpinRotateDummy.angle * 360);

                  const doesSpin = SlotGameController.ins?.spin();
                  if (doesSpin) this.playSpinBtnPressAnim(SlotGameController.ins.spinAnimSetting.columnDuration);
               }
            }).start();
         }).start();
      } else {
         const spr = this.autoSpinBtnIcon.getComponent(cc.Sprite);
         this.autoSpinBtnIcon.angle = 0;
         spr.spriteFrame = this.autoSpinIconSprFrames[0];
         this._autoSpinRotateDummy?.destroy();

         delete this._blockedActions[`ClickAutoSpin`];
         delete this._blockedActions[`SpinBtnEvents`];
         this._isAutoSpin = false;
      }

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickAdjustSpeed() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickAdjustSpeed");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickChangeLineCount() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickChangeLineCount");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickBuyBonus() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickBuyBonus");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickIncrementBet() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickIncrementBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickDecrementBet() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickDecrementBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickMinBet() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickMinBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickMaxBet() {
      if (this._isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickMaxBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }
}
