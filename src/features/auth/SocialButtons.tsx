import { useEffect, useState, type ReactNode } from "react";
import { signIn } from "../../lib/auth-client";
import { authBaseUrl } from "../../config/env";
import { Button } from "../../ui/Button";
import type { EnabledProviders, SocialProvider } from "../../types";

const PROVIDERS: { id: SocialProvider; label: string; icon: ReactNode }[] = [
  { id: "google", label: "Continue with Google", icon: <GoogleIcon /> },
  { id: "github", label: "Continue with GitHub", icon: <GitHubIcon /> },
];

export function SocialButtons() {
  const [enabled, setEnabled] = useState<EnabledProviders | null>(null);
  const [pending, setPending] = useState<SocialProvider | null>(null);

  useEffect(() => {
    fetch(`${authBaseUrl ?? ""}/api/providers`)
      .then((r) => r.json())
      .then(setEnabled)
      .catch(() => setEnabled({ google: false, github: false }));
  }, []);

  const start = async (provider: SocialProvider) => {
    setPending(provider);
    await signIn.social({ provider, callbackURL: "/" });
  };

  return (
    <div className="social">
      {PROVIDERS.map(({ id, label, icon }) => {
        const ready = enabled?.[id] ?? false;
        return (
          <Button
            key={id}
            variant="secondary"
            full
            onClick={() => start(id)}
            disabled={!ready}
            loading={pending === id}
            title={ready ? undefined : "Add provider credentials to enable"}
          >
            <span className="social__icon" aria-hidden="true">{icon}</span>
            {label}
          </Button>
        );
      })}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5 0-.7-.1-1.4-.2-2.1H12z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.6c-.9.6-2 1-3.3 1-2.6 0-4.7-1.7-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
      <path fill="#FBBC05" d="M6.5 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z" />
      <path fill="#4285F4" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.4 2.6C7.3 7.7 9.4 6.1 12 6.1z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.300-4.6-1.1-4.6-5a4 4 0 0 1 1-2.7c-.1-.3-.5-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .6 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
    </svg>
  );
}
