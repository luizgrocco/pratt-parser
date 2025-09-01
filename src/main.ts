import { PatternMatcher, type Token, Tokenizer } from "./lexer.ts";
import { number } from "./parser-combinators.ts";
import { Parser } from "./parser.ts";
import { err, ok } from "./result.ts";

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
  | ","
  | "."
  | ".."
  | ";"
  | "?"
  | "!"
  | ":"
  // Assignment Operators
  | "="
  // Comparison Operators
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  // Logical Operators
  | "||"
  | "&&"
  | "++"
  | "--"
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

function createLiteralToken<Kind extends string>(
  kind: Kind,
): PatternMatcher<Kind> {
  return {
    kind,
    matcher: (input: string) =>
      input.startsWith(kind.toLowerCase())
        ? ok({ match: kind.toLowerCase() })
        : err("Failed to match: " + kind),
  };
}

const tokenMatchers = [
  createLiteralToken("+"),
  createLiteralToken("-"),
  createLiteralToken("*"),
  createLiteralToken("/"),
  createLiteralToken("^"),
  {
    kind: "NUMBER" as const,
    matcher: (input: string) => {
      const numberMatch = input.match(/^\d+/);
      if (numberMatch) {
        return ok({ match: numberMatch.join() });
      }
      return err("Failed to match: " + input);
    },
  },
  {
    kind: "WHITESPACE" as const,
    matcher: (input: string) => {
      const whitespaceMatch = input.match(/^\s+/);
      if (whitespaceMatch) {
        return ok({ match: whitespaceMatch.join(), skip: true });
      }
      return err("Failed to match: " + input);
    },
  },
  {
    kind: "VARIABLE" as const,
    matcher: (input: string) => {
      const variableMatch = input.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (variableMatch) {
        return ok({ match: variableMatch[0] });
      }
      return err("Failed to match: " + input);
    },
  },
  {
    kind: "KEYWORD" as const,
    matcher: (input: string) => {
      const keywordMatch = input.match(/^const\b/);
      if (keywordMatch) {
        return ok({ match: keywordMatch[0] });
      }
      return err("Failed to match: " + input);
    },
  },
];

const tokenizer = new Tokenizer(tokenMatchers);

const tokens = tokenizer.tokenize(
  "14+                32 - 44 * 43 ^ 4 / 23 + constantine + const a",
);

if (tokens.ok) console.log(tokens.value.map((t) => t.value));
if (!tokens.ok) console.log(tokens.error);

const parser = new Parser([
  {
    kind: "NUMBER" as const,
    leftBindingPower: 0,
    matcher: (input: string) => {
      const [numberMatch] = number(input);
      if (numberMatch.ok) {
        return ok({ match: numberMatch.value });
      }
      return err(`Failed to match: ${input} as a number`);
    },
    nud: (token) =>
      ok({
        type: "NumericLiteral" as const,
        value: Number(token.value),
      }),
  },
]);
