import type { FaqItem } from "~/types/productLine";
import { portableTextToPlainText } from "~/utils/portableText";

/**
 * The FAQs a page shows: only entries with both question and answer text, since Studio can save a
 * half-filled one. Feed this one list to the accordion and to `useAppSeo().getFaqPageSchema`, so
 * the visible Q&A and the FAQPage markup always match.
 */
export function publishableFaqs(faqs: FaqItem[] | null | undefined): FaqItem[] {
  return (faqs ?? []).filter(
    (faq) => Boolean(faq.question?.trim()) && Boolean(portableTextToPlainText(faq.answer).trim()),
  );
}
