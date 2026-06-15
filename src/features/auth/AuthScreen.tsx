import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brand } from "../../ui/Brand";
import { Button } from "../../ui/Button";
import { ease } from "../../ui/motion";
import { SocialButtons } from "./SocialButtons";
import { MagicLinkForm } from "./MagicLinkForm";
import { CalculatorPreview } from "./CalculatorPreview";

export function AuthScreen() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  return (
    <div className="auth">
      <div className="auth__inner">
      <motion.div
        className="auth__card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sentTo ? (
            <Sent key="sent" email={sentTo} onBack={() => setSentTo(null)} />
          ) : (
            <motion.div key="form" exit={{ opacity: 0, transition: { duration: 0.15 } }}>
              <div className="auth__head">
                <div className="auth__brand">
                  <Brand />
                </div>
                <h1 className="auth__title">Sign in</h1>
                <p className="auth__subtitle">Continue to your Telmanradmir workspace.</p>
              </div>

              <SocialButtons />

              <div className="divider"><span>or</span></div>

              <MagicLinkForm onSent={setSentTo} />

              <p className="auth__footer">By continuing you agree to the Terms &amp; Privacy.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

        <motion.div
          className="auth__demo"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease, delay: 0.12 } }}
        >
          <CalculatorPreview />
        </motion.div>
      </div>
    </div>
  );
}

function Sent({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <motion.div
      className="sent"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease }}
    >
      <motion.div
        className="sent__mark"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease, delay: 0.15 }}
          />
        </svg>
      </motion.div>
      <h2 className="sent__title">Check your inbox</h2>
      <p className="sent__text">
        We sent a sign-in link to <strong>{email}</strong>. It expires in 5 minutes.
      </p>
      <Button variant="secondary" full onClick={onBack}>
        Use a different email
      </Button>
      <p className="sent__again">
        Didn’t get it? <button type="button" onClick={onBack}>Try again</button>
      </p>
    </motion.div>
  );
}
