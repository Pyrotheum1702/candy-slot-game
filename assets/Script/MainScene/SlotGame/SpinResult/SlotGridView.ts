import { GAME_CONFIG } from "../../../Config/GameConfig";
import SlotGridCell from "./SlotGridCell";
import SlotGridColumn from "./SlotGridColumn";
import SlotGridItem from "./SlotGridItem";
import SpinResultUtils from "./SpinResultUtils";
import SpinResultGenerator, { GridPosition, SpinResult, SpinResultColumn, SpinResultTile } from "./SpinResultGenerator";
import { Utils } from "../../../Helper/Utils";
import Drawer from "../../../Helper/Drawer";
import SoundPlayer, { SOUNDS } from "../../../Helper/Components/SoundPlayer";
import SlotGameController, { SPIN_ANIM_SETTING_PRESET } from "../SlotGameController";

const { ccclass, property } = cc._decorator;

const GRID_CELL_PADDING = 30;

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
   private _displayingWinningLineDrawKeys: Array<string> = [];
   private _slotGridItemPool: cc.NodePool = new cc.NodePool("SlotGridItem");

   private _columnScrollOverflowLength: number = 55;
   private _columnScrollOverflowDuration: number = 0.2;

   public buildCellGrid(row: number, column: number) {
      if (row <= 0 || row > GAME_CONFIG.slotGame.gridRowCap) {
         console.error(`[buildCellGrid] Invalid row count`);
         return;
      }

      if (column <= 0 || column > GAME_CONFIG.slotGame.gridColumnCap) {
         console.error(`[buildCellGrid] Invalid column count`);
         return;
      }

      this._cellSize = new cc.Size(
         (this.cellGrid.width - (Math.max(0, column - 1) * GRID_CELL_PADDING)) / column,
         (this.cellGrid.height - (Math.max(0, row - 1) * GRID_CELL_PADDING)) / row,
      );

      const startX = -(this.cellGrid.width / 2);
      const startY = this.cellGrid.height / 2;
      let tempX = startX, tempY = startY;

      this._gridCells = [];

      for (let r = 0; r < row; r++) {
         const rowCells: SlotGridCell[] = [];
         for (let c = 0; c < column; c++) {
            const cellNode = cc.instantiate(this.cellPref);
            cellNode.setParent(this.cellGrid);

            const pos = cc.v2(tempX + this._cellSize.width / 2, tempY - this._cellSize.height / 2);
            cellNode.setPosition(pos);
            cellNode.setContentSize(this._cellSize);

            const cellScript = cellNode.getComponent(SlotGridCell);
            rowCells.push(cellScript);

            tempX += this._cellSize.width + GRID_CELL_PADDING;
         }
         this._gridCells.push(rowCells);
         tempX = startX;
         tempY -= this._cellSize.height + GRID_CELL_PADDING;
      }
   }

   public displayGrid(grid: Array<Array<SpinResultTile>>) {
      this.clearSlotGridItems();

      for (let r = 0; r < grid.length; r++) {
         this._currentGridItems.push([]);

         for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];
            const cell = this._gridCells[r][c];

            const itemNode = this.getGridItemNode();
            itemNode.setParent(this.cellGrid);
            itemNode.setPosition(cell.node.position);

            const itemScript = itemNode.getComponent(SlotGridItem);
            itemScript.spr.spriteFrame = this.tileSprFrames[tile.sprFrameIndex];
            itemNode.setContentSize(cell.node.getContentSize());
            itemScript.name = `SlotGridItem-${r}-${c}`;

            this._currentGridItems[r].push(itemScript);

            if (!this._gridItemColumns[c]) {
               this._gridItemColumns[c] = new SlotGridColumn();
            }
            this._gridItemColumns[c].slotGridItems[r] = itemScript;
         }
      }
   }

   public displayWinningLines(winningLines: Array<Array<GridPosition>>) {
      if (!winningLines?.length) return;

      try {
         const lineColor = new cc.Color().fromHEX(`#FFEB5B`);
         const circleRadius = 25;
         const lineWidth = 20;
         const edgeOffset = 35;
         const drawerKey = Utils.getRandomId(10);

         this._displayingWinningLineDrawKeys.push(drawerKey);

         for (const line of winningLines) {
            let p = Utils.getWorldPos(this._gridCells[line[0].r][line[0].c].node);
            p.x += (this._cellSize.width / 2 + edgeOffset) * (line[0].c === 0 ? -1 : 1);
            Drawer.drawFilledCircle(p, circleRadius - 1, lineColor, 1, drawerKey);

            for (const pos of line) {
               const target = Utils.getWorldPos(this._gridCells[pos.r][pos.c].node);
               Drawer.drawLine(p, target, lineColor, lineWidth, drawerKey);
               Drawer.drawFilledCircle(target, lineWidth / 2 - 1, lineColor, 1, drawerKey);
               p = target;
            }

            const last = line[line.length - 1];
            let end = Utils.getWorldPos(this._gridCells[last.r][last.c].node);
            end.x += (this._cellSize.width / 2 + edgeOffset) * (last.c === 0 ? -1 : 1);
            Drawer.drawLine(p, end, lineColor, lineWidth, drawerKey);
            Drawer.drawFilledCircle(end, circleRadius - 1, lineColor, 1, drawerKey);
         }
      } catch (err) {
         console.error(`[displayWinningLines] Error:`, err);
      }
   }

   public async playSpinAnim(spinResult: SpinResult, quickMode = false): Promise<null> {
      return new Promise(resolve => {
         const resultColumns = SpinResultUtils.getColumnsFromResultGrid(spinResult.grid);
         const promises: Promise<null>[] = [];

         const spinSetting = quickMode ? SPIN_ANIM_SETTING_PRESET.turbo : SlotGameController.ins.spinAnimSetting;
         this.clearDisplayingWinningLines();

         for (let c = 0; c < resultColumns.length; c++) {
            const p = this.playColumnSpinAnim(
               this._gridItemColumns[c],
               resultColumns[c].tiles,
               spinSetting.columnDuration,
               spinSetting.offsetDummyCount,
               c * spinSetting.columnTurnOffsetTime
            );
            promises.push(p);
         }

         Promise.all(promises).then(() => resolve(null));
      });
   }

   private getGridItemNode(): cc.Node {
      return this._slotGridItemPool.size() > 0 ? this._slotGridItemPool.get() : cc.instantiate(this.itemPref);
   }

   private clearSlotGridItems() {
      for (const row of this._currentGridItems) {
         for (const item of row) {
            if (cc.isValid(item?.node)) {
               this._slotGridItemPool.put(item.node);
            }
         }
      }

      this._currentGridItems = [];
      this._gridItemColumns = [];
   }

   private clearDisplayingWinningLines() {
      if (!this._displayingWinningLineDrawKeys.length) return;

      for (const key of this._displayingWinningLineDrawKeys) {
         Drawer.clear(key);
      }

      this._displayingWinningLineDrawKeys = [];
      // if (CC_DEV) console.log("[SlotGridView] Cleared winning lines.");
   }

   private checkAndRemoveIfGridItemOutOfBounds(item: SlotGridItem, column: SlotGridColumn) {
      if (item.isOutOfBounds()) {
         const index = column.slotGridItems.indexOf(item);
         if (index >= 0) {
            column.slotGridItems.splice(index, 1);
            this._slotGridItemPool.put(item.node);
         }
      }
   }

   private async playColumnSpinAnim(
      column: SlotGridColumn,
      tiles: Array<SpinResultTile>,
      duration: number,
      dummyCount: number,
      delay: number
   ): Promise<null> {
      return new Promise(resolve => {
         let top = column.slotGridItems[0];
         let tileCount = 0;

         for (let i = 0; i < dummyCount; i++) {
            const node = this.getGridItemNode();
            node.setParent(this.cellGrid);
            node.setPosition(top.node.position);
            node.y += this._cellSize.height + GRID_CELL_PADDING;

            const item = node.getComponent(SlotGridItem);
            const tile = SpinResultGenerator.generateRandomSpinResultTile();
            item.spr.spriteFrame = this.tileSprFrames[tile.sprFrameIndex];
            node.setContentSize(this._cellSize);

            column.slotGridItems.unshift(item);
            top = item;
            tileCount++;
         }

         for (const tile of tiles.reverse()) {
            const node = this.getGridItemNode();
            node.setParent(this.cellGrid);
            node.setPosition(top.node.position);
            node.y += this._cellSize.height + GRID_CELL_PADDING;

            const item = node.getComponent(SlotGridItem);
            item.spr.spriteFrame = this.tileSprFrames[tile.sprFrameIndex];
            item.name = "SlotGridItem-Dummy";
            node.setContentSize(this._cellSize);

            column.slotGridItems.unshift(item);
            top = item;
            tileCount++;
         }

         const scrollLength = (this._cellSize.height + GRID_CELL_PADDING) * tileCount;
         const scroller = new cc.Node();
         scroller.setParent(this.node);
         scroller.setPosition(0, 0);

         let lastY = scroller.y;

         cc.tween(scroller)
            .delay(delay)
            .call(() => SoundPlayer.ins.play(SOUNDS.woosh))
            .to(duration + this._columnScrollOverflowDuration / 2, { y: scrollLength + this._columnScrollOverflowLength }, {
               easing: "linear",
               onUpdate: () => {
                  const dif = Math.abs(scroller.y - lastY);
                  lastY = scroller.y;

                  for (let i = column.slotGridItems.length - 1; i >= 0; i--) {
                     const item = column.slotGridItems[i];
                     if (!cc.isValid(item?.node)) continue;
                     item.node.y -= dif;
                     this.checkAndRemoveIfGridItemOutOfBounds(item, column);
                  }
               }
            })
            .call(() => SoundPlayer.ins.play(SOUNDS.dropHit))
            .to(this._columnScrollOverflowDuration / 2, { y: scrollLength }, {
               easing: "linear",
               onUpdate: () => {
                  const dif = Math.abs(scroller.y - lastY);
                  lastY = scroller.y;

                  for (const item of column.slotGridItems) {
                     if (!cc.isValid(item?.node)) continue;
                     item.node.y += dif;
                     this.checkAndRemoveIfGridItemOutOfBounds(item, column);
                  }
               }
            })
            .call(() => {
               scroller.destroy();
               resolve(null);
            })
            .start();
      });
   }
}
