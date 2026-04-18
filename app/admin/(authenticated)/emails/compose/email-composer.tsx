"use client";

import { useCallback, useState } from "react";

const VARIABLE_DOCS = [
  { name: "{{firstName}}", description: "Subscriber's first name" },
  { name: "{{lastName}}", description: "Subscriber's last name" },
  { name: "{{email}}", description: "Subscriber's email address" },
];

const DEFAULT_MDX = `# Welcome to Runnel

Hi **{{firstName}}**,

We have some exciting news to share with you.

<Button href="https://withrunnel.com">Get Started</Button>

Best regards,
The Runnel Team
`;

export function EmailComposer() {
  const [subject, setSubject] = useState("");
  const [mdxContent, setMdxContent] = useState(DEFAULT_MDX);
  const [recipientFilter, setRecipientFilter] = useState("confirmed");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
    sentCount?: number;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = useCallback(async () => {
    const res = await fetch("/api/admin/emails/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: mdxContent, subject }),
    });
    const data = await res.json();
    if (data.html) {
      setPreviewHtml(data.html);
      setShowPreview(true);
    }
  }, [mdxContent, subject]);

  const handleSend = useCallback(async () => {
    if (!subject.trim()) {
      setResult({ error: "Subject is required" });
      return;
    }
    if (!mdxContent.trim()) {
      setResult({ error: "Email content is required" });
      return;
    }
    if (!confirm("Send this email to all matching subscribers?")) return;

    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content: mdxContent,
          recipientFilter,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ success: true, sentCount: data.sentCount });
      } else {
        setResult({ error: data.error || "Failed to send" });
      }
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setSending(false);
    }
  }, [subject, mdxContent, recipientFilter]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        {/* Subject */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 rounded-lg bg-surface px-4 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
            placeholder="Email subject line... (supports {{firstName}})"
          />
        </label>

        {/* Recipient Filter */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">
            Recipients
          </span>
          <select
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            className="h-9 rounded-lg bg-surface px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
          >
            <option value="confirmed">All confirmed subscribers</option>
            <option value="marketing">Marketing opt-in only</option>
          </select>
        </label>

        {/* MDX Editor */}
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Content (MDX)
            </span>
            <span className="text-xs text-foreground/50">
              Supports Markdown + {"<Button>"} component
            </span>
          </span>
          <textarea
            value={mdxContent}
            onChange={(e) => setMdxContent(e.target.value)}
            rows={16}
            className="rounded-lg bg-surface p-4 font-mono text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20"
            placeholder="Write your email content in MDX..."
          />
        </label>

        {/* Variable Reference */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Available Variables
          </h3>
          <div className="flex flex-col gap-1">
            {VARIABLE_DOCS.map((v) => (
              <div key={v.name} className="flex items-center gap-2 text-xs">
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-foreground">
                  {v.name}
                </code>
                <span className="text-foreground/60">{v.description}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Components
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-foreground">
                {'<Button href="...">Label</Button>'}
              </code>
              <span className="text-foreground/60">CTA button</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="rounded-sm bg-foreground px-4 py-2 font-medium text-sm text-text-light transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="rounded-sm border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface"
          >
            Preview
          </button>
        </div>

        {result?.success && (
          <p className="text-sm text-green-700">
            Email sent to {result.sentCount} subscribers!
          </p>
        )}
        {result?.error && (
          <p className="text-sm text-red-700">{result.error}</p>
        )}
      </div>

      {/* Preview */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-foreground">Preview</h2>
        {showPreview ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              srcDoc={previewHtml}
              className="h-[600px] w-full"
              sandbox="allow-same-origin"
              title="Email Preview"
            />
          </div>
        ) : (
          <div className="flex h-[600px] items-center justify-center rounded-lg border border-border bg-surface/50 text-sm text-foreground/40">
            Click &quot;Preview&quot; to see the rendered email
          </div>
        )}
      </div>
    </div>
  );
}
