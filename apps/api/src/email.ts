import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, url: string) {
  await resend.emails.send({
    from: "Planora <onboarding@resend.dev>",
    to,
    subject: "Verify your email address",
    html: `
      <p>Welcome to Planora! Please verify your email address to activate your account.</p>
      <p><a href="${url}">Verify email</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
}

export async function sendResetPasswordEmail(to: string, url: string) {
  await resend.emails.send({
    from: "Planora <onboarding@resend.dev>",
    to,
    subject: "Reset your password",
    html: `
      <p>We received a request to reset your Planora password.</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
