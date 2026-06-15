import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brand } from "../../ui/Brand";
import { Button } from "../../ui/Button";
import { HistoryIcon } from "../../ui/icons";
import { ease } from "../../ui/motion";
import { Keypad } from "./Keypad";
import { HistoryDrawer } from "./HistoryDrawer";
import { BASIC_KEYS, MEMORY_KEYS, scientificKeys, type KeyDef } from "./keys";
import { useCalculator, type Mode } from "./useCalculator";

const MODES: { id: Mode; label: string }[] = [
  { id: "basic", label: "Basic" },
  { id: "scientific", label: "Scientific" },
];

export function Calculator({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const calc = useCalculator();
  const [historyOpen, setHistoryOpen] = useState(false);
  const scientific = calc.mode === "scientific";

  const memoryBar: KeyDef[] = [
    ...MEMORY_KEYS,
    {
      id: "angle",
      label: calc.angle === "deg" ? "DEG" : "RAD",
      aria: "Toggle degrees or radians",
      variant: "toggle",
      action: { kind: "angle" },
      active: calc.angle === "rad",
    },
  ];

  return (
    <div className="calc" data-mode={calc.mode}>
      <header className="calc__top">
        <Brand />
        <div className="calc__account">
          <span className="calc__email" title={email}>{email}</span>
          <button
            type="button"
            className="calc__icon-btn"
            onClick={() => setHistoryOpen(true)}
            aria-label="Open history"
          >
            <HistoryIcon />
          </button>
          <Button variant="quiet" onClick={onSignOut}>Sign out</Button>
        </div>
      </header>

      <motion.div className="panel" layout transition={{ type: "spring", stiffness: 320, damping: 36 }}>
        <div className="screen" data-error={calc.view.error || undefined}>
          <div className="screen__meta">
            <AnimatePresence initial={false}>
              {calc.memory !== null && (
                <motion.span
                  key={`m-${calc.memoryPulse}`}
                  className="screen__chip"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                >
                  M
                </motion.span>
              )}
            </AnimatePresence>
            <span className="screen__expr">{calc.view.expr}</span>
          </div>
          <div className="screen__value" role="status" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={calc.view.isResult ? `r-${calc.view.value}` : "live"}
                className="screen__num"
                data-error={calc.view.error || undefined}
                initial={calc.view.isResult ? { opacity: 0, y: 14, filter: "blur(5px)" } : false}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={
                  calc.view.isResult
                    ? { opacity: 0, y: -16, filter: "blur(5px)", position: "absolute", right: 0, bottom: 0 }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.3, ease }}
              >
                {calc.view.value}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="toolbar">
          <div className="seg" role="tablist" aria-label="Calculator mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={calc.mode === m.id}
                className="seg__btn"
                data-on={calc.mode === m.id || undefined}
                onClick={() => calc.setMode(m.id)}
              >
                {calc.mode === m.id && <motion.span layoutId="seg-pill" className="seg__pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="seg__text">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {scientific && (
            <motion.section
              className="sci"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.34, ease }}
            >
              <Keypad
                keys={memoryBar}
                activeKey={calc.activeKey}
                className="sci__bar"
                onAction={calc.run}
              />
              <Keypad
                keys={scientificKeys(calc.second)}
                activeKey={calc.activeKey}
                className="sci__grid"
                onAction={calc.run}
              />
            </motion.section>
          )}
        </AnimatePresence>

        <Keypad
          keys={BASIC_KEYS}
          activeKey={calc.activeKey}
          className="keypad"
          onAction={calc.run}
        />
      </motion.div>

      <p className="calc__tip">
        <kbd>( )</kbd> group · <kbd>^</kbd> power · <kbd>!</kbd> factorial · <kbd>Enter</kbd> equals · <kbd>Esc</kbd> clear
      </p>

      <HistoryDrawer
        open={historyOpen}
        history={calc.history}
        memory={calc.memory}
        onClose={() => setHistoryOpen(false)}
        onReuse={(v) => {
          calc.reuse(v);
          setHistoryOpen(false);
        }}
        onTogglePin={calc.togglePin}
        onClear={calc.clearHistory}
      />
    </div>
  );
}
