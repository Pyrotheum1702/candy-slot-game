import SlotGameController from "./SlotGameController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameUIController extends cc.Component {
   isBlockingAllActions = false;

   public onClickSpin() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickSpin");
      // this.isBlockingAllActions = true;
      SlotGameController.ins?.spin();
   }

   public onClickHistory() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickHistory");
   }

   public onClickAutoSpin() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickAutoSpin");
   }

   public onClickAdjustSpeed() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickAdjustSpeed");
   }

   public onClickChangeLineCount() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickChangeLineCount");
   }

   public onClickBuyBonus() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickBuyBonus");
   }

   public onClickIncrementBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickIncrementBet");
   }

   public onClickDecrementBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickDecrementBet");
   }

   public onClickMinBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickMinBet");
   }

   public onClickMaxBet() {
      if (this.isBlockingAllActions) return;
      console.log("[SlotGameUIController] onClickMaxBet");
   }
}
