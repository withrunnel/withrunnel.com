import type { Metadata } from "next";
import { InfoBox } from "@/components/info-box";
import { verifyEmailManagementToken } from "@/lib/email-management";
import { UnsubscribeForm } from "./unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe — Runnel",
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Unsubscribe
        </h1>
        <InfoBox>
          <p>No unsubscribe token provided.</p>
        </InfoBox>
      </section>
    );
  }

  const claims = await verifyEmailManagementToken(token);

  if (!claims) {
    return (
      <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
        <h1 className="mb-4 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
          Unsubscribe
        </h1>
        <InfoBox>
          <p>This unsubscribe link is invalid or has expired.</p>
        </InfoBox>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-8 pt-20 pb-24">
      <h1 className="mb-6 font-bold text-3xl leading-tight text-foreground sm:text-[40px]">
        Unsubscribe
      </h1>
      <UnsubscribeForm token={token} />
    </section>
  );
}
