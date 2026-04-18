import type { Metadata } from "next";
import { LegalDocumentPage } from "../legal-document-page";
import { privacyDocument } from "./content";

export const metadata: Metadata = {
  title: `${privacyDocument.title} - Runnel`,
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyDocument} />;
}
