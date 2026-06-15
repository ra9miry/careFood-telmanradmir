import { motion } from "framer-motion";
import { press } from "../../ui/motion";
import type { Action, KeyDef } from "./keys";

interface KeypadProps {
  keys: KeyDef[];
  activeKey: string | null;
  className: string;
  onAction: (action: Action, keyId: string) => void;
}

export function Keypad({ keys, activeKey, className, onAction }: KeypadProps) {
  return (
    <div className={className} role="group" aria-label="Calculator keys">
      {keys.map((key) => (
        <motion.button
          key={key.id}
          type="button"
          className="key"
          data-variant={key.variant}
          data-span={key.span || undefined}
          data-active={activeKey === key.id || undefined}
          data-on={key.active || undefined}
          aria-label={key.aria}
          aria-pressed={key.active || undefined}
          whileTap={press}
          onClick={() => onAction(key.action, key.id)}
        >
          {key.label}
        </motion.button>
      ))}
    </div>
  );
}
