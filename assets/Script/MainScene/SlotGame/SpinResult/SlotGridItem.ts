const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGridItem extends cc.Component {
   @property(cc.Sprite) spr: cc.Sprite = null;

   public isOutOfBounds() {
      let outOfBounds = false;
      if (this.node.y < -(this.node.parent.height / 2 + this.node.height / 2 + 100))
         outOfBounds = true;
      return outOfBounds;
   }
}
