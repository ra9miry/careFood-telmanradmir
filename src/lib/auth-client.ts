import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";
import { authBaseUrl } from "../config/env";

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [magicLinkClient()],
});

export const { useSession, signIn, signOut } = authClient;
