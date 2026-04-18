import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { mdxToEmailHtml } from "@/lib/mdx-to-html";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, subject } = await request.json();
  const bodyHtml = mdxToEmailHtml(content);

  const previewHtml = `<!DOCTYPE html>
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
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div style="font-weight:700;font-size:18px;">✦ Runnel</div>
    ${subject ? `<div style="margin-top:8px;font-size:12px;color:#666;">Subject: ${subject.replace(/\{\{firstName\}\}/g, "Jane")}</div>` : ""}
  </div>
  <div class="body">
    ${bodyHtml
      .replace(/\{\{firstName\}\}/g, "Jane")
      .replace(/\{\{lastName\}\}/g, "Doe")
      .replace(/\{\{email\}\}/g, "jane@example.com")}
  </div>
  <div class="footer">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:24px;">
      <div>
        <div style="font-weight:700;font-size:20px;color:#F4F4F2;">✦ Runnel</div>
        <p class="muted" style="margin-top:8px;">&copy; 2026 Runnel, all rights reserved.</p>
        <p style="margin-top:12px;"><a href="#" class="muted" style="text-decoration:underline;font-size:12px;">Unsubscribe</a></p>
      </div>
      <div style="text-align:right;">
        <div style="display:flex;gap:32px;justify-content:flex-end;">
          <div>
            <p style="font-weight:600;font-size:14px;color:#F4F4F2;margin-bottom:8px;">Social</p>
            <p style="font-size:14px;margin:4px 0;color:#F4F4F2;">X</p>
            <p style="font-size:14px;margin:4px 0;color:#F4F4F2;">Discord</p>
            <p style="font-size:14px;margin:4px 0;color:#F4F4F2;">GitHub</p>
          </div>
          <div>
            <p style="font-weight:600;font-size:14px;color:#F4F4F2;margin-bottom:8px;">Legal</p>
            <p style="font-size:14px;margin:4px 0;"><a href="${BASE_URL}/legal/terms" style="color:#F4F4F2;">Terms of Service</a></p>
            <p style="font-size:14px;margin:4px 0;"><a href="${BASE_URL}/legal/privacy" style="color:#F4F4F2;">Privacy Policy</a></p>
          </div>
        </div>
      </div>
    </div>
    <p class="muted" style="font-size:12px;margin-top:16px;">This message has been sent to inform you of important updates to your Runnel products and services.</p>
  </div>
</div>
</body>
</html>`;

  return NextResponse.json({ html: previewHtml });
}
