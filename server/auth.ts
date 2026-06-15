import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { dialect } from "./db.js";
import { env } from "./env.js";
import { sendEmail } from "./email.js";

const socialProviders = {
  ...(env.google && { google: env.google }),
  ...(env.github && { github: env.github }),
};

export const enabledProviders = {
  google: Boolean(env.google),
  github: Boolean(env.github),
};

export const auth = betterAuth({
  database: { dialect, type: "sqlite" },
  secret: env.authSecret,
  baseURL: env.authUrl,
  trustedOrigins: [env.appUrl, env.authUrl],
  socialProviders,
  plugins: [
    magicLink({
      expiresIn: 300,
      sendMagicLink: async ({ email, url }) => {
        await sendEmail(
          email,
          "Sign in to Telmanradmir",
          `Use this link to sign in:\n\n${url}\n\nIt expires in 5 minutes. If you didn't request it, ignore this email.`,
        );
      },
    }),
  ],
});
