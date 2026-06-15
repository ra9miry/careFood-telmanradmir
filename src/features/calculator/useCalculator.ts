import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  type Angle,
  type Atom,
  evaluate,
  formatEntry,
  formatNumber,
  MAX_ENTRY,
  numberToAtomText,
  renderExpression,
} from "./engine";
import type { Action } from "./keys";

type EngineAction =
  | Exclude<Action, { kind: "equals" }>
  | { kind: "commit"; value: number; expr: string }
  | { kind: "fail" }
  | { kind: "insert"; value: number };

interface CalcState {
  atoms: Atom[];
  entry: string;
  result: number | null;
  done: boolean;
  error: boolean;
  committedExpr: string;
}

const initial: CalcState = {
  atoms: [],
  entry: "",
  result: null,
  done: false,
  error: false,
  committedExpr: "",
};

const num = (text: string): Atom => ({ kind: "num", text });
const lastAtom = (atoms: Atom[]): Atom | undefined => atoms[atoms.length - 1];
const isOperandEnd = (a: Atom | undefined): boolean =>
  !!a && (a.kind === "num" || a.kind === "rparen" || a.kind === "const" || a.kind === "postfix");

const live = (s: CalcState): Atom[] =>
  s.entry !== "" ? [...s.atoms, num(s.entry)] : s.atoms;

const digitLen = (entry: string) => entry.replace(/[-.]/g, "").length;

const fresh = (over: Partial<CalcState>): CalcState => ({
  ...initial,
  ...over,
});

function reducer(state: CalcState, action: EngineAction): CalcState {
  const s = state.error && action.kind !== "clear" ? initial : state;

  switch (action.kind) {
    case "digit": {
      if (s.done) return fresh({ entry: action.value });
      if (s.entry === "" || s.entry === "0") return { ...s, entry: action.value };
      if (digitLen(s.entry) >= MAX_ENTRY) return s;
      return { ...s, entry: s.entry + action.value };
    }

    case "dot": {
      if (s.done) return fresh({ entry: "0." });
      if (s.entry === "") return { ...s, entry: "0." };
      if (s.entry.includes(".")) return s;
      return { ...s, entry: s.entry + "." };
    }

    case "sign": {
      if (s.entry !== "" && s.entry !== "0") {
        return { ...s, entry: s.entry.startsWith("-") ? s.entry.slice(1) : "-" + s.entry };
      }
      if (s.done && s.result !== null) {
        return fresh({ entry: numberToAtomText(-s.result) });
      }
      return s;
    }

    case "binary": {
      let atoms = s.done && s.result !== null ? [num(numberToAtomText(s.result))] : [...s.atoms];
      if (!s.done && s.entry !== "") atoms.push(num(s.entry));

      if (atoms.length === 0) {
        if (action.op === "−") return fresh({ entry: "-" });
        atoms = [num("0")];
      }
      const last = lastAtom(atoms);
      if (last?.kind === "binary") atoms[atoms.length - 1] = { kind: "binary", op: action.op };
      else atoms.push({ kind: "binary", op: action.op });
      return { ...initial, atoms };
    }

    case "fn": {
      if (s.entry !== "") {
        return {
          ...initial,
          atoms: [...s.atoms, { kind: "fn", fn: action.fn }, { kind: "lparen" }, num(s.entry), { kind: "rparen" }],
        };
      }
      if (s.done && s.result !== null) {
        return {
          ...initial,
          atoms: [{ kind: "fn", fn: action.fn }, { kind: "lparen" }, num(numberToAtomText(s.result)), { kind: "rparen" }],
        };
      }
      return { ...initial, atoms: [...s.atoms, { kind: "fn", fn: action.fn }] };
    }

    case "postfix": {
      if (s.entry !== "") {
        return { ...initial, atoms: [...s.atoms, num(s.entry), { kind: "postfix", op: action.op }] };
      }
      if (s.done && s.result !== null) {
        return { ...initial, atoms: [num(numberToAtomText(s.result)), { kind: "postfix", op: action.op }] };
      }
      if (isOperandEnd(lastAtom(s.atoms))) {
        return { ...initial, atoms: [...s.atoms, { kind: "postfix", op: action.op }] };
      }
      return s;
    }

    case "const": {
      const atom: Atom = { kind: "const", c: action.c };
      if (s.done) return fresh({ atoms: [atom] });
      if (s.entry !== "") return { ...initial, atoms: [...s.atoms, num(s.entry), atom] };
      return { ...initial, atoms: [...s.atoms, atom] };
    }

    case "insert": {
      const text = numberToAtomText(action.value);
      if (s.done) return fresh({ entry: text });
      return { ...s, entry: text };
    }

    case "lparen": {
      if (s.done) return fresh({ atoms: [{ kind: "lparen" }] });
      if (s.entry !== "") return { ...initial, atoms: [...s.atoms, num(s.entry), { kind: "lparen" }] };
      return { ...initial, atoms: [...s.atoms, { kind: "lparen" }] };
    }

    case "rparen": {
      const atoms = s.entry !== "" ? [...s.atoms, num(s.entry)] : [...s.atoms];
      const open = atoms.filter((a) => a.kind === "lparen").length;
      const closed = atoms.filter((a) => a.kind === "rparen").length;
      if (open <= closed || !isOperandEnd(lastAtom(atoms))) {
        return s.entry !== "" ? { ...initial, atoms } : s;
      }
      return { ...initial, atoms: [...atoms, { kind: "rparen" }] };
    }

    case "back": {
      if (s.done && s.result !== null) {
        const text = numberToAtomText(s.result);
        const next = text.length <= 1 ? "" : text.slice(0, -1);
        return fresh({ entry: next === "-" ? "" : next });
      }
      if (s.entry !== "") {
        const next = s.entry.length <= 1 ? "" : s.entry.slice(0, -1);
        return { ...s, entry: next === "-" ? "" : next };
      }
      if (s.atoms.length > 0) return { ...s, atoms: s.atoms.slice(0, -1) };
      return s;
    }

    case "clear":
      return initial;

    case "commit":
      return { ...initial, result: action.value, done: true, committedExpr: action.expr };

    case "fail":
      return { ...initial, error: true };

    default:
      return s;
  }
}

export interface HistoryItem {
  id: string;
  expr: string;
  value: number;
  pinned: boolean;
  ts: number;
}

interface View {
  expr: string;
  value: string;
  raw: number;
  isResult: boolean;
  error: boolean;
}

function selectView(s: CalcState, angle: Angle): View {
  if (s.error) return { expr: "", value: "Error", raw: NaN, isResult: false, error: true };
  if (s.done && s.result !== null) {
    return { expr: s.committedExpr ? `${s.committedExpr} =` : "", value: formatNumber(s.result), raw: s.result, isResult: true, error: false };
  }

  const atoms = live(s);
  const expr = s.atoms.length > 0 ? renderExpression(atoms) : "";

  try {
    const raw = evaluate(atoms, angle);
    return { expr, value: formatNumber(raw), raw, isResult: false, error: false };
  } catch {
    if (s.entry !== "") return { expr, value: formatEntry(s.entry), raw: Number(s.entry) || 0, isResult: false, error: false };
    const trimmed = trimTrailing(atoms);
    try {
      const raw = evaluate(trimmed, angle);
      return { expr, value: formatNumber(raw), raw, isResult: false, error: false };
    } catch {
      return { expr, value: "0", raw: 0, isResult: false, error: false };
    }
  }
}

function trimTrailing(atoms: Atom[]): Atom[] {
  const out = [...atoms];
  while (out.length && !isOperandEnd(out[out.length - 1])) out.pop();
  return out;
}

const HISTORY_KEY = "tr.calc.history.v1";
const MEMORY_KEY = "tr.calc.memory.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export type Mode = "basic" | "scientific";

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [angle, setAngle] = useState<Angle>("deg");
  const [second, setSecond] = useState(false);
  const [mode, setMode] = useState<Mode>("basic");
  const [memory, setMemory] = useState<number | null>(() => load<number | null>(MEMORY_KEY, null));
  const [history, setHistory] = useState<HistoryItem[]>(() => load<HistoryItem[]>(HISTORY_KEY, []));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [memoryPulse, setMemoryPulse] = useState(0);

  const view = selectView(state, angle);

  const latest = useRef({ state, angle, view, memory });
  useEffect(() => {
    latest.current = { state, angle, view, memory };
  });

  const flashTimer = useRef<number | undefined>(undefined);
  const flash = useCallback((id: string) => {
    setActiveKey(id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setActiveKey(null), 130);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* storage unavailable */
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    } catch {
      /* storage unavailable */
    }
  }, [memory]);

  const equals = useCallback(() => {
    const { state: s, angle: a } = latest.current;
    const full = live(s);
    if (full.length === 0) return;
    try {
      let atoms = full;
      let value: number;
      try {
        value = evaluate(atoms, a);
      } catch {
        atoms = trimTrailing(full);
        value = evaluate(atoms, a);
      }
      const expr = renderExpression(atoms);
      dispatch({ kind: "commit", value, expr });
      setHistory((prev) => {
        if (prev[0]?.expr === expr && prev[0]?.value === value) return prev;
        const item: HistoryItem = { id: `${Date.now()}`, expr, value, pinned: false, ts: Date.now() };
        const pinned = prev.filter((h) => h.pinned);
        const recent = prev.filter((h) => !h.pinned);
        return [...pinned, item, ...recent].slice(0, 60);
      });
    } catch {
      dispatch({ kind: "fail" });
    }
  }, []);

  const run = useCallback(
    (action: Action, keyId?: string) => {
      if (keyId) flash(keyId);
      switch (action.kind) {
        case "second":
          setSecond((v) => !v);
          return;
        case "angle":
          setAngle((a) => (a === "deg" ? "rad" : "deg"));
          return;
        case "equals":
          equals();
          return;
        case "mem": {
          const v = latest.current.view.raw;
          if (action.op === "mc") setMemory(null);
          if (action.op === "mr") dispatch({ kind: "insert", value: latest.current.memory ?? 0 });
          if (action.op === "m+") setMemory((m) => (m ?? 0) + (Number.isFinite(v) ? v : 0));
          if (action.op === "m-") setMemory((m) => (m ?? 0) - (Number.isFinite(v) ? v : 0));
          if (action.op !== "mr") setMemoryPulse((n) => n + 1);
          return;
        }
        default:
          dispatch(action);
      }
    },
    [equals, flash],
  );

  const reuse = useCallback((value: number) => {
    dispatch({ kind: "insert", value });
  }, []);

  const togglePin = useCallback((id: string) => {
    setHistory((prev) =>
      prev
        .map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.ts - a.ts),
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory((prev) => prev.filter((h) => h.pinned));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k >= "0" && k <= "9") return run({ kind: "digit", value: k }, k);
      if (k === ".") return run({ kind: "dot" }, "dot");
      if (k === "+") return run({ kind: "binary", op: "+" }, "+");
      if (k === "-") return run({ kind: "binary", op: "−" }, "−");
      if (k === "*") return run({ kind: "binary", op: "×" }, "×");
      if (k === "/") { e.preventDefault(); return run({ kind: "binary", op: "÷" }, "÷"); }
      if (k === "^") return run({ kind: "binary", op: "^" }, "pow");
      if (k === "(") return run({ kind: "lparen" }, "lparen");
      if (k === ")") return run({ kind: "rparen" }, "rparen");
      if (k === "!") return run({ kind: "postfix", op: "fact" }, "fact");
      if (k === "%") return run({ kind: "postfix", op: "pct" }, "pct");
      if (k === "Enter" || k === "=") { e.preventDefault(); return run({ kind: "equals" }, "equals"); }
      if (k === "Backspace") return run({ kind: "back" }, "back");
      if (k === "Escape") return run({ kind: "clear" }, "clear");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  return {
    view,
    angle,
    second,
    mode,
    memory,
    history,
    activeKey,
    memoryPulse,
    run,
    setMode,
    reuse,
    togglePin,
    clearHistory,
  };
}
