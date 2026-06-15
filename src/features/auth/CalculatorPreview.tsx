import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ease } from "../../ui/motion";
import { formatNumber } from "../calculator/engine";

interface Program {
  steps: string[];
  expr: string;
  result: number;
}

const PROGRAMS: Program[] = [
  { steps: ["7", "×", "8", "="], expr: "7 × 8", result: 56 },
  { steps: ["√", "1", "4", "4", "="], expr: "√(144)", result: 12 },
  { steps: ["1", "2", "5", "0", "+", "3", "8", "0", "="], expr: "1250 + 380", result: 1630 },
  { steps: ["9", "^", "2", "="], expr: "9²", result: 81 },
];

const KEYS: { id: string; variant?: "fn" | "op" | "equals"; span?: boolean }[] = [
  { id: "AC", variant: "fn" }, { id: "( )", variant: "fn" }, { id: "√", variant: "fn" }, { id: "÷", variant: "op" },
  { id: "7" }, { id: "8" }, { id: "9" }, { id: "×", variant: "op" },
  { id: "4" }, { id: "5" }, { id: "6" }, { id: "−", variant: "op" },
  { id: "1" }, { id: "2" }, { id: "3" }, { id: "+", variant: "op" },
  { id: "0", span: true }, { id: ".", }, { id: "=", variant: "equals" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function CalculatorPreview() {
  const [program, setProgram] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(() => prefersReducedMotion());
  const [active, setActive] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    const wait = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => !cancelled && fn(), ms);
      timers.current.push(id);
    };

    let p = 0;
    const play = () => {
      const { steps } = PROGRAMS[p];
      setProgram(p);
      setDone(false);
      setTyped("");
      let i = 0;
      const tick = () => {
        if (cancelled) return;
        const key = steps[i];
        setActive(key);
        if (key === "=") setDone(true);
        else setTyped(steps.slice(0, i + 1).join(" "));
        wait(220, () => setActive(null));
        i += 1;
        if (i < steps.length) wait(440, tick);
        else wait(2100, () => { p = (p + 1) % PROGRAMS.length; play(); });
      };
      wait(560, tick);
    };
    wait(120, play);

    return () => {
      cancelled = true;
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, []);

  const current = PROGRAMS[program];

  return (
    <div className="demo" aria-hidden="true">
      <span className="demo__eyebrow">Live preview</span>
      <div className="demo__panel">
        <div className="demo__screen">
          <div className="demo__expr">{done ? `${current.expr} =` : typed || " "}</div>
          <motion.div
            key={done ? `r-${program}` : "live"}
            className="demo__num"
            initial={done ? { opacity: 0, y: 12, filter: "blur(4px)" } : false}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.3, ease }}
          >
            {done ? formatNumber(current.result) : "0"}
          </motion.div>
        </div>
        <div className="demo__keys">
          {KEYS.map((k) => (
            <div
              key={k.id}
              className="demo__key"
              data-variant={k.variant}
              data-span={k.span || undefined}
              data-active={active === k.id || undefined}
            >
              {k.id}
            </div>
          ))}
        </div>
      </div>
      <p className="demo__caption">From everyday sums to scientific work — Telmanradmir keeps up.</p>
    </div>
  );
}
