export type Fn =
  | "sin" | "cos" | "tan"
  | "asin" | "acos" | "atan"
  | "ln" | "log" | "sqrt" | "cbrt"
  | "exp" | "exp10" | "abs";

export type Postfix = "sqr" | "cube" | "inv" | "fact" | "pct";

export type Binary = "+" | "−" | "×" | "÷" | "^" | "root" | "mod";

export type Const = "pi" | "e";

export type Angle = "deg" | "rad";

const FUNCTION_LABEL: Record<Fn, string> = {
  sin: "sin", cos: "cos", tan: "tan",
  asin: "sin⁻¹", acos: "cos⁻¹", atan: "tan⁻¹",
  ln: "ln", log: "log", sqrt: "√", cbrt: "∛",
  exp: "exp", exp10: "10^", abs: "abs",
};

const POSTFIX_LABEL: Record<Postfix, string> = {
  sqr: "²", cube: "³", inv: "⁻¹", fact: "!", pct: "%",
};

const MAX_DIGITS = 15;

export type Atom =
  | { kind: "num"; text: string }
  | { kind: "binary"; op: Binary }
  | { kind: "fn"; fn: Fn }
  | { kind: "const"; c: Const }
  | { kind: "postfix"; op: Postfix }
  | { kind: "lparen" }
  | { kind: "rparen" };

const constValue = (c: Const): number => (c === "pi" ? Math.PI : Math.E);

export function atomText(atom: Atom): string {
  switch (atom.kind) {
    case "num": return atom.text;
    case "binary": return atom.op;
    case "fn": return `${FUNCTION_LABEL[atom.fn]}(`;
    case "const": return atom.c === "pi" ? "π" : "e";
    case "postfix": return POSTFIX_LABEL[atom.op];
    case "lparen": return "(";
    case "rparen": return ")";
  }
}

export function renderExpression(atoms: Atom[]): string {
  let out = "";
  for (const atom of atoms) {
    const text = atomText(atom);
    out += atom.kind === "binary" ? ` ${text} ` : text;
  }
  return out.replace(/\s+/g, " ").trim();
}

type Token =
  | { t: "num"; v: number }
  | { t: "op"; v: Binary }
  | { t: "u"; v: "-" }
  | { t: "fn"; v: Fn }
  | { t: "post"; v: Postfix }
  | { t: "lp" }
  | { t: "rp" };

function tokenize(atoms: Atom[]): Token[] {
  const tokens: Token[] = [];
  let depth = 0;
  for (const atom of atoms) {
    switch (atom.kind) {
      case "num": {
        const v = Number(atom.text);
        if (!Number.isFinite(v)) throw new Error("bad number");
        tokens.push({ t: "num", v });
        break;
      }
      case "binary":
        tokens.push({ t: "op", v: atom.op });
        break;
      case "fn":
        tokens.push({ t: "fn", v: atom.fn }, { t: "lp" });
        depth += 1;
        break;
      case "const":
        tokens.push({ t: "num", v: constValue(atom.c) });
        break;
      case "postfix":
        tokens.push({ t: "post", v: atom.op });
        break;
      case "lparen":
        tokens.push({ t: "lp" });
        depth += 1;
        break;
      case "rparen":
        if (depth > 0) {
          tokens.push({ t: "rp" });
          depth -= 1;
        }
        break;
    }
  }
  for (let i = 0; i < depth; i += 1) tokens.push({ t: "rp" });
  return tokens;
}

function withImplicitMul(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const cur = tokens[i];
    const next = tokens[i + 1];
    out.push(cur);
    if (!next) continue;
    const endsOperand = cur.t === "num" || cur.t === "rp" || cur.t === "post";
    const startsOperand = next.t === "num" || next.t === "lp" || next.t === "fn";
    if (endsOperand && startsOperand) out.push({ t: "op", v: "×" });
  }
  return out;
}

const BINDING: Record<Binary, number> = {
  "+": 10, "−": 10,
  "×": 20, "÷": 20, "mod": 20,
  "^": 30, "root": 30,
};

const fnValue = (fn: Fn, x: number, angle: Angle): number => {
  const toRad = (v: number) => (angle === "deg" ? (v * Math.PI) / 180 : v);
  const fromRad = (v: number) => (angle === "deg" ? (v * 180) / Math.PI : v);
  switch (fn) {
    case "sin": return Math.sin(toRad(x));
    case "cos": return Math.cos(toRad(x));
    case "tan": return Math.tan(toRad(x));
    case "asin": return fromRad(Math.asin(x));
    case "acos": return fromRad(Math.acos(x));
    case "atan": return fromRad(Math.atan(x));
    case "ln": return Math.log(x);
    case "log": return Math.log10(x);
    case "sqrt": return Math.sqrt(x);
    case "cbrt": return Math.cbrt(x);
    case "exp": return Math.exp(x);
    case "exp10": return 10 ** x;
    case "abs": return Math.abs(x);
  }
};

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i += 1) r *= i;
  return r;
}

const postfixValue = (op: Postfix, x: number): number => {
  switch (op) {
    case "sqr": return x * x;
    case "cube": return x ** 3;
    case "inv": return 1 / x;
    case "fact": return factorial(x);
    case "pct": return x / 100;
  }
};

function applyBinary(op: Binary, a: number, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return a / b;
    case "^": return a ** b;
    case "root": return Math.sign(b) * Math.abs(b) ** (1 / a);
    case "mod": return a % b;
  }
}

function parse(tokens: Token[], angle: Angle): number {
  let pos = 0;
  const peek = (): Token | undefined => tokens[pos];
  const eat = (): Token | undefined => tokens[pos++];

  const prefix = (): number => {
    const tok = eat();
    if (!tok) throw new Error("unexpected end");
    switch (tok.t) {
      case "num":
        return tok.v;
      case "op":
      case "u":
        if (tok.t === "u" || tok.v === "−") return -expr(25);
        throw new Error("unexpected operator");
      case "lp": {
        const v = expr(0);
        if (peek()?.t === "rp") eat();
        return v;
      }
      case "fn": {
        if (peek()?.t === "lp") eat();
        const arg = expr(0);
        if (peek()?.t === "rp") eat();
        return fnValue(tok.v, arg, angle);
      }
      default:
        throw new Error("unexpected token");
    }
  };

  const expr = (minBp: number): number => {
    let left = prefix();
    for (;;) {
      const tok = peek();
      if (!tok) break;
      if (tok.t === "post") {
        eat();
        left = postfixValue(tok.v, left);
        continue;
      }
      if (tok.t !== "op") break;
      const bp = BINDING[tok.v];
      if (bp <= minBp) break;
      eat();
      const right = expr(tok.v === "^" || tok.v === "root" ? bp - 1 : bp);
      left = applyBinary(tok.v, left, right);
    }
    return left;
  };

  const value = expr(0);
  if (pos < tokens.length) throw new Error("trailing tokens");
  return value;
}

export function evaluate(atoms: Atom[], angle: Angle): number {
  if (atoms.length === 0) return 0;
  const tokens = withImplicitMul(tokenize(atoms));
  if (tokens.length === 0) return 0;
  const value = parse(tokens, angle);
  if (!Number.isFinite(value)) throw new Error("not finite");
  return value;
}

const round = (n: number): number =>
  Math.round((n + Number.EPSILON) * 1e10) / 1e10;

export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  if (n === 0) return "0";
  const r = round(n);
  const abs = Math.abs(r);
  if (abs >= 1e15 || abs < 1e-9) {
    return r.toExponential(6).replace(/\.?0+e/, "e").replace("e+", "e");
  }
  const [intPart, decPart] = String(r).split(".");
  const sign = intPart.startsWith("-") ? "−" : "";
  const grouped = Math.abs(Number(intPart)).toLocaleString("en-US");
  return decPart ? `${sign}${grouped}.${decPart}` : `${sign}${grouped}`;
}

export function formatEntry(text: string): string {
  if (text === "" || text === "-") return text === "-" ? "−" : "0";
  const negative = text.startsWith("-");
  const raw = negative ? text.slice(1) : text;
  const [intPart, decPart] = raw.split(".");
  const grouped = Number(intPart || "0").toLocaleString("en-US");
  const body = text.includes(".") ? `${grouped}.${decPart ?? ""}` : grouped;
  return (negative ? "−" : "") + body;
}

export const numberToAtomText = (n: number): string => {
  const r = round(n);
  return Number.isFinite(r) ? String(r) : "0";
};

export const MAX_ENTRY = MAX_DIGITS;
