import type { Metadata } from "next";
import Link from "next/link";
import DocPage, { type TocEntry } from "@/components/doc/doc-page";
import DocSection from "@/components/doc/doc-section";
import DocContactBlock from "@/components/doc/doc-contact-block";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Shipping Policy — Namakh",
  description:
    "Everything you need to know about how your Namakh order reaches you — processing, charges, delivery timelines, tracking, and delays.",
};

const TOC: TocEntry[] = [
  { id: "s1", label: "1. Order Processing" },
  { id: "s2", label: "2. Order Confirmation" },
  { id: "s3", label: "3. Shipping Charges" },
  { id: "s4", label: "4. Delivery Timelines" },
  { id: "s5", label: "5. Order Tracking" },
  { id: "s6", label: "6. Delivery Delays" },
  { id: "s7", label: "7. Incorrect Shipping Information" },
  { id: "s8", label: "8. Failed Delivery Attempts" },
  { id: "s9", label: "9. Damaged or Lost Shipments" },
  { id: "s10", label: "10. International Shipping" },
  { id: "s11", label: "11. Changes to Shipping Policy" },
  { id: "s12", label: "12. Contact Us" },
];

const DELIVERY_TIMELINES: [string, string][] = [
  ["Metro Cities", "2–4 Business Days"],
  ["Tier 2 & Tier 3 Cities", "3–6 Business Days"],
  ["Remote Locations", "5–8 Business Days"],
];

export default function ShippingPolicyPage() {
  return (
    <DocPage
      kicker="/ Legal"
      title="Shipping"
      titleAccent="Policy."
      intro="Everything you need to know about how your Namakh order reaches you."
      updated="14 July 2026"
      toc={TOC}
    >
      <Reveal>
        <div className="doc-prose mb-16">
          <h2 className="font-display text-2xl md:text-[1.75rem] text-bone !mb-5">
            Our Commitment
          </h2>
          <p>
            At Namakh, we strive to deliver every order safely, efficiently, and
            as quickly as possible. Every shipment is carefully packed to ensure
            your products arrive in excellent condition.
          </p>
          <p>
            While we work with trusted courier partners, delivery timelines may
            occasionally vary due to circumstances beyond our control.
          </p>
        </div>
      </Reveal>

      <DocSection id="s1" index={1} title="Order Processing">
        <p>
          Orders are processed on business days (Monday to Saturday, excluding
          public holidays).
        </p>
        <p>
          Once your order has been placed and payment has been successfully
          received, we aim to process and prepare your order within{" "}
          <strong>1–2 business days</strong>.
        </p>
        <p>
          During periods of high demand, product launches, or promotional
          campaigns, processing times may be slightly longer.
        </p>
      </DocSection>

      <DocSection id="s2" index={2} title="Order Confirmation">
        <p>After placing your order, you will receive:</p>
        <ul>
          <li>An Order Confirmation email.</li>
          <li>
            A Shipping Confirmation email once your order has been dispatched.
          </li>
        </ul>
        <p>
          The Shipping Confirmation email will include your tracking details
          whenever available.
        </p>
        <p>
          If you do not receive an order confirmation within a reasonable time,
          please contact us.
        </p>
      </DocSection>

      <DocSection id="s3" index={3} title="Shipping Charges">
        <p>
          Shipping charges, if applicable, are calculated and displayed during
          checkout before payment.
        </p>
        <p>From time to time, Namakh may offer:</p>
        <ul>
          <li>Free shipping promotions.</li>
          <li>Discounted shipping offers.</li>
          <li>Minimum order value benefits.</li>
        </ul>
        <p>
          Such promotions may be modified or withdrawn without prior notice.
        </p>
      </DocSection>

      <DocSection id="s4" index={4} title="Delivery Timelines">
        <p>Estimated delivery timelines after dispatch are:</p>

        <div className="!mt-6 overflow-x-auto rounded-2xl border border-line bg-ink-2">
          <table className="w-full min-w-[22rem] text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="kicker px-6 py-4 font-normal">Region</th>
                <th className="kicker px-6 py-4 font-normal">
                  Estimated Delivery
                </th>
              </tr>
            </thead>
            <tbody>
              {DELIVERY_TIMELINES.map(([region, estimate]) => (
                <tr
                  key={region}
                  className="border-b border-line-soft last:border-b-0"
                >
                  <td className="px-6 py-4 text-bone">{region}</td>
                  <td className="px-6 py-4 font-mono text-sm text-bone-dim">
                    {estimate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="!mt-6">
          These timelines are estimates only and are not guaranteed.
        </p>
        <p>Actual delivery times may vary depending on:</p>
        <ul>
          <li>Courier operations.</li>
          <li>Weather conditions.</li>
          <li>Public holidays.</li>
          <li>Natural disasters.</li>
          <li>Government restrictions.</li>
          <li>Other unforeseen logistical circumstances.</li>
        </ul>
      </DocSection>

      <DocSection id="s5" index={5} title="Order Tracking">
        <p>
          Once your order has been shipped, you will receive tracking
          information via email or SMS (where applicable).
        </p>
        <p>
          You can use the provided tracking link to monitor your shipment’s
          progress.
        </p>
        <p>
          If you do not receive tracking information within{" "}
          <strong>48 hours</strong> of placing your order, please contact us.
        </p>
      </DocSection>

      <DocSection id="s6" index={6} title="Delivery Delays">
        <p>
          While we make every effort to ensure timely deliveries, occasional
          delays may occur.
        </p>
        <p>Namakh is not responsible for delays caused by:</p>
        <ul>
          <li>Courier partners.</li>
          <li>Weather events.</li>
          <li>Public holidays.</li>
          <li>Transportation disruptions.</li>
          <li>Regulatory inspections.</li>
          <li>Force majeure events.</li>
        </ul>
        <p>
          If your shipment experiences an unusual delay, our support team will
          gladly assist you in coordinating with the courier partner.
        </p>
      </DocSection>

      <DocSection id="s7" index={7} title="Incorrect Shipping Information">
        <p>
          Customers are responsible for providing accurate shipping information
          during checkout.
        </p>
        <p>If an incorrect address, phone number, or PIN code is provided:</p>
        <ul>
          <li>Delivery may be delayed.</li>
          <li>Additional shipping charges may apply.</li>
          <li>The shipment may be returned to us.</li>
        </ul>
        <p>
          If your order has not yet been dispatched, please contact us
          immediately so we can attempt to update your shipping information.
        </p>
        <p>
          Once an order has been shipped, address changes may not be possible.
        </p>
      </DocSection>

      <DocSection id="s8" index={8} title="Failed Delivery Attempts">
        <p>
          Courier partners generally make multiple delivery attempts before
          returning a package.
        </p>
        <p>If delivery cannot be completed because:</p>
        <ul>
          <li>the customer is unavailable,</li>
          <li>the address is incorrect,</li>
          <li>the package is refused,</li>
        </ul>
        <p>the shipment may be returned to Namakh.</p>
        <p>
          Additional shipping charges may apply for reshipping returned orders.
        </p>
      </DocSection>

      <DocSection id="s9" index={9} title="Damaged or Lost Shipments">
        <p>If your order arrives:</p>
        <ul>
          <li>damaged,</li>
          <li>tampered with,</li>
          <li>incomplete,</li>
          <li>or appears to have been lost in transit,</li>
        </ul>
        <p>
          please contact us within <strong>48 hours</strong> of delivery (or the
          expected delivery date for lost shipments).
        </p>
        <p>To help us investigate quickly, we may request:</p>
        <ul>
          <li>Your order number.</li>
          <li>Photographs of the package.</li>
          <li>Photographs of the product.</li>
          <li>An unboxing video (recommended for transit damage).</li>
        </ul>
        <p>
          Once verified, we will work towards providing an appropriate
          resolution, which may include a replacement or refund in accordance
          with our <Link href="/refund-policy">Refund &amp; Return Policy</Link>.
        </p>
      </DocSection>

      <DocSection id="s10" index={10} title="International Shipping">
        <p>
          At present, <strong>Namakh ships only within India.</strong>
        </p>
        <p>
          If international shipping becomes available in the future, this page
          will be updated with the relevant countries, shipping rates, customs
          information, and estimated delivery timelines.
        </p>
      </DocSection>

      <DocSection id="s11" index={11} title="Changes to This Shipping Policy">
        <p>
          Namakh may revise this Shipping Policy from time to time to reflect
          operational improvements, legal requirements, or changes to our
          logistics network.
        </p>
        <p>
          The latest version will always be available on this page with the
          updated “Last Updated” date.
        </p>
      </DocSection>

      <DocSection id="s12" index={12} title="Contact Us">
        <p>
          If you have any questions regarding your shipment, delivery status, or
          shipping policy, we’re happy to help.
        </p>
        <DocContactBlock />
        <p className="doc-note !mt-8">
          Thank you for choosing Namakh. Every order is packed with care, and
          we’re committed to delivering it safely to your doorstep.
        </p>
      </DocSection>
    </DocPage>
  );
}
