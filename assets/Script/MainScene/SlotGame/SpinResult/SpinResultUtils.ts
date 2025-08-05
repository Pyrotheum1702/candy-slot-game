import { SpinResultTile, SpinResultColumn as SpinResultColumn } from "./SpinResultGenerator";

export default class SpinResultUtils {
   public static getColumnsFromResultGrid(grid: SpinResultTile[][]): SpinResultColumn[] {
      if (grid.length === 0) return [];

      const rowCount = grid.length;
      const columnCount = grid[0].length;

      const columns: SpinResultColumn[] = [];

      for (let c = 0; c < columnCount; c++) {
         const columnTiles: SpinResultTile[] = [];

         for (let r = 0; r < rowCount; r++) { columnTiles.push(grid[r][c]); }
         columns.push(new SpinResultColumn(columnTiles));
      }

      return columns;
   }
}