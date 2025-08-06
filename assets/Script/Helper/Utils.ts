export class Utils {
   static getRandomId(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   }

   static formatBalance(value: number, minFracDigit = 0, maxFracDigit = 4): string {
      return value.toLocaleString("en-US", {
         minimumFractionDigits: minFracDigit,
         maximumFractionDigits: maxFracDigit
      });
   }

   public static mushroomBounceNode(node: cc.Node, duration: number = 0.25, callBack = null, amp = 0.1) {
      cc.Tween.stopAllByTarget(node);
      const startScale = node.scale;
      node.scale = startScale - (startScale * amp);
      cc.tween(node).to(duration, { scale: startScale }, { easing: 'backOut' }).start();
   }

   public static worldSpaceToLocal(worldSpace: cc.Vec2, local: cc.Node) {
      return local.convertToNodeSpaceAR(worldSpace)
   }

   public static getWorldPos(node: cc.Node): cc.Vec2 {
      return node.convertToWorldSpaceAR(cc.Vec2.ZERO_R)
   }

   public static fadeInNode(node: cc.Node, duration: number = 0.25, callBack = null, up = true) {
      node.active = true
      node.opacity = 0
      let blockInput = new cc.Node()
      blockInput.setContentSize(10000, 10000)
      blockInput.addComponent(cc.BlockInputEvents)
      blockInput.parent = node
      blockInput.setSiblingIndex(cc.macro.MAX_ZINDEX)

      cc.tween(node).to(duration, { opacity: 255 }, { easing: 'sineOut' }).call(() => { if (callBack) callBack(); blockInput.destroy() }).start()
   }

   public static fadeOutNode(node: cc.Node, duration: number = 0.25, callBack = null, destroyOnCollapsed = false) {
      if (!node) return
      let target = node
      cc.tween(target).to(duration, { opacity: 0 }, { easing: 'sineIn' }).call(() => { if (callBack) callBack() }).call(() => { node.active = false; }).call(() => { if (destroyOnCollapsed) target.destroy() }).start()
   }
}