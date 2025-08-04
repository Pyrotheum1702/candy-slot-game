const { ccclass, property } = cc._decorator;

@ccclass
export default class SlotGridItem extends cc.Component {
   @property(cc.Sprite) spr: cc.Sprite = null;
}
