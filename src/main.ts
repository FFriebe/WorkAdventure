/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";
import secretSystem from "./secrets/secret_system";
import rankingSystem from "./ranking/ranking_system";
import stageSystem from "./stages/stage_system";

WA.onInit().then(() => {
  try {
    stageSystem.initStages();
    secretSystem.initSecrets();
    rankingSystem.init();
  
    bootstrapExtra().then(() => {
      console.log("BootstrapExtra initialized");
    });
  } catch (error) {
    console.error(error);
  }
});

export {};
