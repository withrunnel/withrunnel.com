import type { Metadata } from "next";
import { InfoBox } from "@/components/info-box";
import { TurnstileScript } from "@/components/turnstile-script";
import { verifyEmailManagementToken } from "@/lib/email-management";
import { ResubscribeForm } from "./resubscribe-form";

export const metadata: Metadata = {
  title: "Resubscribe - Runnel",
};

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);

export default async function ResubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Resubscribe
        </h1>
        <InfoBox>
          <p>No resubscribe token provided.</p>
        </InfoBox>
      </section>
    );
  }

  const claims = await verifyEmailManagementToken(token);

  if (!claims) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Resubscribe
        </h1>
        <InfoBox>
          <p>This resubscribe link is invalid or has expired.</p>
        </InfoBox>
      </section>
    );
  }

  return (
    <>
      {TURNSTILE_ENABLED ? <TurnstileScript /> : null}
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <ResubscribeForm
          token={token}
          email={claims.email}
          turnstileSiteKey={TURNSTILE_SITE_KEY}
        />
      </section>
    </>
  );
}
