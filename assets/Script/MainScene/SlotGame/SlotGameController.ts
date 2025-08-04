import { GAME_CONFIG } from "../../Config/GameConfig";
import SlotGameUIController from "./SlotGameUIController";
import SpinResult from "./SpinResult/SpinResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGameController extends cc.Component {
   @property(SpinResult) spinResult: SpinResult = null;
   @property(SlotGameUIController) slotGameUICtrl: SlotGameUIController = null;

   protected onLoad(): void {
      this.spinResult.buildCellGrid(GAME_CONFIG.slotGame.gridRow, GAME_CONFIG.slotGame.gridColumn);
   }
}