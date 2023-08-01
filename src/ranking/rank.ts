export class Rank {
  public title: string;
  public color: {
    red: number;
    green: number;
    blue: number;
  };

  constructor(json: any) {
    try {
      this.title = json.title;
      this.color = json.color;
    } catch (error) {
      throw new Error("Invalid rank data");
    }
  }
}
