import type { Metadata } from "next";
import { LegalDocumentPage } from "../legal-document-page";
import { termsDocument } from "./content";

export const metadata: Metadata = {
  title: `${termsDocument.title} - Runnel`,
};

export default function TermsPage() {
  return <LegalDocumentPage document={termsDocument} />;
}
