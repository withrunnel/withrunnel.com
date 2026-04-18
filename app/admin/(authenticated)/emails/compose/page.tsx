import { TurnstileScript } from "@/components/turnstile-script";
import { EmailComposer } from "./email-composer";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
const TURNSTILE_ENABLED = Boolean(TURNSTILE_SITE_KEY);

export default function ComposeEmailPage() {
  return (
    <>
      {TURNSTILE_ENABLED ? <TurnstileScript /> : null}
      <div className="p-8">
        <h1 className="mb-8 font-bold text-3xl text-foreground">
          Compose Email
        </h1>
        <EmailComposer turnstileSiteKey={TURNSTILE_SITE_KEY} />
      </div>
    </>
  );
}
