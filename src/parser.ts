import { Tokenizer, PatternMatcher, type Token } from "./lexer.ts";
import { err, ok, Result } from "./result.ts";

type Symbol<Kind extends string, ASTNode> = {
  kind: Kind;
  leftBindingPower: number;
  nud?: (token: Token<Kind>) => ASTNode;
  led?: (token: Token<Kind>, left: ASTNode) => ASTNode;
  fud?: (token: Token<Kind>) => ASTNode;
};

type Grammar<Kind extends string, Node> = (Symbol<Kind, Node> &
  PatternMatcher<Kind>)[];

export class Parser<Kind extends string, Node> {
  tokenizer: Tokenizer<Kind>;
  symbols: Record<Kind, Symbol<Kind, Node>>;

  constructor(grammar: Grammar<Kind, Node>) {
    this.tokenizer = new Tokenizer(grammar);
    this.symbols = grammar.reduce(
      (acc, { kind, leftBindingPower, nud, led, fud }) => {
        acc[kind] = { kind, leftBindingPower, nud, led, fud };
        return acc;
      },
      {} as Record<Kind, Symbol<Kind, Node>>
    );
  }

  getToken(): Result<Token<Kind>> {
    return this.tokenizer.peek();
  }

  advance(): void {
    this.tokenizer.next();
  }

  skipToken(token: string): Result<void> {
    const nextToken = this.getToken();

    // Didn't find a next token, fail
    if (!nextToken.ok) return err("No tokens left to skip");

    // Found a next token, but it doesn't match, fail
    if (token !== nextToken.value.value) {
      return err(`Expected ${token} to skip, got ${nextToken.value.value}`);
    }

    // TODO: Should advance?
    // Found a next token, and it matches
    return ok(undefined);
  }

  expression(rbp: number): Result<Node> {
    let currToken = this.getToken();
    if (!currToken.ok)
      return err("Expected at least one token in expression, got none");

    let currSymbol = this.symbols[currToken.value.kind];

    this.advance();

    if (!currSymbol.nud) {
      // TODO: Improve this error message, what does having a nud mean to the user?
      // This error means the current token cannot appear as the first thing in an expression
      // because it is some kind of infix operatior or even a sufix operator that depends on
      // things before it
      return err(`Expected token ${currSymbol.kind} to have a nud`);
    }
    let left = currSymbol.nud(currToken.value);

    while (rbp < currSymbol.leftBindingPower) {
      currToken = this.getToken();
      if (!currToken.ok) break;

      currSymbol = this.symbols[currToken.value.kind];

      this.advance();

      if (!currSymbol.led) {
        // TODO: Improve this error message, what does having a led mean to the user?
        // This error means the current token doesn't expect anything to its left when used
        // in an expression, but it was used as if it did (e.g. it was used like an operator, etc...)
        return err(`Expected token ${currSymbol.kind} to have a led`);
      }

      left = currSymbol.led(currToken.value, left);
    }

    return ok(left);
  }

  // statement(): Result<Node> {}

  // block(): Result<Node> {}

  parse(source: string): Result<Node[]> {
    const tokens = this.tokenizer.tokenize(source);

    if (!tokens.ok) return tokens;

    const statements: Node[] = [];

    // TODO: Replace this with a while loop parsing many statements
    const exp = this.expression(0);
    if (!exp.ok) return exp;

    statements.push(exp.value);
    return ok(statements);
  }
}
