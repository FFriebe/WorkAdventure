export class Question {
  public question: string;
  public answerA: string;
  public answerB: string;
  public answerC: string;
  public answerD: string;
  public correctAnswer: "A" | "B" | "C" | "D";

  constructor(json: any) {
    try {
      this.question = json.question;
      this.answerA = json.answerA;
      this.answerB = json.answerB;
      this.answerC = json.answerC;
      this.answerD = json.answerD;
      this.correctAnswer = json.correctAnswer;
    } catch (error) {
      throw new Error("Invalid question data");
    }
  }
}
