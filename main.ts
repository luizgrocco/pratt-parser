export class Parser {
  _string: string;

  constructor() {
    this._string = "";
  }

  parser(input: string) {
    this._string = input;

    return this.Program();
  }

  Program() {
    return this.NumericLiteral();
  }

  NumericLiteral() {
    return {
      type: "NumericLiteral",
      value: Number(this._string),
    };
  }
}
