import nodemailer from "nodemailer";
import { env } from "./env.js";

const transport =
  env.smtpHost && env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      })
    : null;

export async function sendEmail(to: string, subject: string, text: string) {
  if (!transport) {
    console.log(`\n[email → ${to}] ${subject}\n${text}\n`);
    return;
  }
  await transport.sendMail({ from: env.emailFrom, to, subject, text });
}
