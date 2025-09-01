import { PatternMatcher, type Token, Tokenizer } from "./lexer.ts";
import { err, ok, Result } from "./result.ts";

type Symbol<SymbolKind extends string, ASTNode> = {
  kind: SymbolKind;
  leftBindingPower: number;
  nud?: (
    token: Token<SymbolKind>,
    context: Parser<SymbolKind, ASTNode>,
  ) => Result<ASTNode>;
  led?: (
    token: Token<SymbolKind>,
    left: ASTNode,
    context: Parser<SymbolKind, ASTNode>,
  ) => Result<ASTNode>;
  fud?: (
    token: Token<SymbolKind>,
    context: Parser<SymbolKind, ASTNode>,
  ) => Result<ASTNode>;
  // nud?: any;
  // led?: any;
  // fud?: any;
};

type Grammar<Kind extends string, Node> = (
  & Symbol<Kind, Node>
  & PatternMatcher<Kind>
)[];

export class Parser<Kind extends string, Node> {
  tokenizer: Tokenizer<Kind>;
  symbols: Record<Kind, Symbol<Kind, Node>>;

  constructor(grammar: NoInfer<Grammar<Kind, Node>>) {
    this.tokenizer = new Tokenizer(grammar);
    this.symbols = grammar.reduce(
      (acc, { kind, leftBindingPower, nud, led, fud }) => {
        acc[kind] = { kind, leftBindingPower, nud, led, fud };
        return acc;
      },
      {} as Record<Kind, Symbol<Kind, Node>>,
    );
  }

  private getToken(): Result<Token<Kind>> {
    return this.tokenizer.peek();
  }

  private advanceToken(): void {
    this.tokenizer.next();
  }

  private expectToken(token: string): Result<void> {
    const nextToken = this.getToken();

    // Didn't find a next token, fail
    if (!nextToken.ok) return err(`Expected ${token} to skip, got none`);

    // Found a next token, but it doesn't match, fail
    if (token !== nextToken.value.value) {
      return err(`Expected ${token} to skip, got ${nextToken.value.value}`);
    }

    this.advanceToken();
    // Found a next token, and it matches, success with empty return value
    return ok(undefined);
  }

  expression(rbp: number): Result<Node> {
    let currToken = this.getToken();
    if (!currToken.ok) {
      return err("Expected at least one token in expression, got none");
    }

    this.advanceToken();

    let currSymbol = this.symbols[currToken.value.kind];
    if (!currSymbol.nud) {
      // TODO: Improve this error message, what does having a nud mean to the user?
      // This error means the current token cannot appear as the first thing in an expression
      // because it is some kind of infix operatior or even a sufix operator that depends on
      // things before it
      return err(`Expected token ${currSymbol.kind} to have a nud`);
    }
    const tryLeft = currSymbol.nud(currToken.value, this);
    if (!tryLeft.ok) return tryLeft;
    let left = tryLeft.value;

    while (rbp < currSymbol.leftBindingPower) {
      currToken = this.getToken();
      if (!currToken.ok) break;

      currSymbol = this.symbols[currToken.value.kind];
      if (!currSymbol.led) {
        // TODO: Improve this error message, what does having a led mean to the user?
        // This error means the current token doesn't expect anything to its left when used
        // in an expression, but it was used as if it did (e.g. it was used like an operator, etc...)
        return err(`Expected token ${currSymbol.kind} to have a led`);
      }
      this.advanceToken();

      const tryLeft = currSymbol.led(currToken.value, left, this);
      if (!tryLeft.ok) return tryLeft;
      left = tryLeft.value;
    }

    return ok(left);
  }

  // A statement will look for either a fud or an expression that must start
  // with a nud.
  statement(): Result<Node> {
    const currToken = this.getToken();
    if (!currToken.ok) {
      return err("Expected at least one token in statement, got none");
    }

    const currSymbol = this.symbols[currToken.value.kind];

    // Statements can be just plain statements like "if", "while", etc...which must have fuds
    if (currSymbol.fud) {
      this.advanceToken();
      return currSymbol.fud(currToken.value, this);
    }

    // Statements can also be expressions
    // Expressions begin by parsing a nud
    const exp = this.expression(0);
    const endOfStatement = this.expectToken(";");

    if (!endOfStatement.ok) {
      return err("Missing ; at end of statement");
    }

    return exp;
  }

  statements(): Result<Node[]> {
    const statements: Node[] = [];

    // If there aren't any tokens to parse, then we're done
    let currToken = this.getToken();
    if (!currToken.ok) {
      return ok(statements);
    }

    let currSymbol = this.symbols[currToken.value.kind];

    while (currSymbol.fud || currSymbol.nud) {
      const statement = this.statement();

      // If the statement fails, then we return the statement error
      if (!statement.ok) return statement;

      statements.push(statement.value);

      // If there are no more tokens to parse, then we're done
      // TODO: Do we need to advance the token here?
      currToken = this.getToken();
      if (!currToken.ok) break;

      currSymbol = this.symbols[currToken.value.kind];
    }

    return ok(statements);
  }

  block(): Result<Node[]> {
    const blockStart = this.expectToken("{");

    if (!blockStart.ok) {
      return err("Expected { to start block");
    }

    const statementsInBlock = this.statements();

    const blockEnd = this.expectToken("}");

    if (!blockEnd.ok) {
      return err("Expected } to end block");
    }

    return statementsInBlock;
  }

  parse(source: string): Result<Node[]> {
    // First step: tokenize
    const tokens = this.tokenizer.tokenize(source);
    if (!tokens.ok) return tokens;

    // Second step: parse statements
    return this.statements();
  }
}
