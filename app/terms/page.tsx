import type { Metadata } from "next";
import Link from "next/link";
import DocPage, { type TocEntry } from "@/components/doc/doc-page";
import DocSection from "@/components/doc/doc-section";
import DocContactBlock from "@/components/doc/doc-contact-block";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Terms & Conditions — Namakh",
  description:
    "The terms governing your access to and use of www.namakh.in, including all purchases made through our website.",
};

const TOC: TocEntry[] = [
  { id: "s1", label: "1. Eligibility" },
  { id: "s2", label: "2. About Our Products" },
  { id: "s3", label: "3. Product Information & Availability" },
  { id: "s4", label: "4. Pricing" },
  { id: "s5", label: "5. Orders & Order Acceptance" },
  { id: "s6", label: "6. Payments" },
  { id: "s7", label: "7. Shipping" },
  { id: "s8", label: "8. Returns, Replacements & Refunds" },
  { id: "s9", label: "9. Intellectual Property" },
  { id: "s10", label: "10. Acceptable Use" },
  { id: "s11", label: "11. Third-Party Services" },
  { id: "s12", label: "12. Limitation of Liability" },
  { id: "s13", label: "13. Indemnification" },
  { id: "s14", label: "14. Changes to These Terms" },
  { id: "s15", label: "15. Governing Law & Jurisdiction" },
  { id: "s16", label: "16. Contact Us" },
];

export default function TermsPage() {
  return (
    <DocPage
      kicker="/ Legal"
      title="Terms &"
      titleAccent="Conditions."
      intro="Our commitment to transparency, fair use, and responsible commerce."
      updated="14 July 2026"
      toc={TOC}
    >
      <Reveal>
        <div className="doc-prose mb-16">
          <h2 className="font-display text-2xl md:text-[1.75rem] text-bone !mb-5">
            Welcome to Namakh
          </h2>
          <p>
            Welcome to Namakh (“Namakh”, “we”, “our”, or “us”). These Terms &amp;
            Conditions govern your access to and use of www.namakh.in, including
            all purchases made through our website.
          </p>
          <p>
            By accessing our website, browsing our content, or placing an order,
            you acknowledge that you have read, understood, and agree to be bound
            by these Terms &amp; Conditions. If you do not agree with any part of
            these Terms, please discontinue the use of our website and services.
          </p>
          <p>Namakh is operated by:</p>
          <p className="text-bone">
            Harsh Nilesh Nisar (Proprietor – Namakh)
            <br />
            <span className="text-bone-dim">
              No. 61, Perumal Koil Street Puducherry – 605001, India
            </span>
          </p>
        </div>
      </Reveal>

      <DocSection id="s1" index={1} title="Eligibility">
        <p>To place an order through our website, you must:</p>
        <ul>
          <li>
            Be at least 18 years of age, or use the website under the supervision
            of a parent or legal guardian.
          </li>
          <li>
            Be legally capable of entering into a binding contract under
            applicable Indian laws.
          </li>
          <li>
            Provide accurate, current, and complete information while placing an
            order.
          </li>
        </ul>
        <p>
          Namakh reserves the right to refuse service, suspend accounts, or
          cancel orders where inaccurate, misleading, fraudulent, or incomplete
          information has been provided.
        </p>
      </DocSection>

      <DocSection id="s2" index={2} title="About Our Products">
        <p>
          Namakh develops electrolyte hydration products designed to support
          hydration, performance, and everyday wellness.
        </p>
        <p>
          Our products are classified as food or dietary supplements and are not
          medicines.
        </p>
        <p>
          The information provided on this website is intended solely for
          educational and informational purposes. It should not be considered
          medical advice, diagnosis, or treatment.
        </p>
        <p>
          Namakh products are not intended to diagnose, treat, cure, or prevent
          any disease.
        </p>
        <p>
          If you are pregnant, nursing, under the age of 18, taking prescription
          medication, or have an existing medical condition—including kidney
          disease, cardiovascular disease, hypertension, or conditions requiring
          restricted sodium or potassium intake—you should consult a qualified
          healthcare professional before using our products.
        </p>
        <p>
          Individual nutritional needs and responses vary. Namakh does not
          guarantee specific health, athletic, or performance outcomes.
        </p>
        <p>
          Always consume our products according to the recommended serving
          instructions.
        </p>
      </DocSection>

      <DocSection
        id="s3"
        index={3}
        title="Product Information & Availability"
      >
        <p>
          We make every reasonable effort to ensure that product descriptions,
          nutritional information, ingredient lists, pricing, product images, and
          other information displayed on our website are accurate and up to date.
        </p>
        <p>However:</p>
        <ul>
          <li>Product images are for illustrative purposes only.</li>
          <li>
            Colours, labels, and packaging may vary slightly depending on
            manufacturing batches or your display settings.
          </li>
          <li>
            Minor formulation, packaging, or labelling updates may occur while
            maintaining applicable regulatory compliance.
          </li>
          <li>Product availability is subject to stock levels.</li>
        </ul>
        <p>
          Namakh reserves the right to modify, discontinue, replace, or limit the
          availability of any product without prior notice.
        </p>
        <p>
          Should an error relating to pricing, product information, or
          availability occur, we reserve the right to cancel the affected order
          and issue a full refund where applicable.
        </p>
      </DocSection>

      <DocSection id="s4" index={4} title="Pricing">
        <p>
          All prices displayed on www.namakh.in are listed in Indian Rupees
          (INR).
        </p>
        <p>Unless otherwise stated, prices are inclusive of applicable taxes.</p>
        <p>We reserve the right to:</p>
        <ul>
          <li>modify product pricing;</li>
          <li>introduce or withdraw promotional offers;</li>
          <li>correct pricing errors;</li>
          <li>discontinue discounts or promotional campaigns at any time.</li>
        </ul>
        <p>
          If a pricing error occurs due to technical or human error, Namakh may
          cancel the order and refund any payment already received.
        </p>
      </DocSection>

      <DocSection id="s5" index={5} title="Orders & Order Acceptance">
        <p>
          Placing an order on our website constitutes an offer to purchase our
          products.
        </p>
        <p>
          After an order is submitted, you may receive an acknowledgement
          confirming that your order request has been received.
        </p>
        <p>
          Receipt of an order confirmation email or successful payment does not
          automatically constitute acceptance of your order.
        </p>
        <p>
          Orders are considered accepted only after they have been successfully
          verified and dispatched by Namakh.
        </p>
        <p>
          We reserve the right to refuse or cancel any order for reasons
          including but not limited to:
        </p>
        <ul>
          <li>suspected fraudulent activity;</li>
          <li>pricing or technical errors;</li>
          <li>stock unavailability;</li>
          <li>inability to verify payment;</li>
          <li>regulatory or legal requirements;</li>
          <li>suspected misuse of promotional offers;</li>
          <li>circumstances beyond our reasonable control.</li>
        </ul>
        <p>
          Where payment has already been received for a cancelled order, the
          amount will be refunded to the original payment method.
        </p>
      </DocSection>

      <DocSection id="s6" index={6} title="Payments">
        <p>
          Payments on Namakh are securely processed through trusted third-party
          payment providers, including Razorpay.
        </p>
        <p>Namakh does not collect or store:</p>
        <ul>
          <li>debit or credit card details;</li>
          <li>CVV numbers;</li>
          <li>UPI PINs;</li>
          <li>net banking credentials;</li>
          <li>other sensitive payment authentication information.</li>
        </ul>
        <p>
          In the event of duplicate payments, failed transactions where funds
          have been debited, or payment-related technical issues, customers
          should contact our support team. We will work with our payment partner
          to resolve the issue promptly.
        </p>
      </DocSection>

      <DocSection id="s7" index={7} title="Shipping">
        <p>
          Shipping timelines, dispatch schedules, estimated delivery periods,
          shipping charges, and related information are governed by our{" "}
          <Link href="/shipping-policy">Shipping Policy</Link>, which forms an
          integral part of these Terms &amp; Conditions.
        </p>
        <p>
          Estimated delivery timelines are indicative only and may vary due to
          courier operations, weather conditions, public holidays, regulatory
          inspections, or other circumstances beyond our reasonable control.
        </p>
      </DocSection>

      <DocSection
        id="s8"
        index={8}
        title="Returns, Replacements & Refunds"
      >
        <p>
          Returns, replacements, cancellations, and refunds are governed by our{" "}
          <Link href="/refund-policy">Refund &amp; Return Policy</Link>, which
          forms part of these Terms &amp; Conditions.
        </p>
        <p>
          By placing an order, you acknowledge that you have read and accepted
          our Refund &amp; Return Policy.
        </p>
      </DocSection>

      <DocSection id="s9" index={9} title="Intellectual Property">
        <p>
          Unless otherwise stated, all intellectual property displayed on this
          website—including but not limited to:
        </p>
        <ul>
          <li>the Namakh name;</li>
          <li>logos;</li>
          <li>trademarks;</li>
          <li>product formulations;</li>
          <li>packaging designs;</li>
          <li>labels;</li>
          <li>photographs;</li>
          <li>illustrations;</li>
          <li>graphics;</li>
          <li>icons;</li>
          <li>videos;</li>
          <li>website design;</li>
          <li>written content;</li>
          <li>downloadable materials;</li>
        </ul>
        <p>
          are owned by or licensed to Namakh and are protected under applicable
          intellectual property laws.
        </p>
        <p>
          No content may be copied, reproduced, modified, republished,
          distributed, or commercially exploited without prior written permission
          from Namakh.
        </p>
      </DocSection>

      <DocSection id="s10" index={10} title="Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>use the website for unlawful purposes;</li>
          <li>interfere with website security or functionality;</li>
          <li>introduce malware, viruses, or malicious software;</li>
          <li>attempt unauthorized access to our systems;</li>
          <li>scrape or copy website content without authorization;</li>
          <li>impersonate another person or organisation;</li>
          <li>
            misuse referral programs, promotional offers, or discount codes;
          </li>
          <li>
            engage in any activity that may disrupt the normal operation of the
            website.
          </li>
        </ul>
        <p>
          Violation of these Terms may result in suspension of access and legal
          action where appropriate.
        </p>
      </DocSection>

      <DocSection id="s11" index={11} title="Third-Party Services">
        <p>
          Our website may use trusted third-party providers including payment
          gateways, logistics partners, analytics providers, hosting providers,
          and communication services.
        </p>
        <p>
          Your interactions with these services may also be governed by their
          respective terms and privacy policies.
        </p>
        <p>
          Namakh is not responsible for the independent practices or policies of
          these third-party providers.
        </p>
      </DocSection>

      <DocSection id="s12" index={12} title="Limitation of Liability">
        <p>
          To the maximum extent permitted under applicable law, Namakh shall not
          be liable for any indirect, incidental, consequential, or special
          damages arising from:
        </p>
        <ul>
          <li>use or misuse of our products;</li>
          <li>failure to follow usage instructions;</li>
          <li>allergic reactions or sensitivities;</li>
          <li>delays caused by courier partners;</li>
          <li>temporary website downtime;</li>
          <li>payment gateway interruptions;</li>
          <li>technical failures;</li>
          <li>events beyond our reasonable control.</li>
        </ul>
        <p>
          Nothing contained in these Terms excludes liability where such
          exclusion is prohibited by applicable law.
        </p>
      </DocSection>

      <DocSection id="s13" index={13} title="Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless Namakh, its
          proprietor, employees, affiliates, service providers, and
          representatives from any claims, liabilities, losses, damages,
          expenses, or legal costs arising out of:
        </p>
        <ul>
          <li>your breach of these Terms;</li>
          <li>misuse of the website;</li>
          <li>violation of applicable laws;</li>
          <li>infringement of third-party rights.</li>
        </ul>
      </DocSection>

      <DocSection id="s14" index={14} title="Changes to These Terms">
        <p>
          Namakh may revise these Terms &amp; Conditions periodically to reflect
          operational, legal, regulatory, or business changes.
        </p>
        <p>
          Updated versions will be published on this page together with a revised
          “Last Updated” date.
        </p>
        <p>
          Continued use of the website following such changes constitutes your
          acceptance of the updated Terms.
        </p>
      </DocSection>

      <DocSection id="s15" index={15} title="Governing Law & Jurisdiction">
        <p>
          These Terms &amp; Conditions shall be governed by the laws of India.
        </p>
        <p>
          Before initiating legal proceedings, both parties agree to make
          reasonable efforts to resolve disputes through mutual discussion.
        </p>
        <p>
          Any disputes that cannot be resolved amicably shall be subject to the
          exclusive jurisdiction of the competent courts located in Puducherry,
          India.
        </p>
      </DocSection>

      <DocSection id="s16" index={16} title="Contact Us">
        <p>
          If you have any questions regarding these Terms &amp; Conditions, your
          order, or our products, we’d be happy to assist you.
        </p>
        <DocContactBlock />
        <p className="doc-note !mt-8">
          Thank you for choosing Namakh. We appreciate your trust and are
          committed to providing safe, transparent, and reliable products and
          services.
        </p>
      </DocSection>
    </DocPage>
  );
}
