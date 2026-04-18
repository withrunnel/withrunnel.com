import { ServerClient } from "postmark";

let client: ServerClient | null = null;

function getPostmark() {
  if (!client) {
    client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN!);
  }
  return client;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

function emailLayout(content: string, footerExtra = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { margin:0; padding:0; background:#F4F4F2; font-family:'Geist',system-ui,sans-serif; color:#111114; }
  .wrapper { max-width:600px; margin:0 auto; }
  .header { padding:24px 32px; border-bottom:1px solid #C4C4CC; }
  .body { padding:48px 32px 32px; }
  .footer { background:#1C1C20; padding:32px; color:#F4F4F2; }
  .footer a { color:#F4F4F2; text-decoration:none; }
  .footer .muted { color:rgba(244,244,242,0.7); font-size:14px; }
  .btn { display:inline-block; padding:10px 32px; background:#111114; color:#F4F4F2!important; text-decoration:none; border-radius:4px; font-weight:500; font-size:16px; }
  .info-box { background:#E9E9E7; padding:12px 16px; border-radius:8px; margin-top:24px; font-size:14px; color:rgba(17,17,20,0.7); }
  h1 { font-size:36px; font-weight:700; line-height:1.2; margin:0 0 24px; }
  p { font-size:16px; line-height:1.6; margin:0 0 16px; }
  .links { display:flex; gap:24px; margin-top:8px; }
  .links a { font-size:14px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="${BASE_URL}/logo-dark.png" alt="Runnel" height="28" />
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;">
      <div>
        <img src="${BASE_URL}/logo-light.png" alt="Runnel" height="48" />
        <p class="muted" style="margin-top:8px;">&copy; 2026 Runnel, all rights reserved.</p>
        ${footerExtra}
      </div>
      <div style="text-align:right;">
        <div style="display:flex;gap:32px;justify-content:flex-end;">
          <div>
            <p style="font-weight:600;font-size:14px;margin-bottom:8px;">Social</p>
            <p style="font-size:14px;margin:4px 0;"><a href="https://x.com/runnel">X</a></p>
            <p style="font-size:14px;margin:4px 0;"><a href="https://discord.gg/runnel">Discord</a></p>
            <p style="font-size:14px;margin:4px 0;"><a href="https://github.com/runnel">GitHub</a></p>
          </div>
          <div>
            <p style="font-weight:600;font-size:14px;margin-bottom:8px;">Legal</p>
            <p style="font-size:14px;margin:4px 0;"><a href="${BASE_URL}/legal/terms">Terms of Service</a></p>
            <p style="font-size:14px;margin:4px 0;"><a href="${BASE_URL}/legal/privacy">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
    <p class="muted" style="font-size:12px;margin-top:16px;">This message has been sent to inform you of important updates to your Runnel products and services.</p>
  </div>
</div>
</body>
</html>`;
}

export async function sendConfirmationEmail(params: {
  to: string;
  firstName: string;
  confirmationToken: string;
}) {
  const confirmUrl = `${BASE_URL}/confirm?token=${params.confirmationToken}`;
  const html = emailLayout(`
    <h1>Confirm your email</h1>
    <p>Hi ${params.firstName || "there"},</p>
    <p>Click the button below to secure your spot on the waitlist.</p>
    <p style="margin:24px 0;"><a href="${confirmUrl}" class="btn">Confirm</a></p>
    <div class="info-box">Didn't request this? You can safely ignore this email.</div>
  `);

  const postmark = getPostmark();
  await postmark.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: params.to,
    Subject: "Confirm your email - Runnel Waitlist",
    HtmlBody: html,
    MessageStream: "outbound",
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  firstName: string;
}) {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(params.to)}`;
  const html = emailLayout(
    `
    <h1>You are on the list</h1>
    <p>Hi ${params.firstName || "there"},</p>
    <p>Big things are coming – and you're first in line.</p>
    <p>Your spot on the Runnel waitlist is locked in. We're putting the finishing touches on something we think you're going to love, and we can't wait to share it with you.</p>
    <p>We'll reach out as soon as your access is ready. Until then, stay tuned.</p>
    <p>See you soon,<br/>The Runnel Team</p>
  `,
    `<p style="margin-top:12px;"><a href="${unsubscribeUrl}" class="muted" style="text-decoration:underline;">Unsubscribe</a></p>`,
  );

  const postmark = getPostmark();
  await postmark.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: params.to,
    Subject: "You're on the list! - Runnel Waitlist",
    HtmlBody: html,
    MessageStream: "outbound",
  });
}

export async function sendBulkEmail(params: {
  to: string;
  firstName: string;
  subject: string;
  htmlContent: string;
}) {
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?email=${encodeURIComponent(params.to)}`;
  const html = emailLayout(
    params.htmlContent.replace(
      /\{\{firstName\}\}/g,
      params.firstName || "there",
    ),
    `<p style="margin-top:12px;"><a href="${unsubscribeUrl}" class="muted" style="text-decoration:underline;">Unsubscribe</a></p>`,
  );

  const postmark = getPostmark();
  await postmark.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL!,
    To: params.to,
    Subject: params.subject.replace(
      /\{\{firstName\}\}/g,
      params.firstName || "there",
    ),
    HtmlBody: html,
    MessageStream: "outbound",
  });
}
