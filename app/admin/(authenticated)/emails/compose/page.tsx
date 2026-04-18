import { EmailComposer } from "./email-composer";

export default function ComposeEmailPage() {
  return (
    <div className="p-8">
      <h1 className="mb-8 font-bold text-3xl text-foreground">Compose Email</h1>
      <EmailComposer />
    </div>
  );
}
