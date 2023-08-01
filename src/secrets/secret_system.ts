import { getLayersMap } from "@workadventure/scripting-api-extra";
import type { ITiledMapLayer, ITiledMapObjectLayer } from "@workadventure/tiled-map-type-guard";

import { Secret } from "./secret";

class SecretSystem {
  private static instance: SecretSystem;
  public static getInstance() {
    if (!SecretSystem.instance) {
      SecretSystem.instance = new SecretSystem();
    }
    return SecretSystem.instance;
  }
  
  private defaultLayerName = "secrets";
  private secrets: Secret[] = [];
  private secretFoundSound;
  private secretSong;
  private secretSongIsPlaying = false;

  private constructor() {
    this.secretFoundSound = WA.sound.loadSound("/sounds/secret_found_sound.wav");
    this.secretSong = WA.sound.loadSound("/sounds/secret_song.mp3");
    console.log("Secret System initialized");
  }

  public async initSecrets(options?: { layerName?: string }) {
    const layerName = options?.layerName ?? this.defaultLayerName;
    const secretLayer = await this.getSecretLayer(layerName);
    if (!secretLayer) {
      console.error(`Secret layer "${layerName}" not found!`);
      return;
    }
    this.secrets = await this.getSecrets(secretLayer);
  }

  private async getSecretLayer(searchLayerName: string): Promise<ITiledMapObjectLayer | undefined> {
    const layers: Map<string, ITiledMapLayer> = await getLayersMap();
    const result = layers.get(searchLayerName) as ITiledMapObjectLayer;
    return result;
  }

  private async getSecrets(secretLayer: ITiledMapObjectLayer): Promise<Secret[]> {
    let result: Secret[] = [];
    for (const object of secretLayer.objects) {
      try {
        const area = await WA.room.area.get(object.name);
        result.push(new Secret(area));
      } catch (error) {
        continue;
      }
    }
    return result;
  }

  public getSecretsFoundPercentage() {
    const foundNumber = this.secrets.filter((secret) => secret.hasBeenFound).length;
    const totalNumber = this.secrets.length;
    return foundNumber / totalNumber;
  }

  public foundSecret(secret: Secret) {
    this.showActionMessage();
    this.playSecretFoundSound();
    if (this.getSecretsFoundPercentage() == 1) {
      this.toggleSecretSongButton();
    }
    console.log(`Secret found: ${secret.area.name}`);
  }

  private showActionMessage() {
    const percentageFound = (this.getSecretsFoundPercentage() * 100).toFixed(0);
    const message = WA.ui.displayActionMessage({
      message: `Du hast ein Geheimnis gefunden! (${percentageFound} %)`,
      callback: () => {},
      type: "message",
    });
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  private playSecretFoundSound() {
    this.secretFoundSound.play({ volume: 0.5 });
  }

  private toggleSecretSongButton() {
    this.toggleSecretSong();
    WA.ui.actionBar.addButton({
      id: "secret-song-button",
      label: `Geheime Musik ${this.secretSongIsPlaying ? "stoppen" : "abspielen"}`,
      callback: (_) => this.toggleSecretSongButton(),
    });
  }

  private toggleSecretSong() {
    if (this.secretSongIsPlaying) {
      this.secretSong.stop();
      this.secretSongIsPlaying = false;
    } else {
      this.secretSong.play({ volume: 0.05, loop: true });
      this.secretSongIsPlaying = true;
    }
  }
}

export default SecretSystem.getInstance();
