export function mdxToEmailHtml(mdx: string): string {
  let html = mdx;

  html = html.replace(
    /<Button\s+href="([^"]+)">([\s\S]*?)<\/Button>/g,
    '<p style="margin:24px 0;"><a href="$1" style="display:inline-block;padding:10px 32px;background:#111114;color:#F4F4F2;text-decoration:none;border-radius:4px;font-weight:500;font-size:16px;">$2</a></p>',
  );

  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (trimmed.startsWith("# ")) {
      result.push(
        `<h1 style="font-size:36px;font-weight:700;line-height:1.2;margin:0 0 24px;">${trimmed.slice(2)}</h1>`,
      );
    } else if (trimmed.startsWith("## ")) {
      result.push(
        `<h2 style="font-size:24px;font-weight:600;line-height:1.3;margin:24px 0 16px;">${trimmed.slice(3)}</h2>`,
      );
    } else if (trimmed.startsWith("### ")) {
      result.push(
        `<h3 style="font-size:20px;font-weight:600;line-height:1.4;margin:20px 0 12px;">${trimmed.slice(4)}</h3>`,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        result.push(
          '<ul style="margin:0 0 16px;padding-left:24px;list-style:disc;">',
        );
        inList = true;
      }
      result.push(
        `<li style="font-size:16px;line-height:1.6;margin:4px 0;">${processInline(trimmed.slice(2))}</li>`,
      );
    } else if (trimmed.startsWith("---")) {
      result.push(
        '<hr style="border:none;border-top:1px solid #C4C4CC;margin:24px 0;" />',
      );
    } else if (trimmed.startsWith("<")) {
      result.push(trimmed);
    } else {
      result.push(
        `<p style="font-size:16px;line-height:1.6;margin:0 0 16px;">${processInline(trimmed)}</p>`,
      );
    }
  }

  if (inList) {
    result.push("</ul>");
  }

  return result.join("\n");
}

function processInline(text: string): string {
  let result = text;
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color:#111114;text-decoration:underline;">$1</a>',
  );
  result = result.replace(
    /`([^`]+)`/g,
    '<code style="background:#E9E9E7;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:14px;">$1</code>',
  );
  return result;
}
