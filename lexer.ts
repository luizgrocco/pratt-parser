import { fail, ok, Result } from "./model.ts";

type Match = {
  match: string;
  skip?: boolean;
};

export type TokenMatcher<Kind> = {
  kind: Kind;
  matcher: (input: string) => Result<Match>;
};

export type Token<T> = {
  kind: T;
  value: string;
};

export class Tokenizer<Kind = never> {
  patterns: TokenMatcher<Kind>[];
  tokens: Token<Kind>[];
  source: string;
  position: number;

  constructor(patterns: TokenMatcher<Kind>[]) {
    this.patterns = patterns;
    this.tokens = [];
    this.source = "";
    this.position = 0;
  }

  tokenize(source: string): Result<Token<Kind>[]> {
    this.source = source.replace(/\s+/g, "");
    this.position = 0;
    this.tokens = [];

    let remainingSource = this.source;

    while (this.position < this.source.length) {
      remainingSource = this.source.slice(this.position);

      let longestMatchedToken: Token<Kind> | null = null;
      let shouldSkip = false;

      for (const { kind, matcher } of this.patterns) {
        const matchedToken = matcher(remainingSource);

        if (matchedToken.ok) {
          const { match, skip } = matchedToken.value;

          if (
            longestMatchedToken == null ||
            match.length > longestMatchedToken.value.length
          ) {
            longestMatchedToken = { kind, value: match };
            shouldSkip = Boolean(skip);
          }
        }
      }

      if (longestMatchedToken == null) {
        return fail("Unexpected token: " + remainingSource[0]);
      }

      if (!shouldSkip) this.tokens.push(longestMatchedToken);
      this.position += longestMatchedToken.value.length;
    }

    return ok(this.tokens);
  }
}
