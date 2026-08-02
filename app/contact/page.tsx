import type { Metadata } from "next";
import Link from "next/link";
import DocPage from "@/components/doc/doc-page";
import DocSection from "@/components/doc/doc-section";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Contact — Namakh",
  description:
    "Questions about your order, our products, or hydration? Email hydratewithnamakh@gmail.com or call +91 95439 90007, Monday to Saturday, 9:00 AM – 6:00 PM IST.",
};

const EMAIL = "hydratewithnamakh@gmail.com";
const PHONE = "+91 95439 90007";

/** Label + value pair rendered in the technical mono style. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="kicker">{label}</h3>
      <div className="mt-3 text-bone leading-relaxed">{children}</div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <DocPage
      kicker="/ Contact"
      title="We’re here to"
      titleAccent="help."
      intro="Whether you have a question about your order, our products, hydration, or anything else, we’d love to hear from you."
    >
      <Reveal>
        <p className="doc-prose max-w-2xl">
          Our team personally reviews every enquiry and aims to respond as
          quickly as possible.
        </p>
      </Reveal>

      {/* Primary contact card */}
      <Reveal>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 rounded-3xl border border-line bg-ink-2 px-7 py-8 md:px-10 md:py-10">
          <Field label="/ Email">
            <a href={`mailto:${EMAIL}`} className="link-reveal break-all">
              {EMAIL}
            </a>
            <p className="mt-2 text-sm text-bone-faint">
              For all customer support, product enquiries, and general
              assistance.
            </p>
          </Field>
          <Field label="/ Phone">
            <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="link-reveal">
              {PHONE}
            </a>
          </Field>
          <Field label="/ Support Hours">
            <span className="font-mono text-sm">
              Monday – Saturday
              <br />
              9:00 AM – 6:00 PM (IST)
            </span>
          </Field>
          <Field label="/ Response Time">
            <p className="text-sm text-bone-dim">
              Our goal is to respond to all enquiries within 1 business day.
              During product launches, sales, or public holidays, responses may
              take slightly longer. We appreciate your patience.
            </p>
          </Field>
        </div>
      </Reveal>

      <div className="mt-16" />

      <DocSection title="Customer Support">
        <p>
          If you need assistance with an existing order, please include your
          Order Number in your message. This helps us resolve your request
          faster.
        </p>
        <p>We can help with:</p>
        <ul>
          <li>Order Status &amp; Tracking</li>
          <li>Shipping &amp; Delivery</li>
          <li>Returns &amp; Refunds</li>
          <li>Product Information</li>
          <li>Usage &amp; Serving Guidance</li>
          <li>General Questions</li>
        </ul>
      </DocSection>

      <DocSection title="Business Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 not-italic">
          <Field label="/ Namakh">
            <span className="text-sm text-bone-dim">
              Proprietor: Harsh Nilesh Nisar
            </span>
          </Field>
          <Field label="/ Registered Address">
            <address className="not-italic text-sm text-bone-dim leading-relaxed">
              No. 61, Perumal Koil Street
              <br />
              Puducherry – 605001
              <br />
              India
            </address>
          </Field>
          <Field label="/ FSSAI Licence">
            <span className="font-mono text-sm">23526001000347</span>
          </Field>
        </div>
      </DocSection>

      <DocSection title="Need Help With?">
        <h3 className="doc-h3">Order Tracking</h3>
        <p>
          Waiting for your order? Please include your Order Number, and we’ll
          help you track your shipment.
        </p>

        <h3 className="doc-h3">Returns &amp; Refunds</h3>
        <p>
          Need to report a damaged product or request a refund? Please include:
        </p>
        <ul>
          <li>Order Number</li>
          <li>Photos of the product</li>
          <li>Photos of the shipping package</li>
          <li>A brief description of the issue</li>
        </ul>
        <p>
          For complete details, please refer to our{" "}
          <Link href="/refund-policy">Refund &amp; Return Policy</Link>.
        </p>

        <h3 className="doc-h3">Shipping Questions</h3>
        <p>
          Questions about dispatch, delivery timelines, or shipping? Our team is
          happy to assist. For more information, please see our{" "}
          <Link href="/shipping-policy">Shipping Policy</Link>.
        </p>

        <h3 className="doc-h3">Product Questions</h3>
        <p>
          Need help choosing the right hydration blend? Have questions about
          ingredients, serving sizes, or product usage? Feel free to reach
          out—we’re always happy to help.
        </p>
      </DocSection>

      <DocSection title="Business & Partnership Enquiries">
        <p>Interested in working with Namakh? We welcome enquiries regarding:</p>
        <ul>
          <li>Wholesale Partnerships</li>
          <li>Retail Opportunities</li>
          <li>Corporate Orders</li>
          <li>Collaborations</li>
          <li>Events</li>
          <li>Brand Partnerships</li>
        </ul>
        <p>
          Please email us at{" "}
          <a href={`mailto:${EMAIL}?subject=Business%20Enquiry`}>{EMAIL}</a> with
          the subject line{" "}
          <strong className="font-mono">Business Enquiry</strong>.
        </p>
      </DocSection>

      <DocSection title="Before You Contact Us">
        <p>You may find your answer faster by visiting:</p>
        <ul>
          <li>
            <Link href="/terms">Terms &amp; Conditions</Link>
          </li>
          <li>
            <Link href="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/shipping-policy">Shipping Policy</Link>
          </li>
          <li>
            <Link href="/refund-policy">Refund &amp; Return Policy</Link>
          </li>
        </ul>
        <p>These pages answer many of the most common customer questions.</p>
      </DocSection>

      <DocSection title="Our Commitment">
        <p>
          At Namakh, we believe great customer support is just as important as
          great products.
        </p>
        <p>
          Every message is read by a real person, and we’ll always do our best to
          provide clear, honest, and timely assistance.
        </p>
        <p className="doc-note !mt-8">
          Thank you for choosing Namakh—we appreciate your trust.
        </p>
      </DocSection>
    </DocPage>
  );
}
