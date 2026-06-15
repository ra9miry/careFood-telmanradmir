import { AnimatePresence, motion } from "framer-motion";
import { ease } from "../../ui/motion";
import { CloseIcon, PinIcon } from "../../ui/icons";
import { formatNumber } from "./engine";
import type { HistoryItem } from "./useCalculator";

interface HistoryDrawerProps {
  open: boolean;
  history: HistoryItem[];
  memory: number | null;
  onClose: () => void;
  onReuse: (value: number) => void;
  onTogglePin: (id: string) => void;
  onClear: () => void;
}

export function HistoryDrawer({
  open,
  history,
  memory,
  onClose,
  onReuse,
  onTogglePin,
  onClear,
}: HistoryDrawerProps) {
  const pinned = history.filter((h) => h.pinned);
  const recent = history.filter((h) => !h.pinned);
  const hasRecent = recent.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="drawer"
          initial="closed"
          animate="open"
          exit="closed"
          aria-modal="true"
          role="dialog"
          aria-label="Calculation history"
        >
          <motion.button
            type="button"
            className="drawer__scrim"
            aria-label="Close history"
            onClick={onClose}
            variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
            transition={{ duration: 0.24, ease }}
          />
          <motion.aside
            className="drawer__panel"
            variants={{
              closed: { x: "100%" },
              open: { x: 0 },
            }}
            transition={{ type: "spring", stiffness: 360, damping: 38 }}
          >
            <header className="drawer__head">
              <div>
                <h2 className="drawer__title">History</h2>
                <p className="drawer__sub">{history.length} saved</p>
              </div>
              <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </button>
            </header>

            <div className="drawer__body">
              <section className="drawer__group">
                <span className="drawer__label">Memory</span>
                {memory !== null ? (
                  <button type="button" className="memory-row" onClick={() => onReuse(memory)}>
                    <span className="memory-row__tag">M</span>
                    <span className="memory-row__value">{formatNumber(memory)}</span>
                    <span className="memory-row__hint">Insert</span>
                  </button>
                ) : (
                  <p className="drawer__empty">Memory is empty. Use M+ to store a value.</p>
                )}
              </section>

              {pinned.length > 0 && (
                <section className="drawer__group">
                  <span className="drawer__label">Pinned</span>
                  <ul className="entries">
                    {pinned.map((item) => (
                      <Entry key={item.id} item={item} onReuse={onReuse} onTogglePin={onTogglePin} />
                    ))}
                  </ul>
                </section>
              )}

              <section className="drawer__group">
                <div className="drawer__group-head">
                  <span className="drawer__label">Recent</span>
                  {hasRecent && (
                    <button type="button" className="drawer__clear" onClick={onClear}>
                      Clear
                    </button>
                  )}
                </div>
                {hasRecent ? (
                  <ul className="entries">
                    <AnimatePresence initial={false}>
                      {recent.map((item) => (
                        <Entry key={item.id} item={item} onReuse={onReuse} onTogglePin={onTogglePin} />
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <p className="drawer__empty">No calculations yet. Your results will appear here.</p>
                )}
              </section>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Entry({
  item,
  onReuse,
  onTogglePin,
}: {
  item: HistoryItem;
  onReuse: (value: number) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <motion.li
      className="entry"
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, ease }}
    >
      <button type="button" className="entry__main" onClick={() => onReuse(item.value)}>
        <span className="entry__expr">{item.expr}</span>
        <span className="entry__value">{formatNumber(item.value)}</span>
      </button>
      <button
        type="button"
        className="entry__pin"
        data-on={item.pinned || undefined}
        aria-label={item.pinned ? "Unpin" : "Pin"}
        onClick={() => onTogglePin(item.id)}
      >
        <PinIcon width={15} height={15} />
      </button>
    </motion.li>
  );
}
