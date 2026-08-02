import type { Metadata } from "next";
import DocPage, { type TocEntry } from "@/components/doc/doc-page";
import DocSection from "@/components/doc/doc-section";
import DocContactBlock from "@/components/doc/doc-contact-block";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Refund & Return Policy — Namakh",
  description:
    "Simple, fair, and transparent returns. What qualifies for a replacement or refund, what we may require, and how the process works.",
};

/** Unnumbered, unlike the other policies — the source document has no numbering. */
const TOC: TocEntry[] = [
  { id: "eligible", label: "Eligible for a Replacement or Refund" },
  { id: "requirements", label: "What We May Require" },
  { id: "opened", label: "Opened Products" },
  { id: "unopened", label: "Unopened Products" },
  { id: "cancellations", label: "Order Cancellations" },
  { id: "refund-process", label: "Refund Process" },
  { id: "replacement-process", label: "Replacement Process" },
  { id: "non-returnable", label: "Non-Returnable Situations" },
  { id: "how-to-request", label: "How to Request a Refund or Return" },
  { id: "fair-use", label: "Fair Use Policy" },
  { id: "updates", label: "Policy Updates" },
  { id: "contact", label: "Contact Us" },
];

export default function RefundPolicyPage() {
  return (
    <DocPage
      kicker="/ Legal"
      title="Refund & Return"
      titleAccent="Policy."
      intro="Simple, fair, and transparent returns."
      updated="14 July 2026"
      toc={TOC}
    >
      <Reveal>
        <div className="doc-prose mb-16">
          <h2 className="font-display text-2xl md:text-[1.75rem] text-bone !mb-5">
            Our Promise
          </h2>
          <p>
            At Namakh, we’re committed to delivering products that meet the
            highest standards of quality, safety, and freshness.
          </p>
          <p>If something isn’t right with your order, we’ll do our best to make it right.</p>
          <p>
            Because our products are food and electrolyte supplements, certain
            limitations apply to protect the health and safety of all our
            customers.
          </p>
        </div>
      </Reveal>

      <DocSection id="eligible" title="Eligible for a Replacement or Refund">
        <p>You may be eligible for a replacement or refund if:</p>
        <ul>
          <li>You receive the wrong product.</li>
          <li>Your order arrives damaged during transit.</li>
          <li>The product seal is broken or tampered with upon delivery.</li>
          <li>The product arrives in an unusable condition.</li>
          <li>The order is incomplete or items are missing.</li>
          <li>The product has a manufacturing defect.</li>
        </ul>
        <p>
          To be eligible, please contact us within{" "}
          <strong>7 days of receiving your order</strong>.
        </p>
      </DocSection>

      <DocSection id="requirements" title="What We May Require">
        <p>
          To help us investigate your request quickly, we may ask for:
        </p>
        <ul>
          <li>Your order number.</li>
          <li>Photos of the product.</li>
          <li>Photos of the shipping package.</li>
          <li>The batch or lot number (if applicable).</li>
          <li>A brief description of the issue.</li>
          <li>An unboxing video (recommended for damaged deliveries).</li>
        </ul>
        <p>
          Providing complete information helps us process your request faster.
        </p>
      </DocSection>

      <DocSection id="opened" title="Opened Products">
        <p>
          Since Namakh products are consumable food supplements, we cannot
          accept returns of products that have been opened or used unless:
        </p>
        <ul>
          <li>the product is defective;</li>
          <li>the seal was already damaged upon delivery;</li>
          <li>the wrong product was delivered.</li>
        </ul>
        <p>
          This policy helps us maintain product safety and hygiene for all
          customers.
        </p>
      </DocSection>

      <DocSection id="unopened" title="Unopened Products">
        <p>If you change your mind and the product remains:</p>
        <ul>
          <li>unopened,</li>
          <li>unused,</li>
          <li>sealed in its original packaging,</li>
        </ul>
        <p>
          you may request a return within <strong>7 days of delivery</strong>.
        </p>
        <p>
          Once approved and received in acceptable condition, we’ll process your
          refund.
        </p>
        <p>
          Unless the return is due to our error, return shipping costs are the
          responsibility of the customer.
        </p>
      </DocSection>

      <DocSection id="cancellations" title="Order Cancellations">
        <p>Orders may be cancelled before they are dispatched.</p>
        <p>
          Once an order has been shipped, it cannot be cancelled. However, you
          may still be eligible for a return if your order qualifies under this
          policy.
        </p>
      </DocSection>

      <DocSection id="refund-process" title="Refund Process">
        <p>Once we receive your request:</p>
        <ol>
          <li>We review the information provided.</li>
          <li>If required, we may request additional details.</li>
          <li>Once approved, we’ll initiate your refund or replacement.</li>
          <li>Refunds are processed to the original payment method.</li>
        </ol>
        <p>
          Refunds are typically initiated within{" "}
          <strong>5–7 business days</strong> after approval.
        </p>
        <p>
          Depending on your payment provider or bank, it may take additional
          time for the amount to reflect in your account.
        </p>
      </DocSection>

      <DocSection id="replacement-process" title="Replacement Process">
        <p>
          Where appropriate, Namakh may choose to send a replacement product
          instead of issuing a refund.
        </p>
        <p>
          Replacement shipments are generally dispatched within{" "}
          <strong>2–5 business days</strong> after approval, subject to product
          availability.
        </p>
      </DocSection>

      <DocSection id="non-returnable" title="Non-Returnable Situations">
        <p>We cannot accept returns or issue refunds for:</p>
        <ul>
          <li>Opened products without a quality-related issue.</li>
          <li>Products damaged due to improper storage after delivery.</li>
          <li>
            Normal wear to external packaging during shipping that does not
            affect the product itself.
          </li>
          <li>Requests submitted more than 7 days after delivery.</li>
          <li>
            Orders with incorrect delivery information provided by the customer.
          </li>
          <li>
            Delays caused by circumstances beyond our reasonable control,
            including courier disruptions, weather conditions, or natural
            disasters.
          </li>
        </ul>
      </DocSection>

      <DocSection id="how-to-request" title="How to Request a Refund or Return">
        <p>If you need assistance, simply contact us with your order details.</p>
        <p>
          Email:{" "}
          <a href="mailto:hydratewithnamakh@gmail.com">
            hydratewithnamakh@gmail.com
          </a>
        </p>
        <p>Please include:</p>
        <ul>
          <li>Your order number.</li>
          <li>Your full name.</li>
          <li>A description of the issue.</li>
          <li>Relevant photographs or videos (if applicable).</li>
        </ul>
        <p>Our team aims to respond within 1–2 business days.</p>
      </DocSection>

      <DocSection id="fair-use" title="Fair Use Policy">
        <p>
          Our Refund &amp; Return Policy is designed to ensure every genuine
          customer has a positive experience with Namakh.
        </p>
        <p>
          To protect our customers and our business from misuse, we reserve the
          right to:
        </p>
        <ul>
          <li>verify the information provided;</li>
          <li>request additional documentation;</li>
          <li>
            decline requests that appear fraudulent, abusive, or inconsistent
            with this policy.
          </li>
        </ul>
        <p>Repeated or excessive refund requests may be reviewed individually.</p>
      </DocSection>

      <DocSection id="updates" title="Policy Updates">
        <p>
          Namakh may update this Refund &amp; Return Policy from time to time to
          reflect operational, legal, or regulatory changes.
        </p>
        <p>
          The latest version will always be available on our website with the
          revised “Last Updated” date.
        </p>
      </DocSection>

      <DocSection id="contact" title="Contact Us">
        <p>
          If you have any questions regarding returns, refunds, or replacements,
          we’re happy to help.
        </p>
        <DocContactBlock />
      </DocSection>
    </DocPage>
  );
}
