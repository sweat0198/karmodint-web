/**
 * The Privacy Policy at the `/privacy-policy/` Kept URL: the client-supplied text in `docs/assets/privacy-policy.md`,
 * word for word (glossary "Kept URL": the one Kept URL whose copy is new rather than the Legacy Site's).
 * `tests/components/PrivacyPolicyArticle.spec.ts` checks the rendered page against that file line by line.
 */

export type PolicyBlock = { kind: "paragraph"; text: string } | { kind: "list"; items: readonly string[] };

export interface PolicySection {
  /** Anchor for deep links, e.g. `/privacy-policy/#cookies`. */
  id: string;
  number: number;
  title: string;
  blocks: readonly PolicyBlock[];
}

const p = (text: string): PolicyBlock => ({ kind: "paragraph", text });
const list = (...items: string[]): PolicyBlock => ({ kind: "list", items });

export const PRIVACY_POLICY = {
  lastUpdated: { label: "Last updated: 1 October 2026", iso: "2026-10-01" },
  intro: [
    "Karmod International Ltd respects your privacy and is committed to protecting your personal information.",
    "This Privacy Policy explains how we collect, use, store and protect your personal data when you contact us, request a quotation, submit an enquiry through our website or social media advertisements, or purchase products or services from us.",
  ],
  sections: [
    {
      id: "who-we-are",
      number: 1,
      title: "Who We Are",
      blocks: [
        p("Karmod International Ltd supplies modular buildings, portable cabins, security cabins, site offices and related products throughout the United Kingdom."),
        p("For the purposes of UK data protection law, Karmod International Ltd is the data controller of the personal information we collect."),
      ],
    },
    {
      id: "information-we-may-collect",
      number: 2,
      title: "Information We May Collect",
      blocks: [
        p("We may collect the following information:"),
        list(
          "Your name",
          "Email address",
          "Telephone number",
          "Delivery or site address",
          "Postcode",
          "Company name",
          "Details of the product or service you are interested in",
          "Information you provide when requesting a quotation or contacting us",
          "Correspondence between you and Karmod International Ltd",
          "Website usage information where applicable",
        ),
      ],
    },
    {
      id: "how-we-collect-your-information",
      number: 3,
      title: "How We Collect Your Information",
      blocks: [
        p("We may collect personal information when you:"),
        list(
          "Contact us through our website",
          "Complete a Facebook, Instagram or other online enquiry form",
          "Contact us by email, telephone or messaging service",
          "Request a quotation",
          "Purchase products or services from us",
          "Communicate with us regarding an existing order or enquiry",
        ),
      ],
    },
    {
      id: "how-we-use-your-information",
      number: 4,
      title: "How We Use Your Information",
      blocks: [
        p("We may use your personal information to:"),
        list(
          "Respond to your enquiry",
          "Prepare and provide quotations",
          "Contact you regarding products or services you have requested",
          "Process and manage orders",
          "Arrange delivery or installation",
          "Provide customer service and after-sales support",
          "Maintain business and accounting records",
          "Improve our products, services and customer experience",
          "Comply with legal, regulatory and tax obligations",
        ),
      ],
    },
    {
      id: "legal-basis-for-processing",
      number: 5,
      title: "Legal Basis for Processing",
      blocks: [
        p("Depending on the circumstances, we process your personal information because:"),
        list(
          "It is necessary to take steps at your request before entering into a contract",
          "It is necessary to perform a contract with you",
          "We have a legitimate business interest in responding to enquiries, providing quotations and managing customer relationships",
          "We are required to comply with legal or regulatory obligations",
          "Where required, you have provided your consent",
        ),
        p("We will not use your personal information for purposes that are incompatible with the reason it was originally collected without informing you where required."),
      ],
    },
    {
      id: "sharing-your-information",
      number: 6,
      title: "Sharing Your Information",
      blocks: [
        p("We do not sell your personal information."),
        p("Where necessary, we may share limited information with trusted third parties involved in providing our services, including:"),
        list(
          "Transport and delivery companies",
          "Installation contractors",
          "Payment providers",
          "Accountants and professional advisers",
          "IT, website and communications service providers",
          "Government, tax or regulatory authorities where legally required",
        ),
        p("We only share information where reasonably necessary for the relevant purpose."),
      ],
    },
    {
      id: "marketing",
      number: 7,
      title: "Marketing",
      blocks: [
        p("We may contact existing customers or people who have made enquiries about products or services that may be relevant to them where permitted by law."),
        p("You can ask us to stop sending marketing communications at any time by contacting us or using any unsubscribe option provided."),
      ],
    },
    {
      id: "how-long-we-keep-your-information",
      number: 8,
      title: "How Long We Keep Your Information",
      blocks: [
        p("We keep personal information only for as long as reasonably necessary for the purpose for which it was collected, including meeting legal, accounting and tax requirements."),
        p("The exact retention period may vary depending on the nature of the enquiry, transaction or legal obligation."),
      ],
    },
    {
      id: "keeping-your-information-secure",
      number: 9,
      title: "Keeping Your Information Secure",
      blocks: [
        p("We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, alteration or disclosure."),
        p("Access to personal information is limited to people who require it for legitimate business purposes."),
      ],
    },
    {
      id: "your-data-protection-rights",
      number: 10,
      title: "Your Data Protection Rights",
      blocks: [
        p("Under UK data protection law, depending on the circumstances, you may have the right to:"),
        list(
          "Request access to your personal information",
          "Ask us to correct inaccurate information",
          "Ask us to delete certain personal information",
          "Ask us to restrict how your information is used",
          "Object to certain uses of your personal information",
          "Request transfer of your information in certain circumstances",
          "Withdraw consent where processing is based on consent",
        ),
        p("You also have the right to raise a concern with the Information Commissioner’s Office (ICO) if you believe your personal information has not been handled properly."),
      ],
    },
    {
      id: "cookies",
      number: 11,
      title: "Cookies",
      blocks: [
        p("Our website may use cookies and similar technologies to operate the website, understand how visitors use it and improve the user experience."),
        p("Where required, visitors will be given the opportunity to manage non-essential cookies."),
      ],
    },
    {
      id: "third-party-websites-and-platforms",
      number: 12,
      title: "Third-Party Websites and Platforms",
      blocks: [
        p("Our website or advertisements may contain links to third-party websites or platforms such as Facebook, Instagram or other service providers."),
        p("Those organisations operate their own privacy policies, and we are not responsible for how they process personal information independently of Karmod International Ltd."),
      ],
    },
    {
      id: "changes-to-this-privacy-policy",
      number: 13,
      title: "Changes to This Privacy Policy",
      blocks: [
        p("We may update this Privacy Policy from time to time to reflect changes to our services, legal requirements or business practices."),
        p("The latest version will be published on our website."),
      ],
    },
    {
      id: "contact-us",
      number: 14,
      title: "Contact Us",
      blocks: [
        p("If you have any questions about this Privacy Policy or would like to exercise your data protection rights, please contact:"),
      ],
    },
  ],
  /** Closes section 14. Rendered as an `<address>` with live phone, email and website links. */
  contact: {
    name: "Karmod International Ltd",
    addressLines: [
      "Unit 4, Fairfield Industrial Estate",
      "Fair Farm Drive, Melton Road",
      "Waltham on the Wolds",
      "Melton Mowbray",
      "Leicestershire",
      "LE14 4AJ",
    ],
    telephone: { display: "0116 403 0143", href: "tel:+441164030143" },
    email: { display: "info@karmodint.co.uk", href: "mailto:info@karmodint.co.uk" },
    website: { display: "www.karmodint.co.uk", path: "/" },
  },
} as const satisfies {
  lastUpdated: { label: string; iso: string };
  intro: readonly string[];
  sections: readonly PolicySection[];
  contact: unknown;
};
