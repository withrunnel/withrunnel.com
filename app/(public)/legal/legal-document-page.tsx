import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  remarkParse,
  remarkRehype,
  toJsxRuntime,
  unified,
} from "@/lib/vendor/markdown";

export type LegalDocument = {
  body: ReactNode;
  lastUpdated: string;
  title: string;
};

const proseClassName = "text-base leading-7 text-muted";

const markdownComponents = {
  a: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"a"> & { className?: string }) => (
    <a
      className={[
        "underline decoration-current/30 underline-offset-4 transition-colors hover:text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  code: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"code"> & { className?: string }) => (
    <code
      className={[
        "rounded bg-surface px-1.5 py-0.5 font-mono text-[0.95em] text-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  em: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"em"> & { className?: string }) => (
    <em className={className} {...props} />
  ),
  h2: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"h2"> & { className?: string }) => (
    <h2
      className={["pt-4 font-semibold text-foreground text-lg", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  h3: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"h3"> & { className?: string }) => (
    <h3
      className={["pt-2 font-semibold text-base text-foreground", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr
      className={["border-border/60", className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
  li: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"li"> & { className?: string }) => (
    <li
      className={[proseClassName, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
  ol: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"ol"> & { className?: string }) => (
    <ol
      className={["list-decimal space-y-2 pl-6", proseClassName, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  p: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"p"> & { className?: string }) => (
    <p
      className={[proseClassName, className].filter(Boolean).join(" ")}
      {...props}
    />
  ),
  strong: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"strong"> & { className?: string }) => (
    <strong
      className={["font-semibold text-foreground", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
  ul: ({
    className,
    ...props
  }: ComponentPropsWithoutRef<"ul"> & { className?: string }) => (
    <ul
      className={["list-disc space-y-2 pl-6", proseClassName, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
};

function parseMarkdownSource(markdown: string) {
  const normalized = markdown.trim();
  const lines = normalized.split(/\r?\n/);
  const heading = lines.shift();

  if (!heading?.startsWith("# ")) {
    throw new Error("Legal markdown must start with a level-one heading.");
  }

  while (lines[0]?.trim() === "") {
    lines.shift();
  }

  const lastUpdatedLine = lines.shift();

  if (!lastUpdatedLine?.startsWith("Last updated: ")) {
    throw new Error("Legal markdown must declare a last updated line.");
  }

  while (lines[0]?.trim() === "") {
    lines.shift();
  }

  return {
    body: lines.join("\n").trim(),
    lastUpdated: lastUpdatedLine.replace("Last updated: ", "").trim(),
    title: heading.replace("# ", "").trim(),
  };
}

function renderMarkdown(markdown: string) {
  const processor = unified().use(remarkParse).use(remarkRehype);
  const tree = processor.runSync(processor.parse(markdown));

  return toJsxRuntime(tree, {
    Fragment,
    components: markdownComponents,
    jsx,
    jsxs,
  });
}

export function createLegalDocument(markdown: string): LegalDocument {
  const parsed = parseMarkdownSource(markdown);

  return {
    body: renderMarkdown(parsed.body),
    lastUpdated: parsed.lastUpdated,
    title: parsed.title,
  };
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <article className="mx-auto max-w-3xl px-8 py-20 lg:px-0">
      <h1 className="mb-2 font-bold text-3xl text-foreground sm:text-4xl">
        {document.title}
      </h1>
      <p className="mb-10 text-sm text-muted">
        Last updated: {document.lastUpdated}
      </p>

      <div className="flex flex-col gap-4">{document.body}</div>
    </article>
  );
}
