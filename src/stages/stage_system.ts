/// <reference types="@workadventure/iframe-api-typings" />
import { getLayersMap } from "@workadventure/scripting-api-extra";
import type { ITiledMapLayer } from "@workadventure/tiled-map-type-guard";

import { Stage } from "./stage";
import { Question } from "./question";
import questionData from "../../data/questionData.json";
import rankingSystem from "../ranking/ranking_system";

class StageSystem {
  private static instance: StageSystem;
  public static getInstance() {
    if (!StageSystem.instance) {
      StageSystem.instance = new StageSystem();
    }
    return StageSystem.instance;
  }

  public currentStageIndex: number = -1;
  private questions: Question[] = [];
  private stages: Stage[] = [];
  private defaultGroupName = "stages";
  private doorSound;
  private finishSound;

  constructor() {
    this.questions = questionData.map((element: any) => new Question(element));
    this.doorSound = WA.sound.loadSound("/sounds/door_sound.wav");
    this.finishSound = WA.sound.loadSound("/sounds/finish_sound.wav");
    this.subscribeToChatMessages();
  }

  public async initStages(options?: { groupName?: string }) {
    const groupName = options?.groupName ?? this.defaultGroupName;
    const sortedLayers = await this.getSortedLayers();
    this.stages = this.getStageLayers(sortedLayers, groupName);
    if (this.stages.length == 0) return;
    this.currentStageIndex = 0;
  }

  private async getSortedLayers(): Promise<Map<string, ITiledMapLayer>> {
    const layers: Map<string, ITiledMapLayer> = await getLayersMap();
    const result = new Map([...layers.entries()].sort((a, b) => {
      return a[1].name.localeCompare(b[1].name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }));
    return result;
  }

  private getStageLayers(layers: Map<string, ITiledMapLayer>,groupName: string) {
    const result: Stage[] = [];
    let stageCount = 0;
    for (const layer of layers.values()) {
      if (!layer.name.startsWith(`${groupName}/`)) continue;
      if (stageCount >= this.questions.length) break;
      result.push(new Stage(layer.name, this.questions[stageCount++]));
    }
    return result;
  }

  public stageSolved(stage: Stage) {
    this.currentStageIndex++;
    this.addRankPoints(stage);
    this.playDoorSound();
    if (this.currentStageIndex == this.stages.length) {
      this.playFinishSound();
    }
    console.log(`Stage ${this.currentStageIndex} "${stage.layerName}" has been solved!`);
  }

  private addRankPoints(stage: Stage) {
    const maxPointsToAdd = rankingSystem.getMaxPointsToEarn() / this.stages.length;
    const pointsToAdd = Math.ceil(maxPointsToAdd) - stage.tries;
    rankingSystem.addPoints(pointsToAdd);
  }

  private playDoorSound() {
    this.doorSound.play({ volume: 0.5 });
  }

  private playFinishSound() {
    this.finishSound.play({ volume: 0.5 });
  }

  private subscribeToChatMessages() {
    WA.chat.onChatMessage((message: string) => {
      try {
        this.stages[this.currentStageIndex].processAnswer(message);
      } catch (error) {
        console.error(error);
      }
    });
  }
}

export default StageSystem.getInstance();
