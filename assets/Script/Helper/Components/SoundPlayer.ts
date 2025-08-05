const { ccclass, property } = cc._decorator;

export const SOUNDS = {
   click: `click`,
   drop: `drop`,
   dropHit: `dropHit`,
   finalStop: `finalStop`,
   spinResult: `hitResult_SFX`,
   win: `win`,
   clickSoft: `clickSolf`,
   woosh: `woosh`,
}

@ccclass
export default class SoundPlayer extends cc.Component {
   @property(Array(cc.AudioClip))
   audioClips: Array<cc.AudioClip> = new Array<cc.AudioClip>();
   @property(Array(cc.AudioClip))
   musics: Array<cc.AudioClip> = new Array<cc.AudioClip>();

   playingSound = {}
   public static ins: SoundPlayer = null;
   private _effectVolume = 0.75;
   private _lastPlayTime = 0;

   onLoad() {
      if (SoundPlayer.ins) { this.node.destroy(); return; }
      SoundPlayer.ins = this;
      cc.audioEngine.setEffectsVolume(this._effectVolume);
      cc.game.addPersistRootNode(this.node);
   }

   play(soundName: string) {
      if (Math.abs(this._lastPlayTime - Date.now()) < 3) return;
      this._lastPlayTime = Date.now();

      this.audioClips.forEach(clip => {
         if (clip != null && clip.name == soundName) {
            cc.audioEngine.playEffect(clip, false)
         }
      });
   }

   startSound(soundName: string) {
      if (this.playingSound[soundName]) return;
      this.audioClips.forEach(clip => {
         if (clip != null && clip.name == soundName) {
            let id = cc.audioEngine.playEffect(clip, true)

            this.playingSound[soundName] = id

            let t = new cc.Node()
            t.setParent(cc.director.getScene())
            cc.tween(t).to(0.2, { angle: 1 }, {
               onUpdate: () => {
                  cc.audioEngine.setEffectsVolume(t.angle)
               }, easing: 'sineIn'
            }).start()
         }
      });
   }

   stopSound(soundName: string) {
      let soundId = this.playingSound[soundName]
      if (!soundId) return;

      this.playingSound[soundName] = null

      let t = new cc.Node()
      t.angle = 1
      t.setParent(cc.director.getScene())
      cc.tween(t).to(0.5, { angle: 0 }, {
         onUpdate: () => {
            cc.audioEngine.setEffectsVolume(t.angle);
         }, easing: 'sineIn'
      }).call(() => {
         cc.audioEngine.setEffectsVolume(1);
         cc.audioEngine.stopEffect(soundId);
      }).start()
   }

   playMusic(musicName: string) {
      this.musics.forEach(music => {
         if (music != null && music.name == musicName)
            cc.audioEngine.playMusic(music, true);
      });
   }

   updateMusicVolume(vol) { cc.audioEngine.setMusicVolume(vol); }
}
