import { err, ok, Result } from "./result.ts";

type Match = {
  match: string;
  skip?: boolean;
};

export type PatternMatcher<Kind extends string> = {
  kind: Kind;
  matcher: (input: string) => Result<Match>;
};

export type Token<Kind extends string> = {
  kind: Kind;
  value: string;
};

export class Tokenizer<Kind extends string = never> {
  patterns: PatternMatcher<Kind>[];
  tokens: Token<Kind>[];
  tokenPosition: number;
  source: string;
  sourcePosition: number;

  constructor(patterns: PatternMatcher<Kind>[]) {
    this.patterns = patterns;
    this.tokens = [];
    this.tokenPosition = 0;
    this.source = "";
    this.sourcePosition = 0;
  }

  tokenize(source: string): Result<Token<Kind>[]> {
    this.source = source;
    this.sourcePosition = 0;
    this.tokens = [];
    this.tokenPosition = 0;

    let remainingSource = this.source;

    while (this.sourcePosition < this.source.length) {
      remainingSource = this.source.slice(this.sourcePosition);

      let longestMatchedToken: Result<Token<Kind>> = err("No match found");
      let shouldSkip = false;

      for (const { kind, matcher } of this.patterns) {
        const matchedToken = matcher(remainingSource);

        if (matchedToken.ok) {
          const { match, skip } = matchedToken.value;

          if (
            !longestMatchedToken.ok ||
            match.length > longestMatchedToken.value.value.length
          ) {
            longestMatchedToken = ok({ kind, value: match });
            shouldSkip = Boolean(skip);
          }
        }
      }

      if (!longestMatchedToken.ok) {
        return err(
          `Unexpected token: "${
            remainingSource[0]
          }" at position ${this.sourcePosition}`,
        );
      }

      if (!shouldSkip) this.tokens.push(longestMatchedToken.value);
      this.sourcePosition += longestMatchedToken.value.value.length;
    }

    return ok(this.tokens);
  }

  peek(): Result<Token<Kind>> {
    const currToken = this.tokens.at(this.tokenPosition);
    if (currToken) return ok(currToken);
    return err("End of tokens");
  }

  next(): void {
    this.tokenPosition++;
  }
}
