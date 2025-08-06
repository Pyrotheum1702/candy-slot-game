const { ccclass, property } = cc._decorator;

@ccclass
export default class AssetContainer extends cc.Component {
   @property(cc.Prefab) notificationDialogPref: cc.Prefab = null;

   public static ins: AssetContainer = null;
   protected onLoad() {
      if (AssetContainer.ins) {
         this.node.destroy();
         return;
      }

      AssetContainer.ins = this;
      cc.game.addPersistRootNode(this.node)
   }
}
