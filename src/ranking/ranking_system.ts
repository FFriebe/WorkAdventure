/// <reference types="@workadventure/iframe-api-typings" />

import { Rank } from "./rank";
import rankData from "../../data/rankData.json";

class RankingSystem {
  private static instance: RankingSystem;
  public static getInstance() {
    if (!RankingSystem.instance) {
      RankingSystem.instance = new RankingSystem();
    }
    return RankingSystem.instance;
  }

  private ranks: Rank[] = [];
  private currentRankLevel = 0;
  private rankPoints = 0;
  private rankPointsThreshold = 10;
  private levelUpSound;
  
  constructor() {
    this.ranks = rankData.map((element: any) => new Rank(element));
    this.levelUpSound = WA.sound.loadSound("/sounds/level_up_sound.wav");
    console.log("Ranking System initialized");
  }

  public init() { 
    this.updateColor(this.getCurrentRank());
    this.updateBanner();
  }

  public getCurrentRank(): Rank {
    return this.ranks[this.currentRankLevel];
  }

  public getMaxPointsToEarn() {
    return (this.ranks.length - 1) * this.rankPointsThreshold;
  }

  public addPoints(points: number) {
    this.rankPoints += this.rankPoints + points >= 0 ? points : 0;
    this.checkIfUprankPossible();
    this.updateBanner();
  }

  public resetRankPoints() {
    if (this.rankPoints >= 10) this.rankPoints = this.rankPoints - this.rankPointsThreshold;
    if (this.rankPoints < 0) this.rankPoints = 0;
  }

  private checkIfUprankPossible() {
    if (this.rankPoints < this.rankPointsThreshold) return;
    this.uprank();
  }

  public uprank(): boolean {
    const wasUprankSucceeded = this.increaseRank();
    if (!wasUprankSucceeded) return false;
    const currentRank = this.getCurrentRank();
    this.updateColor(currentRank);
    this.playUprankSound();
    this.resetRankPoints();
    return true;
  }

  private increaseRank(): boolean {
    const hasHighestRank = this.currentRankLevel >= this.ranks.length - 1;
    if (hasHighestRank) return false;
    this.currentRankLevel += 1;
    return true;
  }

  private updateBanner() {
    const rank = this.getCurrentRank();
    const rankColorAsHex = "#" + ((1 << 24) + (rank.color.red << 16) + (rank.color.green << 8) + rank.color.blue).toString(16).substring(1);
    const hasHighestRank = this.currentRankLevel >= this.ranks.length - 1;
    const text = `${rank.title} (EXP: ${this.rankPoints}/${this.rankPointsThreshold})`;
    const highestRankText = `${rank.title} (Max Level)`;
    WA.ui.banner.openBanner({
      text: hasHighestRank ? highestRankText : text,
      bgColor: rankColorAsHex,
      closable: false,
      id: "d",
    });
  }

  private updateColor(rank: Rank) {
    WA.player.setOutlineColor(
      rank.color.red,
      rank.color.green,
      rank.color.blue
    );
  }

  private playUprankSound() {
    this.levelUpSound.play({ volume: 0.5 });
  }
}

export default RankingSystem.getInstance();
