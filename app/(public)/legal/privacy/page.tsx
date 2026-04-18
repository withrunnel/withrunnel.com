import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Runnel",
};

export default function PrivacyPage() {
  return (
    <article className="prose mx-auto max-w-3xl px-8 py-16 lg:px-0">
      <h1 className="mb-4 font-bold text-4xl text-foreground">
        Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-foreground/60">
        Last updated: April 17, 2026
      </p>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          1. Data Controller
        </h2>
        <p className="text-base leading-7 text-muted">
          Runnel (&quot;we&quot;, &quot;us&quot;) is the data controller for
          personal data collected through the Runnel Waitlist at withrunnel.com.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          2. Data We Collect
        </h2>
        <p className="mb-3 text-base leading-7 text-muted">
          We collect the following personal data when you join our waitlist:
        </p>
        <ul className="list-disc pl-6 text-base leading-7 text-muted">
          <li>First name and last name</li>
          <li>Email address</li>
          <li>Referral source (optional)</li>
          <li>IP address (for security and rate limiting)</li>
          <li>Consent preferences (ToS acceptance, marketing opt-in)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          3. Legal Basis (GDPR)
        </h2>
        <p className="text-base leading-7 text-muted">
          We process your data based on: (a) your consent when joining the
          waitlist and opting into marketing, (b) legitimate interest for
          security and fraud prevention, and (c) contractual necessity for
          providing the waitlist service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          4. How We Use Your Data
        </h2>
        <ul className="list-disc pl-6 text-base leading-7 text-muted">
          <li>To manage your waitlist position</li>
          <li>To send confirmation and notification emails</li>
          <li>To send marketing emails (only with your consent)</li>
          <li>To prevent abuse and ensure security</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          5. Data Sharing
        </h2>
        <p className="text-base leading-7 text-muted">
          We use Postmark for email delivery and Neon for database storage. We
          do not sell your personal data. Service providers process data under
          strict contractual obligations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          6. Your Rights (GDPR)
        </h2>
        <p className="mb-3 text-base leading-7 text-muted">
          Under GDPR, you have the right to:
        </p>
        <ul className="list-disc pl-6 text-base leading-7 text-muted">
          <li>
            <strong>Access</strong> your personal data
          </li>
          <li>
            <strong>Rectify</strong> inaccurate data
          </li>
          <li>
            <strong>Erase</strong> your data (&quot;right to be forgotten&quot;)
            — use the unsubscribe feature
          </li>
          <li>
            <strong>Restrict processing</strong> of your data
          </li>
          <li>
            <strong>Data portability</strong> — request your data in a
            machine-readable format
          </li>
          <li>
            <strong>Withdraw consent</strong> at any time for marketing
          </li>
          <li>
            <strong>Object</strong> to processing
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          7. Data Retention
        </h2>
        <p className="text-base leading-7 text-muted">
          We retain your data for the duration of the waitlist period. When you
          unsubscribe, your personal data is immediately anonymized or deleted.
          Audit logs are retained for 2 years for security compliance.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          8. Security
        </h2>
        <p className="text-base leading-7 text-muted">
          We implement industry-standard security measures including encrypted
          connections (TLS), secure authentication, rate limiting, input
          sanitization, and comprehensive audit logging.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-semibold text-xl text-foreground">
          9. Contact & DPO
        </h2>
        <p className="text-base leading-7 text-muted">
          For privacy inquiries or to exercise your rights, contact us at
          privacy@withrunnel.com. You also have the right to lodge a complaint
          with your local data protection authority.
        </p>
      </section>
    </article>
  );
}
