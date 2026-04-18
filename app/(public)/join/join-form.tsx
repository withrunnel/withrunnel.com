"use client";

import { Checkbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { useActionState } from "react";
import { InfoBox } from "@/components/info-box";
import { joinWaitlist } from "./actions";

const inputClassName =
  "h-9 w-full rounded-lg bg-surface px-4 font-sans text-sm text-foreground outline-none placeholder:text-foreground/40 focus:ring-2 focus:ring-foreground/20";

const labelClassName = "text-sm leading-5 text-foreground/70";

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentcolor"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      role="img"
      aria-hidden="true"
      {...props}
    >
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

export function JoinForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, null);

  if (state?.success) {
    return (
      <div className="flex flex-col gap-4">
        <InfoBox className="flex items-center gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-foreground/50"
            role="img"
            aria-hidden="true"
          >
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
          </svg>
          <div>
            <p className="text-sm text-foreground">
              Almost there! Please check your inbox and click the confirmation
              link to secure your spot.
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              Don&apos;t see it? Please check your spam folder or{" "}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  fetch("/api/resend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: state.email }),
                  });
                }}
              >
                resend mail
              </button>
              .
            </p>
          </div>
        </InfoBox>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <InfoBox>
          <p className="text-sm text-red-700">{state.error}</p>
        </InfoBox>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex gap-8">
          <Field.Root name="firstName" className="flex flex-1 flex-col gap-2">
            <Field.Label className={labelClassName}>First name</Field.Label>
            <Input required className={inputClassName} placeholder="Jane" />
          </Field.Root>
          <Field.Root name="lastName" className="flex flex-1 flex-col gap-2">
            <Field.Label className={labelClassName}>Last Name</Field.Label>
            <Input required className={inputClassName} placeholder="Doe" />
          </Field.Root>
        </div>

        <Field.Root name="email" className="flex flex-col gap-2">
          <Field.Label className={labelClassName}>Email</Field.Label>
          <Input
            type="email"
            required
            className={inputClassName}
            placeholder="jane@example.com"
          />
        </Field.Root>

        <Field.Root name="referralSource" className="flex flex-col gap-2">
          <Field.Label className={labelClassName}>
            Where did you hear about Runnel? (optional)
          </Field.Label>
          <Input
            className={inputClassName}
            placeholder="Twitter, friend, blog..."
          />
        </Field.Root>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm leading-5 text-foreground/70">
          <Checkbox.Root
            name="tosAccepted"
            required
            className="flex size-3.5 items-center justify-center rounded-sm border border-foreground/70 data-[checked]:bg-foreground data-[checked]:border-foreground"
          >
            <Checkbox.Indicator className="text-text-light data-[unchecked]:hidden">
              <CheckIcon className="size-2.5" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span>
            <span className="text-foreground/70">* </span>I agree to the Runnel{" "}
            <a href="/legal/terms" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/legal/privacy" className="underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm leading-5 text-foreground/70">
          <Checkbox.Root
            name="marketingEmails"
            className="flex size-3.5 items-center justify-center rounded-sm border border-foreground/70 data-[checked]:bg-foreground data-[checked]:border-foreground"
          >
            <Checkbox.Indicator className="text-text-light data-[unchecked]:hidden">
              <CheckIcon className="size-2.5" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          I&apos;d like to receive marketing emails and updates
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-sm bg-foreground px-4 py-2 pr-8 font-medium text-base leading-6 text-text-light transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Joining..." : "Join"}
      </button>
    </form>
  );
}
