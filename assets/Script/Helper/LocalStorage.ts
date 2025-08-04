import { GAME_CONFIG } from "../Config/GameConfig";

const { ccclass } = cc._decorator;

@ccclass
export default class LocalStorage {
   public static setItem(key: string, data: Object) {
      cc.sys.localStorage.setItem(`${GAME_CONFIG.gameName}-${key}`, JSON.stringify(data));
   }

   public static getItem(key: string) {
      let data = cc.sys.localStorage.getItem(`${GAME_CONFIG.gameName}-${key}`);
      if (!cc.isValid(data)) {
         return null
      } else return JSON.parse(data);
   }
}
