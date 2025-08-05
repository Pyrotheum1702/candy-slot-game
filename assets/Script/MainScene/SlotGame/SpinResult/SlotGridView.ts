import { GAME_CONFIG } from "../../../Config/GameConfig";
import SlotGridCell from "./SlotGridCell";
import SlotGridColumn from "./SlotGridColumn";
import SlotGridItem from "./SlotGridItem";
import SpinResultUtils from "./SpinResultUtils";
import SpinResultGenerator, { GridPosition, SpinResult, SpinResultColumn, SpinResultTile } from "./SpinResultGenerator";
import { Utils } from "../../../Helper/Utils";
import Drawer from "../../../Helper/Drawer";

const { ccclass, property } = cc._decorator;

const GRID_CELL_PADDING = 30;

export class SpinAnimSetting {
   constructor(
      public offsetDummyCount: number,
      public columnDuration: number,
      public columnTurnOffsetTime: number
   ) { }
}

export const SPIN_ANIM_SETTING_PRESET = {
   normal: new SpinAnimSetting(3, 0.5, 0.35),
   fast: new SpinAnimSetting(0, 0.5, 0.15),
   turbo: new SpinAnimSetting(0, 0.25, 0),
};

@ccclass
export default class SlotGridView extends cc.Component {
   @property(cc.Node) cellGrid: cc.Node = null;

   @property(cc.Prefab) itemPref: cc.Prefab = null;
   @property(cc.Prefab) cellPref: cc.Prefab = null;

   @property([cc.SpriteFrame]) tileSprFrames: cc.SpriteFrame[] = [];

   private _cellSize: cc.Size = null;
   private _gridCells: Array<Array<SlotGridCell>> = [];
   private _gridItemColumns: Array<SlotGridColumn> = [];
   private _currentGridItems: Array<Array<SlotGridItem>> = [];
   private _spinAnimSetting: SpinAnimSetting = SPIN_ANIM_SETTING_PRESET.normal;
   private _columnScrollOverflowLength: number = 55;
   private _columnScrollOverflowDuration: number = 0.2;
   private _displayingWinningLineDrawKeys: Array<string> = [];

   public buildCellGrid(row: number, column: number) {
      if (row <= 0 || row > GAME_CONFIG.slotGame.gridRowCap) {
         console.error(`[SpinResult:buildCellGrid] Unexpected behavior: row is invalid`);
         return;
      }

      if (column <= 0 || row > GAME_CONFIG.slotGame.gridColumnCap) {
         console.error(`[SpinResult:buildCellGrid] Unexpected behavior: column is invalid`);
         return;
      }

      this._cellSize = new cc.Size(
         (this.cellGrid.width - (Math.max(0, column - 1) * GRID_CELL_PADDING)) / column,
         (this.cellGrid.height - (Math.max(0, row - 1) * GRID_CELL_PADDING)) / row,
      )

      const startX = -(this.cellGrid.width / 2), startY = this.cellGrid.height / 2;
      let tempX = startX, tempY = startY;

      let gridCells: Array<Array<SlotGridCell>> = [];

      for (let r = 0; r < row; r++) {
         gridCells.push([]);

         for (let c = 0; c < column; c++) {
            let cell = cc.instantiate(this.cellPref);

            cell.setParent(this.cellGrid);

            const pos = cc.v2(tempX + this._cellSize.width / 2, tempY - this._cellSize.height / 2);
            cell.setPosition(pos);
            cell.setContentSize(this._cellSize);

            const cellScript = cell.getComponent(SlotGridCell);
            gridCells[r].push(cellScript);

            tempX += GRID_CELL_PADDING + this._cellSize.width;
         }

         tempX = startX;
         tempY -= GRID_CELL_PADDING + this._cellSize.height;
      }

      this._gridCells = gridCells;

      if (CC_DEV) console.log(`[SpinResult:buildCellGrid]`, {
         row,
         column,
         gridCells
      });
   }

   private clearSlotGridItems() {
      for (let r = 0; r < this._currentGridItems.length; r++) {
         for (let c = 0; c < this._currentGridItems[r].length; c++) {
            const item = this._currentGridItems[r][c];
            if (cc.isValid(item?.node)) item.node.destroy();
         }
      }

      this._currentGridItems = [];
      this._gridItemColumns = [];
   }

   private clearDisplayingWinningLines() {
      if (this._displayingWinningLineDrawKeys.length === 0) return;

      for (const key of this._displayingWinningLineDrawKeys) { Drawer.clear(key); }

      this._displayingWinningLineDrawKeys = [];
      if (CC_DEV) console.log("[SlotGridView] Cleared winning lines.");
   }

   public displayWinningLines(winningLines: Array<Array<GridPosition>>) {
      if (!winningLines || winningLines?.length <= 0) return;
      console.log(`[SlotGridView:displayWinningLines]`, winningLines);

      try {
         const lineColor = new cc.Color().fromHEX(`#FFEB5B`);
         const circleRadius = 25;
         const lineWidth = 20;
         const drawerKey = Utils.getRandomId(10);
         const edgeOffset = 35;

         this._displayingWinningLineDrawKeys.push(drawerKey);

         for (let i = 0; i < winningLines.length; i++) {
            const line = winningLines[i];

            let p = Utils.getWorldPos(this._gridCells[line[0].r][line[0].c].node);
            p.x += (this._cellSize.width / 2 + edgeOffset) * ((line[0].c == 0) ? -1 : 1);
            Drawer.drawFilledCircle(p, circleRadius - 1, lineColor, 1, drawerKey);

            for (let j = 0; j < line.length; j++) {
               const gridPos = line[j];

               const pos = Utils.getWorldPos(this._gridCells[gridPos.r][gridPos.c].node);
               Drawer.drawLine(p, pos, lineColor, lineWidth, drawerKey);
               Drawer.drawFilledCircle(pos, lineWidth / 2 - 1, lineColor, 1, drawerKey);
               p = pos;
            }

            const lastGridPos = line[line.length - 1];
            let lastPos = Utils.getWorldPos(this._gridCells[lastGridPos.r][lastGridPos.c].node);
            lastPos.x += (this._cellSize.width / 2 + edgeOffset) * ((lastGridPos.c == 0) ? -1 : 1);
            Drawer.drawLine(p, lastPos, lineColor, lineWidth, drawerKey);
            Drawer.drawFilledCircle(lastPos, circleRadius - 1, lineColor, 1, drawerKey);
         }
      } catch (error) {
         console.error(`[displayWinningLines] Error:`, error);
      }
   }

   public displayGrid(grid: Array<Array<SpinResultTile>>) {
      if (CC_DEV) console.log(`[SlotGridView:displayGrid]`, grid);

      this.clearSlotGridItems();

      for (let r = 0; r < grid.length; r++) {
         this._currentGridItems.push([]);

         for (let c = 0; c < grid[r].length; c++) {
            const tileData = grid[r][c];
            const cell = this._gridCells[r][c];

            const itemNode = cc.instantiate(this.itemPref);
            itemNode.setParent(this.cellGrid);
            itemNode.setPosition(cell.node.position);

            const itemScript = itemNode.getComponent(SlotGridItem);

            const sprFrame = this.tileSprFrames[tileData.sprFrameIndex];
            if (!sprFrame) console.error(`[SlotGridView:displayGrid] Unexpected behavior: sprFrame is null`);

            itemScript.spr.spriteFrame = sprFrame;

            itemNode.setContentSize(cell.node.getContentSize());
            itemScript.name = `SlotGridItem-${r}-${c}`;

            this._currentGridItems[r].push(itemScript);

            if (this._gridItemColumns[c] == null) {
               this._gridItemColumns[c] = new SlotGridColumn();
            }
            this._gridItemColumns[c].slotGridItems[r] = itemScript;
         }
      }
   }

   private async playColumnSpinAnim(gridItemColumn: SlotGridColumn, destinationTiles: Array<SpinResultTile>, duration: number, dummyCount: number, delay: number): Promise<null> {
      return new Promise(resolve => {
         let tileCount = 0;
         let topItem = gridItemColumn.slotGridItems[0];

         for (let i = 0; i < dummyCount; i++) {
            const dummyNode = cc.instantiate(this.itemPref);
            dummyNode.setParent(this.cellGrid);
            dummyNode.setPosition(topItem.node.position);
            dummyNode.y += this._cellSize.height + GRID_CELL_PADDING;

            const itemScript = dummyNode.getComponent(SlotGridItem);
            const tile = SpinResultGenerator.generateRandomSpinResultTile();

            const sprFrame = this.tileSprFrames[tile.sprFrameIndex];
            if (!sprFrame) console.error(`[SlotGridView:displayGrid] Unexpected behavior: sprFrame is null`);

            itemScript.spr.spriteFrame = sprFrame;
            dummyNode.setContentSize(this._cellSize);
            gridItemColumn.slotGridItems.unshift(itemScript);
            topItem = gridItemColumn.slotGridItems[0];

            tileCount++;
         }

         destinationTiles = destinationTiles.reverse();
         for (let i = 0; i < destinationTiles.length; i++) {
            const itemNode = cc.instantiate(this.itemPref);
            itemNode.setParent(this.cellGrid);
            itemNode.setPosition(topItem.node.position);
            itemNode.y += this._cellSize.height + GRID_CELL_PADDING;

            const itemScript = itemNode.getComponent(SlotGridItem);
            const tile = destinationTiles[i];

            const sprFrame = this.tileSprFrames[tile.sprFrameIndex];
            if (!sprFrame) console.error(`[SlotGridView:displayGrid] Unexpected behavior: sprFrame is null`);

            itemScript.spr.spriteFrame = sprFrame;
            itemNode.setContentSize(this._cellSize);
            itemScript.name = `SlotGridItem-Dummy`;
            gridItemColumn.slotGridItems.unshift(itemScript);
            topItem = gridItemColumn.slotGridItems[0];

            tileCount++;
         }

         const scrollLength = (this._cellSize.height + GRID_CELL_PADDING) * tileCount;

         let scroller = new cc.Node();
         scroller.setParent(this.node);
         scroller.setPosition(0, 0);

         let lastY = scroller.y;
         const tween = cc.tween(scroller)
            .delay(delay)
            .to(duration + this._columnScrollOverflowDuration / 2,
               { y: scrollLength + this._columnScrollOverflowLength }, {
               'easing': 'linear',
               onUpdate: () => {
                  const dif = Math.abs(scroller.y - lastY);
                  lastY = scroller.y;

                  for (const item of gridItemColumn.slotGridItems) {
                     if (cc.isValid(item?.node)) item.node.y -= dif;
                  }
               }
            }).to(this._columnScrollOverflowDuration / 2,
               { y: scrollLength }, {
               'easing': 'linear',
               onUpdate: () => {
                  const dif = Math.abs(scroller.y - lastY);
                  lastY = scroller.y;

                  for (const item of gridItemColumn.slotGridItems) {
                     if (cc.isValid(item?.node)) item.node.y += dif;
                  }
               }
            }).call(() => {
               resolve(null);
               scroller.destroy();
            }).start();
      })
   }

   public async playSpinAnim(spinResult: SpinResult, quickMode = false): Promise<null> {
      if (CC_DEV) console.log(`[SlotGridView:playSpinAnim]`, spinResult);

      return new Promise(resolve => {
         let resultTileColumns: Array<SpinResultColumn> = SpinResultUtils.getColumnsFromResultGrid(spinResult.grid);
         let columnSpinAnimPromises: Array<Promise<null>> = [];

         let columnDuration = this._spinAnimSetting.columnDuration;
         let offsetDummyCount = this._spinAnimSetting.offsetDummyCount;
         let columnTurnOffsetTime = this._spinAnimSetting.columnTurnOffsetTime;

         if (quickMode) {
            columnDuration = SPIN_ANIM_SETTING_PRESET.turbo.columnDuration;
            offsetDummyCount = SPIN_ANIM_SETTING_PRESET.turbo.offsetDummyCount;
            columnTurnOffsetTime = SPIN_ANIM_SETTING_PRESET.turbo.columnTurnOffsetTime;
         }

         this.clearDisplayingWinningLines();

         for (let c = 0; c < resultTileColumns.length; c++) {
            const resultColumn = resultTileColumns[c];
            console.log({ resultColumn });
            const promise = this.playColumnSpinAnim(
               this._gridItemColumns[c],
               resultColumn.tiles,
               columnDuration,
               offsetDummyCount,
               c * columnTurnOffsetTime);
            columnSpinAnimPromises.push(promise);
         }

         Promise.all(columnSpinAnimPromises).then(() => { resolve(null); });
      });
   }
}
