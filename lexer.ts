type TokenKind =
  | "EOF"
  | "STRING"
  | "NUMBER"
  | "IDENTIFIER"

  // Grouping symbols
  | "("
  | ")"
  | "["
  | "]"
  | "{"
  | "}"

  // Mathematical Operators
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "^"

  // ???
  | "COMMA"
  | "DOT"
  | "DOT_DOT"
  | "SEMI_COLON"
  | "INTERROGATION"
  | "EXCLAMATION"
  | "COLON"

  // Assignment Operators
  | "ASSIGN"

  // Comparison Operators
  | "EQUALS"
  | "NOT_EQUALS"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL"

  // Logical Operators
  | "OR"
  | "AND"
  | "INCREMENT"
  | "DECREMENT"

  // Reserved Keywords
  | "LET"
  | "CONST"
  | "CLASS"
  | "NEW"
  | "IMPORT"
  | "FROM"
  | "EXPORT"
  | "IF"
  | "ELSE"
  | "FOR"
  | "WHILE"
  | "TRUE"
  | "FALSE"
  | "RETURN"
  | "FUNCTION"
  | "TYPEOF"
  | "IN";

type Token = {
  kind: TokenKind;
  value: string;
};

type PatternMatcher = {
  matcher: (input: string) => boolean;
  handler: (tokenizer: Tokenizer) => void;
};

export class Tokenizer {
  patterns: PatternMatcher[];
  tokens: Token[];
  source: string;
  position: number;

  constructor(patterns: PatternMatcher[] = []) {
    this.patterns = patterns;
    this.tokens = [];
    this.source = "";
    this.position = 0;
  }

  addPattern(pattern: PatternMatcher) {
    this.patterns.push(pattern);
  }

  debugToken(token: Token) {
    console.log(`${token.kind} (${token.value})\n`);
  }

  newToken(kind: TokenKind, value: string): Token {
    return {
      kind,
      value,
    };
  }

  tokenize(source: string): Token[] {
    this.source = source;
    this.position = 0;
    this.tokens = [];

    // TODO: Tokenizing logic

    return this.tokens;
  }
}
