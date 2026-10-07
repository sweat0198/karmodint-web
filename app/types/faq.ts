import type { PortableTextTextBlock } from "~/types/portableText";

/** One question and its answer (the `faqItem` object Product Lines and Solutions share). */
export interface FaqItem {
  _key?: string;
  question: string;
  answer: PortableTextTextBlock[];
}
