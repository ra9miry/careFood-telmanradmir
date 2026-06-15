import "dotenv/config";

type Credentials = { clientId: string; clientSecret: string };

function credentials(prefix: string): Credentials | null {
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export const env = {
  port: Number(process.env.PORT ?? 8787),
  authSecret: process.env.BETTER_AUTH_SECRET ?? "dev-insecure-secret-change-me",
  authUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:8787",
  appUrl: process.env.APP_URL ?? "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL ?? "file:./server/data/app.db",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 465),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM ?? "Telmanradmir <no-reply@telmanradmir.app>",
  google: credentials("GOOGLE"),
  github: credentials("GITHUB"),
};
