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
  | "OPEN_PAREN"
  | "CLOSE_PAREN"
  | "OPEN_SQUARE_BRACKET"
  | "CLOSE_SQUARE_BRACKET"
  | "OPEN_CURLY_BRACKET"
  | "CLOSE_CURLY_BRACKET"
  // Mathematical Operators
  | "PLUS"
  | "MINUS"
  | "MULT"
  | "DIV"
  | "MOD"
  | "EXP"
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
  | "INC"
  | "DEC"
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

function createConstToken<Kind extends string>(
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
  createConstToken("+"),
  createConstToken("-"),
  createConstToken("*"),
  createConstToken("/"),
  createConstToken("^"),
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
];

const tokenizer = new Tokenizer(tokenMatchers);

const tokens = tokenizer.tokenize("14+                32 - 44 * 43 ^ 4 / 23");

if (tokens.ok) console.log(tokens.value.map((t) => t.value));
if (!tokens.ok) console.log(tokens.error);

const parser = new Parser([
  {
    kind: "NUMBER" as const,
    leftBindingPower: 0,
    matcher: (input: string) => {
      const [numberMatch] = number(input);
      if (numberMatch.ok) {
        return ok({ match: String(numberMatch.value) });
      }
      return err(`Failed to match: ${input} as a number`);
    },
    nud: (token) => {},
  },
]);
