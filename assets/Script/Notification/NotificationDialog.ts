import { Utils } from "../Helper/Utils";
import AssetContainer from "../Persistent/AssetContainer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NotificationDialog extends cc.Component {
   @property(cc.Node) bg: cc.Node = null;
   @property(cc.Label) textLb: cc.Label = null;

   private _dismissed = false;
   public onDismiss = null;

   protected onLoad(): void {
      this.bg.on(cc.Node.EventType.TOUCH_START, this.dismiss, this);
   }

   public dismiss() {
      if (this._dismissed) return;
      this._dismissed = true;
      this.onDismiss?.();
      Utils.fadeOutNode(this.node, 0.25, null, true);
   }

   public dismissAfterSeconds(time) {
      this.scheduleOnce(() => {
         this.dismiss();
      }, time);
   }
}

export function callNotificationDialog(text, autoDismissTime = 0): NotificationDialog {
   const pref = AssetContainer.ins.notificationDialogPref;
   if (!pref) {
      console.error(`[callNotificationDialog] prefab is not assigned.`);
      return null;
   }

   let dialog = cc.instantiate(pref);
   dialog.setParent(cc.Canvas.instance.node);
   dialog.setPosition(0, 0);
   Utils.fadeInNode(dialog);

   let script = dialog.getComponent(NotificationDialog);

   script.textLb.string = text;
   if (autoDismissTime > 0) script.dismissAfterSeconds(autoDismissTime);

   return script;
}