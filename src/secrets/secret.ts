/// <reference types="@workadventure/iframe-api-typings" />

import { Area } from "@workadventure/iframe-api-typings";
import secretSystem from "./secret_system";

export class Secret {
  public hasBeenFound = false;

  constructor(public area: Area) {
    this.subscribeToEnterEvent();
    console.log(`Secret Area "${this.area.name}" initialized`);
  }

  private subscribeToEnterEvent() {
    WA.room.area.onEnter(this.area.name).subscribe(() => {
      if (this.hasBeenFound) return;
      this.hasBeenFound = true;
      this.notifySecretSystem();
    });
  }

  private notifySecretSystem() {
    secretSystem.foundSecret(this);
  }
}
