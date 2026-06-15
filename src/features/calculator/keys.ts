import type { Binary, Const, Fn, Postfix } from "./engine";

export type Action =
  | { kind: "digit"; value: string }
  | { kind: "dot" }
  | { kind: "binary"; op: Binary }
  | { kind: "fn"; fn: Fn }
  | { kind: "const"; c: Const }
  | { kind: "postfix"; op: Postfix }
  | { kind: "lparen" }
  | { kind: "rparen" }
  | { kind: "equals" }
  | { kind: "clear" }
  | { kind: "back" }
  | { kind: "sign" }
  | { kind: "mem"; op: "mc" | "mr" | "m+" | "m-" }
  | { kind: "second" }
  | { kind: "angle" };

export type KeyVariant = "digit" | "fn" | "op" | "equals" | "sci" | "toggle";

export interface KeyDef {
  id: string;
  label: string;
  aria: string;
  action: Action;
  variant: KeyVariant;
  span?: boolean;
  active?: boolean;
}

export const BASIC_KEYS: KeyDef[] = [
  { id: "clear", label: "AC", aria: "All clear", variant: "fn", action: { kind: "clear" } },
  { id: "sign", label: "±", aria: "Toggle sign", variant: "fn", action: { kind: "sign" } },
  { id: "pct", label: "%", aria: "Percent", variant: "fn", action: { kind: "postfix", op: "pct" } },
  { id: "÷", label: "÷", aria: "Divide", variant: "op", action: { kind: "binary", op: "÷" } },
  { id: "7", label: "7", aria: "Seven", variant: "digit", action: { kind: "digit", value: "7" } },
  { id: "8", label: "8", aria: "Eight", variant: "digit", action: { kind: "digit", value: "8" } },
  { id: "9", label: "9", aria: "Nine", variant: "digit", action: { kind: "digit", value: "9" } },
  { id: "×", label: "×", aria: "Multiply", variant: "op", action: { kind: "binary", op: "×" } },
  { id: "4", label: "4", aria: "Four", variant: "digit", action: { kind: "digit", value: "4" } },
  { id: "5", label: "5", aria: "Five", variant: "digit", action: { kind: "digit", value: "5" } },
  { id: "6", label: "6", aria: "Six", variant: "digit", action: { kind: "digit", value: "6" } },
  { id: "−", label: "−", aria: "Subtract", variant: "op", action: { kind: "binary", op: "−" } },
  { id: "1", label: "1", aria: "One", variant: "digit", action: { kind: "digit", value: "1" } },
  { id: "2", label: "2", aria: "Two", variant: "digit", action: { kind: "digit", value: "2" } },
  { id: "3", label: "3", aria: "Three", variant: "digit", action: { kind: "digit", value: "3" } },
  { id: "+", label: "+", aria: "Add", variant: "op", action: { kind: "binary", op: "+" } },
  { id: "0", label: "0", aria: "Zero", variant: "digit", span: true, action: { kind: "digit", value: "0" } },
  { id: "dot", label: ".", aria: "Decimal point", variant: "digit", action: { kind: "dot" } },
  { id: "equals", label: "=", aria: "Equals", variant: "equals", action: { kind: "equals" } },
];

export const MEMORY_KEYS: KeyDef[] = [
  { id: "mc", label: "MC", aria: "Memory clear", variant: "toggle", action: { kind: "mem", op: "mc" } },
  { id: "mr", label: "MR", aria: "Memory recall", variant: "toggle", action: { kind: "mem", op: "mr" } },
  { id: "m+", label: "M+", aria: "Memory add", variant: "toggle", action: { kind: "mem", op: "m+" } },
  { id: "m-", label: "M−", aria: "Memory subtract", variant: "toggle", action: { kind: "mem", op: "m-" } },
];

export function scientificKeys(second: boolean): KeyDef[] {
  const sci = (id: string, label: string, action: Action, active?: boolean): KeyDef => ({
    id, label, aria: label, action, variant: "sci", active,
  });

  return [
    sci("second", "2nd", { kind: "second" }, second),
    sci("sqr", "x²", { kind: "postfix", op: "sqr" }),
    sci("cube", "x³", { kind: "postfix", op: "cube" }),
    second
      ? sci("root", "ʸ√x", { kind: "binary", op: "root" })
      : sci("pow", "xʸ", { kind: "binary", op: "^" }),
    sci("exp", "eˣ", { kind: "fn", fn: "exp" }),

    sci("inv", "¹⁄ₓ", { kind: "postfix", op: "inv" }),
    sci("sqrt", "√x", { kind: "fn", fn: "sqrt" }),
    sci("cbrt", "∛x", { kind: "fn", fn: "cbrt" }),
    sci("ln", "ln", { kind: "fn", fn: "ln" }),
    sci("log", "log", { kind: "fn", fn: "log" }),

    sci("fact", "x!", { kind: "postfix", op: "fact" }),
    second
      ? sci("asin", "sin⁻¹", { kind: "fn", fn: "asin" })
      : sci("sin", "sin", { kind: "fn", fn: "sin" }),
    second
      ? sci("acos", "cos⁻¹", { kind: "fn", fn: "acos" })
      : sci("cos", "cos", { kind: "fn", fn: "cos" }),
    second
      ? sci("atan", "tan⁻¹", { kind: "fn", fn: "atan" })
      : sci("tan", "tan", { kind: "fn", fn: "tan" }),
    sci("exp10", "10ˣ", { kind: "fn", fn: "exp10" }),

    sci("lparen", "(", { kind: "lparen" }),
    sci("rparen", ")", { kind: "rparen" }),
    sci("pi", "π", { kind: "const", c: "pi" }),
    sci("e", "e", { kind: "const", c: "e" }),
    sci("mod", "mod", { kind: "binary", op: "mod" }),
  ];
}
