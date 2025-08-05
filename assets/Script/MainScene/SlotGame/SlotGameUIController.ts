import SoundPlayer, { SOUNDS } from "../../Helper/Components/SoundPlayer";
import { Utils } from "../../Helper/Utils";
import SlotGameController from "./SlotGameController";
import { SPIN_ANIM_SETTING_PRESET } from "./SpinResult/SlotGridView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameUIController extends cc.Component {
   @property(cc.Node) spinBtnNode: cc.Node = null;
   @property(cc.Node) spinBtnRefreshIcon: cc.Node = null;

   isBlockingAllActions = false;

   protected onLoad(): void {
      this.registerSpinBtnEvents();
   }

   private registerSpinBtnEvents() {
      let spinBtnHoldDummy: cc.Node = null;

      const playSpinBtnPressAnim = (duration) => {
         Utils.mushroomBounceNode(this.spinBtnNode);
         this.spinBtnRefreshIcon.angle = 0;
         cc.Tween.stopAllByTarget(this.spinBtnRefreshIcon);
         cc.tween(this.spinBtnRefreshIcon).to(duration, { angle: -360 }).start();
      }

      this.spinBtnNode.on(cc.Node.EventType.TOUCH_START, () => {
         spinBtnHoldDummy = new cc.Node();
         spinBtnHoldDummy.setParent(this.node);
         cc.tween(spinBtnHoldDummy).to(1e10, { y: 1e10 }, {
            easing: 'linear',
            onUpdate: () => {
               const heat = spinBtnHoldDummy.y;
               const doesSpin = SlotGameController.ins?.spin((heat > 1));
               if (doesSpin) playSpinBtnPressAnim(SPIN_ANIM_SETTING_PRESET.turbo.columnDuration);
            }
         }).start();
      }, this);

      const onReleaseSpinBtn = () => {
         if (this.isBlockingAllActions) return;
         spinBtnHoldDummy?.destroy();
         const doesSpin = SlotGameController.ins?.spin();
         if (doesSpin) playSpinBtnPressAnim(Math.min(1, SPIN_ANIM_SETTING_PRESET.normal.columnDuration));
         SoundPlayer.ins.play(SOUNDS.clickSoft);
      }

      this.spinBtnNode.on(cc.Node.EventType.TOUCH_END, () => {
         onReleaseSpinBtn();
      }, this);
      this.spinBtnNode.on(cc.Node.EventType.TOUCH_CANCEL, () => {
         onReleaseSpinBtn();
      }, this);
   }

   public onClickHistory() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickHistory");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickAutoSpin() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickAutoSpin");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickAdjustSpeed() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickAdjustSpeed");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickChangeLineCount() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickChangeLineCount");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickBuyBonus() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickBuyBonus");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickIncrementBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickIncrementBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickDecrementBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickDecrementBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickMinBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickMinBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }

   public onClickMaxBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickMaxBet");

      SoundPlayer.ins.play(SOUNDS.click);
   }
}
