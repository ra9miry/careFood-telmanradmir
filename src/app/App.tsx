import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "../lib/auth-client";
import { AuthScreen } from "../features/auth/AuthScreen";
import { Calculator } from "../features/calculator/Calculator";
import { screenVariants } from "../ui/motion";

export default function App() {
  const { data, isPending } = useSession();

  if (isPending) return <div className="app" />;

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {data ? (
          <motion.div key="calc" className="screen" variants={screenVariants} initial="initial" animate="enter" exit="exit">
            <Calculator email={data.user.email} onSignOut={() => signOut()} />
          </motion.div>
        ) : (
          <motion.div key="auth" className="screen" variants={screenVariants} initial="initial" animate="enter" exit="exit">
            <AuthScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
