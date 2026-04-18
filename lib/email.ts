import { ServerClient } from "postmark";
import {
  createEmailManagementToken,
  getEmailManagementUrl,
} from "./email-management";
import { LOGO_DARK_BASE64, LOGO_LIGHT_BASE64 } from "./email-logos";

let client: ServerClient | null = null;

function getPostmark() {
  if (!client) {
    client = new ServerClient(process.env.POSTMARK_SERVER_TOKEN!);
  }
  return client;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function getEmailManagementLinks(params: {
  subscriberId?: string;
  to: string;
  firstName?: string;
  lastName?: string;
}) {
  const token = await createEmailManagementToken({
    subscriberId: params.subscriberId,
    email: params.to,
    firstName: params.firstName,
    lastName: params.lastName,
  });

  return {
    unsubscribeUrl: getEmailManagementUrl("/unsubscribe", token),
    preferencesUrl: getEmailManagementUrl("/email-preferences", token),
  };
}

function emailLayout(content: string, preheader: string, footerExtra = "") {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<!--[if mso]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<style>
  body,table,td,a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table,td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
  body { margin:0; padding:0; width:100%!important; background-color:#F4F4F2; font-family:'Geist',system-ui,-apple-system,sans-serif; color:#111114; }
  .btn { display:inline-block; padding:12px 32px; background-color:#111114; color:#F4F4F2!important; text-decoration:none; border-radius:6px; font-weight:500; font-size:16px; line-height:1; }
  .preheader { display:none!important; visibility:hidden; mso-hide:all; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }
  @media only screen and (max-width:620px) {
    .wrapper { width:100%!important; }
    .body-content { padding:32px 24px 24px!important; }
    .footer-content { padding:24px!important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F2;">
<span class="preheader">${preheader}</span>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F4F4F2;">
<tr><td align="center" style="padding:0;">
<table role="presentation" class="wrapper" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;">

  <!-- Header -->
  <tr>
    <td style="padding:24px 32px;border-bottom:1px solid #C4C4CC;">
      <img src="${LOGO_DARK_BASE64}" alt="Runnel" width="15" height="20" style="display:block;width:15px;height:20px;" />
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td class="body-content" style="padding:48px 32px 40px;background-color:#ffffff;">
      ${content}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td class="footer-content" style="padding:32px;background-color:#1C1C20;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="padding-bottom:24px;">
            <img src="${LOGO_LIGHT_BASE64}" alt="Runnel" width="18" height="24" style="display:block;width:18px;height:24px;" />
            <p style="margin:8px 0 0;font-size:13px;line-height:1.4;color:rgba(244,244,242,0.6);">&copy; 2026 Runnel, all rights reserved.</p>
            ${footerExtra}
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="top" style="padding-right:32px;">
                  <p style="margin:0 0 6px;font-weight:600;font-size:13px;color:#F4F4F2;">Social</p>
                  <p style="margin:3px 0;font-size:13px;"><a href="https://x.com/runnel" style="color:#F4F4F2;text-decoration:none;">X</a></p>
                  <p style="margin:3px 0;font-size:13px;"><a href="https://discord.gg/runnel" style="color:#F4F4F2;text-decoration:none;">Discord</a></p>
                  <p style="margin:3px 0;font-size:13px;"><a href="https://github.com/runnel" style="color:#F4F4F2;text-decoration:none;">GitHub</a></p>
                </td>
                <td valign="top">
                  <p style="margin:0 0 6px;font-weight:600;font-size:13px;color:#F4F4F2;">Legal</p>
                  <p style="margin:3px 0;font-size:13px;"><a href="${BASE_URL}/legal/terms" style="color:#F4F4F2;text-decoration:none;">Terms of Service</a></p>
                  <p style="margin:3px 0;font-size:13px;"><a href="${BASE_URL}/legal/privacy" style="color:#F4F4F2;text-decoration:none;">Privacy Policy</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:20px;border-top:1px solid rgba(244,244,242,0.1);">
            <p style="margin:0;font-size:11px;line-height:1.5;color:rgba(244,244,242,0.4);">This email was sent by Runnel. You received it because you signed up at withrunnel.com.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendConfirmationEmail(params: {
  to: string;
  firstName: string;
  confirmationToken: string;
}) {
  const confirmUrl = `${BASE_URL}/confirm?token=${params.confirmationToken}`;
  const name = params.firstName || "there";
  const html = emailLayout(
    `
      <h1 style="font-size:28px;font-weight:700;line-height:1.2;margin:0 0 20px;color:#111114;">Confirm your email</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 12px;color:#2a2a31;">Hi ${name},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 28px;color:#2a2a31;">Click the button below to secure your spot on the waitlist.</p>
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr><td>
          <a href="${confirmUrl}" class="btn" style="display:inline-block;padding:12px 32px;background-color:#111114;color:#F4F4F2;text-decoration:none;border-radius:6px;font-weight:500;font-size:16px;">Confirm my email</a>
        </td></tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;width:100%;">
        <tr><td style="background-color:#E9E9E7;padding:12px 16px;border-radius:8px;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:rgba(17,17,20,0.6);">Didn't request this? You can safely ignore this email.</p>
        </td></tr>
      </table>
    `,
    "Confirm your email to secure your spot on the Runnel waitlist.",
  );

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
  subscriberId?: string;
  to: string;
  firstName: string;
  lastName?: string;
}) {
  const { preferencesUrl, unsubscribeUrl } = await getEmailManagementLinks({
    subscriberId: params.subscriberId,
    to: params.to,
    firstName: params.firstName,
    lastName: params.lastName,
  });
  const name = params.firstName || "there";
  const html = emailLayout(
    `
      <h1 style="font-size:28px;font-weight:700;line-height:1.2;margin:0 0 20px;color:#111114;">You're on the list</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 12px;color:#2a2a31;">Hi ${name},</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 12px;color:#2a2a31;">Big things are coming - and you're first in line.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 12px;color:#2a2a31;">Your spot on the Runnel waitlist is locked in. We're putting the finishing touches on something we think you're going to love, and we can't wait to share it with you.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#2a2a31;">We'll reach out as soon as your access is ready. Until then, stay tuned.</p>
      <p style="font-size:16px;line-height:1.6;margin:0;color:#2a2a31;">See you soon,<br/>The Runnel Team</p>
    `,
    "Your spot on the Runnel waitlist is confirmed. We'll notify you when access is ready.",
    `<p style="margin:12px 0 0;"><a href="${preferencesUrl}" style="color:rgba(244,244,242,0.6);text-decoration:underline;font-size:12px;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="${unsubscribeUrl}" style="color:rgba(244,244,242,0.6);text-decoration:underline;font-size:12px;">Unsubscribe</a></p>`,
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
  subscriberId?: string;
  to: string;
  firstName: string;
  lastName?: string;
  subject: string;
  htmlContent: string;
}) {
  const { preferencesUrl, unsubscribeUrl } = await getEmailManagementLinks({
    subscriberId: params.subscriberId,
    to: params.to,
    firstName: params.firstName,
    lastName: params.lastName,
  });
  const html = emailLayout(
    params.htmlContent.replace(
      /\{\{firstName\}\}/g,
      params.firstName || "there",
    ),
    "",
    `<p style="margin:12px 0 0;"><a href="${preferencesUrl}" style="color:rgba(244,244,242,0.6);text-decoration:underline;font-size:12px;">Manage preferences</a> &nbsp;&middot;&nbsp; <a href="${unsubscribeUrl}" style="color:rgba(244,244,242,0.6);text-decoration:underline;font-size:12px;">Unsubscribe</a></p>`,
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
