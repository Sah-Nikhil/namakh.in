import type { Metadata } from "next";
import DocPage, { type TocEntry } from "@/components/doc/doc-page";
import DocSection from "@/components/doc/doc-section";
import DocContactBlock from "@/components/doc/doc-contact-block";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Privacy Policy — Namakh",
  description:
    "How Namakh collects, uses, stores, and protects your information when you visit www.namakh.in, place an order, or interact with our services.",
};

const TOC: TocEntry[] = [
  { id: "s1", label: "1. Information We Collect" },
  { id: "s2", label: "2. How We Collect Information" },
  { id: "s3", label: "3. How We Use Your Information" },
  { id: "s4", label: "4. Payment Security" },
  { id: "s5", label: "5. Cookies & Website Analytics" },
  { id: "s6", label: "6. Sharing Your Information" },
  { id: "s7", label: "7. Marketing Communications" },
  { id: "s8", label: "8. Data Retention" },
  { id: "s9", label: "9. Your Rights" },
  { id: "s10", label: "10. Children’s Privacy" },
  { id: "s11", label: "11. Data Security" },
  { id: "s12", label: "12. Third-Party Websites" },
  { id: "s13", label: "13. Changes to This Policy" },
  { id: "s14", label: "14. Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <DocPage
      kicker="/ Legal"
      title="Privacy"
      titleAccent="Policy."
      intro="How we collect, use, and protect your information."
      updated="14 July 2026"
      toc={TOC}
    >
      <Reveal>
        <div className="doc-prose mb-16">
          <h2 className="font-display text-2xl md:text-[1.75rem] text-bone !mb-5">
            Your Privacy Matters
          </h2>
          <p>
            At Namakh, we believe trust extends beyond our products—it includes
            how we handle your personal information.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, and protect
            your information when you visit www.namakh.in, place an order, or
            interact with our services.
          </p>
          <p>
            By using our website, you agree to the practices described in this
            Privacy Policy.
          </p>
        </div>
      </Reveal>

      <DocSection id="s1" index={1} title="Information We Collect">
        <p>
          Depending on how you interact with Namakh, we may collect the
          following information.
        </p>

        <h3 className="doc-h3">Information You Provide</h3>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Billing address</li>
          <li>Shipping address</li>
          <li>Order details</li>
          <li>Customer support communications</li>
        </ul>

        <h3 className="doc-h3">Information Collected Automatically</h3>
        <p>
          When you browse our website, certain technical information may be
          collected automatically, including:
        </p>
        <ul>
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device type</li>
          <li>Operating system</li>
          <li>Website pages visited</li>
          <li>Time spent on pages</li>
          <li>Referral source</li>
        </ul>
        <p>
          This information helps us improve website performance and user
          experience.
        </p>
      </DocSection>

      <DocSection id="s2" index={2} title="How We Collect Information">
        <p>We collect information:</p>
        <ul>
          <li>directly from you when you place an order;</li>
          <li>when you contact our support team;</li>
          <li>when you subscribe to updates;</li>
          <li>
            through cookies and similar technologies while you browse our
            website;
          </li>
          <li>
            through trusted third-party service providers involved in processing
            payments or delivering your order.
          </li>
        </ul>
      </DocSection>

      <DocSection id="s3" index={3} title="How We Use Your Information">
        <p>
          Your information is used only for legitimate business purposes,
          including:
        </p>
        <ul>
          <li>Processing and fulfilling your orders.</li>
          <li>Delivering products to you.</li>
          <li>Sending order confirmations and shipping updates.</li>
          <li>Responding to customer support enquiries.</li>
          <li>Improving our website and customer experience.</li>
          <li>Detecting and preventing fraudulent activity.</li>
          <li>
            Complying with applicable legal and regulatory obligations.
          </li>
        </ul>
        <p>
          <strong>We do not sell your personal information.</strong>
        </p>
      </DocSection>

      <DocSection id="s4" index={4} title="Payment Security">
        <p>
          Payments made on Namakh are securely processed through trusted
          third-party payment providers, including Razorpay.
        </p>
        <p>Namakh does not store or have access to your:</p>
        <ul>
          <li>credit or debit card details;</li>
          <li>CVV;</li>
          <li>UPI PIN;</li>
          <li>net banking credentials;</li>
          <li>other sensitive payment authentication information.</li>
        </ul>
        <p>
          Payment providers process transactions using industry-standard
          security measures.
        </p>
      </DocSection>

      <DocSection id="s5" index={5} title="Cookies & Website Analytics">
        <p>
          Our website may use cookies and similar technologies to:
        </p>
        <ul>
          <li>remember your preferences;</li>
          <li>keep your shopping experience smooth;</li>
          <li>understand website usage;</li>
          <li>improve website performance.</li>
        </ul>
        <p>Cookies do not give us access to your device or personal files.</p>
        <p>
          Most web browsers allow you to disable cookies through your browser
          settings. Please note that certain website features may not function
          correctly if cookies are disabled.
        </p>
      </DocSection>

      <DocSection id="s6" index={6} title="Sharing Your Information">
        <p>
          We only share your information when necessary to operate our business.
        </p>
        <p>Your information may be shared with:</p>
        <ul>
          <li>payment providers;</li>
          <li>shipping and logistics partners;</li>
          <li>website hosting providers;</li>
          <li>technology service providers;</li>
          <li>government authorities where required by law.</li>
        </ul>
        <p>
          <strong>
            We do not sell, rent, or trade your personal information to third
            parties.
          </strong>
        </p>
      </DocSection>

      <DocSection id="s7" index={7} title="Marketing Communications">
        <p>
          If you choose to subscribe to our emails or promotional updates, we
          may occasionally send information about:
        </p>
        <ul>
          <li>new product launches;</li>
          <li>offers and promotions;</li>
          <li>educational content;</li>
          <li>company updates.</li>
        </ul>
        <p>
          You may unsubscribe from marketing emails at any time using the
          unsubscribe link included in our communications or by contacting us
          directly.
        </p>
      </DocSection>

      <DocSection id="s8" index={8} title="Data Retention">
        <p>
          We retain customer information only for as long as necessary to:
        </p>
        <ul>
          <li>fulfil your orders;</li>
          <li>provide customer support;</li>
          <li>comply with tax and legal obligations;</li>
          <li>resolve disputes;</li>
          <li>maintain business records.</li>
        </ul>
        <p>
          When information is no longer required, we take reasonable steps to
          securely delete or anonymise it.
        </p>
      </DocSection>

      <DocSection id="s9" index={9} title="Your Rights">
        <p>You may request to:</p>
        <ul>
          <li>access your personal information;</li>
          <li>correct inaccurate information;</li>
          <li>update your contact details;</li>
          <li>
            request deletion of your personal information where legally
            permissible.
          </li>
        </ul>
        <p>
          To exercise these rights, please contact us using the details provided
          below.
        </p>
      </DocSection>

      <DocSection id="s10" index={10} title="Children’s Privacy">
        <p>
          Namakh products and services are intended for individuals aged 18
          years and above.
        </p>
        <p>We do not knowingly collect personal information from children.</p>
        <p>
          If we become aware that personal information belonging to a child has
          been collected, we will take reasonable steps to delete it.
        </p>
      </DocSection>

      <DocSection id="s11" index={11} title="Data Security">
        <p>
          We take reasonable administrative, technical, and organisational
          measures to protect your information against:
        </p>
        <ul>
          <li>unauthorised access;</li>
          <li>accidental loss;</li>
          <li>misuse;</li>
          <li>alteration;</li>
          <li>disclosure.</li>
        </ul>
        <p>
          Although we take appropriate precautions, no method of electronic
          storage or internet transmission can be guaranteed to be completely
          secure.
        </p>
      </DocSection>

      <DocSection id="s12" index={12} title="Third-Party Websites">
        <p>
          Our website may contain links to third-party websites for your
          convenience.
        </p>
        <p>
          Namakh is not responsible for the privacy practices, security, or
          content of external websites.
        </p>
        <p>
          We encourage you to review the privacy policies of any third-party
          websites you visit.
        </p>
      </DocSection>

      <DocSection id="s13" index={13} title="Changes to This Privacy Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect
          operational, legal, or regulatory changes.
        </p>
        <p>
          The most current version will always be available on this page
          together with the updated “Last Updated” date.
        </p>
        <p>
          Continued use of our website after changes have been published
          constitutes acceptance of the revised Privacy Policy.
        </p>
      </DocSection>

      <DocSection id="s14" index={14} title="Contact Us">
        <p>
          If you have any questions regarding this Privacy Policy or your
          personal information, we’d be happy to assist you.
        </p>
        <DocContactBlock />
        <p className="doc-note !mt-8">
          At Namakh, protecting your privacy is part of our commitment to
          earning your trust—both online and in every order we deliver.
        </p>
      </DocSection>
    </DocPage>
  );
}
