import { GAME_CONFIG } from "../../../Config/GameConfig";
import SpinResultCell from "./SpinResultCell";

const { ccclass, property } = cc._decorator;

const GRID_CELL_PADDING = 30;

@ccclass
export default class SpinResult extends cc.Component {
   @property(cc.Node) cellGrid: cc.Node = null;

   @property(cc.Prefab) itemPref: cc.Prefab = null;
   @property(cc.Prefab) cellPref: cc.Prefab = null;

   private _gridCells: Array<Array<SpinResultCell>> = [];

   buildCellGrid(row: number, column: number) {
      if (row <= 0 || row > GAME_CONFIG.slotGame.gridRowCap) {
         console.error(`[SpinResult:buildCellGrid] Unexpected behavior: row is invalid`);
         return;
      }

      if (column <= 0 || row > GAME_CONFIG.slotGame.gridColumnCap) {
         console.error(`[SpinResult:buildCellGrid] Unexpected behavior: column is invalid`);
         return;
      }

      const cellSize: cc.Size = new cc.Size(
         (this.cellGrid.width - (Math.max(0, column - 1) * GRID_CELL_PADDING)) / column,
         (this.cellGrid.height - (Math.max(0, row - 1) * GRID_CELL_PADDING)) / row,
      )

      const startX = -(this.cellGrid.width / 2), startY = this.cellGrid.height / 2;
      let tempX = startX, tempY = startY;

      let gridCells: Array<Array<SpinResultCell>> = [];

      for (let r = 0; r < row; r++) {
         gridCells.push([]);

         for (let c = 0; c < column; c++) {
            let cell = cc.instantiate(this.cellPref);

            cell.setParent(this.cellGrid);

            const pos = cc.v2(tempX + cellSize.width / 2, tempY - cellSize.height / 2);
            cell.setPosition(pos);
            cell.setContentSize(cellSize);

            const cellScript = cell.getComponent(SpinResultCell);
            gridCells[r].push(cellScript);

            tempX += GRID_CELL_PADDING + cellSize.width;
         }

         tempX = startX;
         tempY -= GRID_CELL_PADDING + cellSize.height;
      }

      this._gridCells = gridCells;

      if (CC_DEV) console.log(`[SpinResult:buildCellGrid]`, {
         row,
         column,
         cellSize,
         gridCells
      });
   }

}
