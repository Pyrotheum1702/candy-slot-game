const { ccclass, property } = cc._decorator;

@ccclass
export default class EditorDemo extends cc.Component {
   protected onLoad(): void {
      this.node.destroy();
   }
}
