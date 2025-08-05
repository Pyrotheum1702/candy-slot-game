const { ccclass, property } = cc._decorator;

@ccclass
export default class Drawer extends cc.Component {
   private static Graphics = new Object();
   private static _graphic: cc.Graphics = null;
   public static reset() {
      this._graphic = null;
      this.Graphics = new Object();
   }

   public static erase(key = 'default') {
      if (this.Graphics[key]) {
         this.Graphics[key].destroy()
         this.Graphics[key] = null
      }
   }

   public static clear(key = 'default') {
      if (this.Graphics[key]) this.Graphics[key].clear()
   }

   public static Graphic(key = 'default') {
      let g = Drawer.Graphics[key];
      if (!g) {
         g = new cc.Node().addComponent(cc.Graphics);
         g.node.parent = cc.Canvas.instance.node.parent;
         Drawer.Graphics[key] = g;
         return g;
      }
      return g;
   }

   public static drawLine(pointA: cc.Vec2, pointB: cc.Vec2, color: cc.Color = cc.Color.WHITE, lineWidth: number = 3, key = 'default') {
      let g = this.Graphic(key)

      if (lineWidth) g.lineWidth = lineWidth
      g.strokeColor = color
      g.moveTo(pointA.x, pointA.y)
      g.lineTo(pointB.x, pointB.y)
      g.stroke()
   }

   public static drawLineOnY(yValue: number, color: cc.Color = cc.Color.WHITE, key = 'default') {
      let g = this.Graphic(key)

      g.strokeColor = color
      g.moveTo(0, yValue)
      g.lineTo(cc.view.getDesignResolutionSize().width, yValue)
      g.stroke()
   }

   public static drawCircle(pos: cc.Vec2, radius: number, color: cc.Color = cc.Color.WHITE, lineWidth: number = 3, key = 'default') {
      let g = this.Graphic(key)

      g.lineWidth = lineWidth
      g.circle(pos.x, pos.y, radius)
      g.strokeColor = color
      g.stroke()
   }
   public static drawFilledCircle(pos: cc.Vec2, radius: number, color: cc.Color = cc.Color.WHITE, lineWidth: number = 3, key = 'default') {
      let g: cc.Graphics = this.Graphic(key)

      g.lineWidth = lineWidth
      g.circle(pos.x, pos.y, radius)
      g.strokeColor = color
      g.stroke()
      g.fillColor = color
      g.fill()
   }

   public static drawRect(rect: cc.Rect, color: cc.Color = cc.Color.WHITE, lineWidth: number = 3, key = 'default') {
      Drawer.drawLine(cc.v2(rect.x, rect.y), cc.v2(rect.x + rect.width, rect.y), color, lineWidth, key)
      Drawer.drawLine(cc.v2(rect.x, rect.y), cc.v2(rect.x, rect.y + rect.height), color, lineWidth, key)
      Drawer.drawLine(cc.v2(rect.x + rect.width, rect.y + rect.height), cc.v2(rect.x + rect.width, rect.y), color, lineWidth, key)
      Drawer.drawLine(cc.v2(rect.x + rect.width, rect.y + rect.height), cc.v2(rect.x, rect.y + rect.height), color, lineWidth, key)
   }

   public static drawPolygon(polygon: Array<cc.Vec2>, color: cc.Color = cc.Color.WHITE, lineWidth: number = 3, key = 'default') {
      let g = this.Graphic(key)

      g.lineWidth = lineWidth
      g.strokeColor = color

      for (let i = 0; i < polygon.length; i++) {
         const point = polygon[i];

         let nextPoint

         if (i + 1 < polygon.length) { nextPoint = polygon[i + 1] } else { nextPoint = polygon[0] }

         g.moveTo(point.x, point.y)
         g.lineTo(nextPoint.x, nextPoint.y)
         g.stroke()
      }
   }
}
