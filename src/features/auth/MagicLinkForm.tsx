import { useState, type FormEvent } from "react";
import { signIn } from "../../lib/auth-client";
import { Button } from "../../ui/Button";
import { TextField } from "../../ui/TextField";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MagicLinkForm({ onSent }: { onSent: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!EMAIL.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error } = await signIn.magicLink({ email, callbackURL: "/" });
    setBusy(false);
    if (error) {
      setError(error.message ?? "Could not send the link. Try again.");
      return;
    }
    onSent(email);
  }

  return (
    <form className="magiclink" onSubmit={submit} noValidate>
      <TextField
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        value={email}
        invalid={!!error}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="error" role="alert">{error}</p>}
      <Button type="submit" full loading={busy}>
        Email me a sign-in link
      </Button>
    </form>
  );
}
