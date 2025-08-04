const { ccclass, property } = cc._decorator;

enum FitAxis {
   VERTICAL = `VERTICAL`,
   HORIZONTAL = `HORIZONTAL`
}

const TARGET_LAYOUT_AXIS: FitAxis = FitAxis.VERTICAL;

@ccclass
export default class CanvasFitAdapter extends cc.Component {
   protected onLoad(): void {
      const canvas = this.getComponent(cc.Canvas);
      if (!cc.isValid(canvas)) {
         console.error(`${this.node.name} - [CanvasFitAdapter]: Canvas component not found in the same node.`);
         return;
      }

      let designResolution = canvas.designResolution;
      let designAspectRatio = designResolution.width / designResolution.height;
      let viewportSize = cc.view.getViewportRect();
      let screenAspectRatio = viewportSize.width / viewportSize.height;

      switch (TARGET_LAYOUT_AXIS) {
         case FitAxis.VERTICAL: {
            if (screenAspectRatio >= designAspectRatio) {
               canvas.fitWidth = false;
               canvas.fitHeight = true;
            } else {
               canvas.fitWidth = true;
               canvas.fitHeight = false;
            }

            break;
         }
         case FitAxis.HORIZONTAL: {
            if (screenAspectRatio >= designAspectRatio) {
               canvas.fitWidth = true;
               canvas.fitHeight = false;
            } else {
               canvas.fitWidth = false;
               canvas.fitHeight = true;
            }

            break;
         }
      }

      // if (CC_DEV) console.log({
      //    TARGET_LAYOUT_AXIS,
      //    designResolution,
      //    viewportSize,
      //    screenAspectRatio,
      //    designAspectRatio,
      //    width: canvas.fitWidth,
      //    heigh: canvas.fitHeight,
      // });
   }
}