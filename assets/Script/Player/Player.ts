import { GAME_CONFIG } from "../Config/GameConfig";
import LocalStorage from "../Helper/LocalStorage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player {
   private static _lsBalanceKey = `Balance`;
   private static _lsNameKey = `Username`;

   public static setBalance(value: number) {
      if (isNaN(value)) {
         console.error(`[Player:set_balance] Unexpected behavior: value is not a number`);
         return;
      }
      if (value < 0) {
         console.error(`[Player:set_balance] Unexpected behavior: value is a negative number`);
         LocalStorage.setItem(this._lsBalanceKey, 0);
         return;
      }

      LocalStorage.setItem(this._lsBalanceKey, Math.min(value, GAME_CONFIG.playerBalanceCap));
   }

   public static getBalance(): number {
      let balance = LocalStorage.getItem(this._lsBalanceKey);
      if (balance == null) {
         balance = GAME_CONFIG.newPlayerInitBalance;
         this.setBalance(balance);
      }
      return balance;
   }

   public static getName(): string {
      let name = LocalStorage.getItem(this._lsNameKey);
      if (name == null) {
         name = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
         LocalStorage.setItem(this._lsNameKey, name);
      }
      return name;
   }
}
