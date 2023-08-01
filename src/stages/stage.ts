/// <reference types="@workadventure/iframe-api-typings" />

import { Question } from "./question";
import stageSystem from "./stage_system";

export class Stage {
  public tries = 0;
  private wrongAnswerResponse = "Falsche Antwort!";
  private correctAnswerResponse = "Korrekt!";
  private hasBeenSolved: boolean = false;
  private questionHasBeenShown: boolean = false;
  private questionSound;

  constructor(public layerName: string, public question: Question) {
    this.questionSound = WA.sound.loadSound("/sounds/question_sound.wav");
    this.subscribeToEnterLayer();
    console.log(`Stage "${this.layerName}" initialized`);
  }

  private subscribeToEnterLayer() {
    WA.room.onEnterLayer(this.layerName).subscribe(() => {
      if (this.hasBeenSolved) return;
      if (this.questionHasBeenShown) return;
      this.showQuestion();
    });
  }

  private showQuestion() {
    WA.chat.sendChatMessage(this.question.question);
    WA.chat.sendChatMessage(`"A": ${this.question.answerA}`);
    WA.chat.sendChatMessage(`"B": ${this.question.answerB}`);
    WA.chat.sendChatMessage(`"C": ${this.question.answerC}`);
    WA.chat.sendChatMessage(`"D": ${this.question.answerD}`);
    WA.chat.sendChatMessage(`Tippe die entsprechende Buchstaben ein, um deine Antwort abzugeben.`);
    this.playQuestionSound();
    this.questionHasBeenShown = true;
  }

  private playQuestionSound() {
    this.questionSound.play({ volume: 0.5 });
  }

  public processAnswer(answer: string): void {
    if (answer == this.wrongAnswerResponse) return;
    if (answer == this.correctAnswerResponse) return;
    if (answer == this.question.correctAnswer) {
      this.correctAnswer();
      return;
    }
    this.wrongAnswer();
  }

  private wrongAnswer() {
    this.tries++;
    WA.chat.sendChatMessage(this.wrongAnswerResponse);
  }

  private correctAnswer() {
    WA.room.hideLayer(this.layerName);
    this.hasBeenSolved = true;
    this.notifyStageSystem();
    WA.chat.sendChatMessage(this.correctAnswerResponse);
  }

  private notifyStageSystem() {
    stageSystem.stageSolved(this);
  }
}
