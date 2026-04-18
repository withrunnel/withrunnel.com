import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Runnel",
};

export default function TermsPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-8 py-16 lg:px-0">
      <h1 className="mb-4 font-bold text-4xl text-foreground">
        Terms of Service
      </h1>
      <p className="mb-8 text-sm text-foreground/60">
        Last updated: April 17, 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          1. Acceptance of Terms
        </h2>
        <p className="text-base leading-7 text-muted">
          By accessing or using the Runnel waitlist service at withrunnel.com
          (&quot;Service&quot;), you agree to be bound by these Terms of
          Service. If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          2. Description of Service
        </h2>
        <p className="text-base leading-7 text-muted">
          Runnel provides a waitlist registration service that allows users to
          sign up for early access notifications. The Service collects and
          processes personal data as described in our Privacy Policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          3. User Obligations
        </h2>
        <p className="text-base leading-7 text-muted">
          You agree to provide accurate information, not use automated means to
          submit multiple registrations, and comply with all applicable laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          4. Intellectual Property
        </h2>
        <p className="text-base leading-7 text-muted">
          All content, trademarks, and intellectual property on this website are
          owned by Runnel. You may not reproduce, distribute, or create
          derivative works without our prior written consent.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          5. Limitation of Liability
        </h2>
        <p className="text-base leading-7 text-muted">
          The Service is provided &quot;as is&quot; without warranties. Runnel
          shall not be liable for any indirect, incidental, or consequential
          damages arising from your use of the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          6. Changes to Terms
        </h2>
        <p className="text-base leading-7 text-muted">
          We reserve the right to modify these terms at any time. Continued use
          of the Service constitutes acceptance of modified terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          7. Contact
        </h2>
        <p className="text-base leading-7 text-muted">
          For questions about these terms, contact us at legal@withrunnel.com.
        </p>
      </section>
    </article>
  );
}
