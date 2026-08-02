import type { Metadata } from "next";
import DocPage from "@/components/doc/doc-page";
import DocTabs, { type DocTab } from "@/components/doc/doc-tabs";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "FAQ — Namakh",
  description:
    "Answers on blends, mixing, daily use, shipping, and safety. Still have a question? Reach out to us at hydratewithnamakh@gmail.com.",
};

/** One question and its answer. */
function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line-soft pt-6 first:border-t-0 first:pt-0">
      <h3 className="font-display text-lg md:text-xl text-bone leading-snug">
        {q}
      </h3>
      <div className="doc-prose mt-3">{children}</div>
    </div>
  );
}

/** Heading + questions for one tab panel. */
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl md:text-[1.75rem] leading-tight text-bone">
        {title}
      </h2>
      <div className="mt-8 flex flex-col gap-8">{children}</div>
    </section>
  );
}

const TABS: DocTab[] = [
  {
    id: "products",
    label: "Products",
    content: (
      <Panel title="Products">
        <QA q="What’s the difference between Hydration, Sports, and Heart Blend?">
          <p>
            Hydration Blend is for everyday use, no added sugar, built for daily
            fluid balance. Sports Blend is dosed higher and includes a small
            amount of dextrose to help your body absorb electrolytes faster
            during intense training or competition. Heart Blend is formulated
            with a different sodium-to-potassium ratio, aimed at people mindful
            of blood pressure and cardiovascular health.
          </p>
        </QA>

        <QA q="Which blend is right for me?">
          <p>
            If you’re active daily and just want to stay properly hydrated,
            start with Hydration Blend. If you train intensely or compete, like
            ultimate frisbee, running, or team sports, Sports Blend is built for
            that output. If you’re managing blood pressure or have been advised
            to watch your sodium/potassium intake, talk to your doctor about
            whether Heart Blend fits, since it’s formulated differently from the
            other two.
          </p>
        </QA>

        <QA q="Does Namakh contain added sugar?">
          <p>
            Hydration Blend has zero added sugar. Sports Blend contains a small,
            precise amount of dextrose (see the Nutritional Values on the
            label), included specifically to help your body absorb sodium and
            water faster during activity, not for taste.
          </p>
        </QA>

        <QA q="Is Namakh vegan / allergen-free?">
          <p>
            Yes, Namakh products are vegan. All ingredients are mineral or
            plant-derived, with nothing animal-sourced. Namakh products also
            contain no known allergens. Check the ingredient list on your
            specific product label for full details.
          </p>
        </QA>
      </Panel>
    ),
  },
  {
    id: "usage",
    label: "Usage",
    content: (
      <Panel title="Usage">
        <QA q="How do I mix it?">
          <p>
            Mix 1 scoop into 500ml of water, or up to 750ml (Hydration Blend) or
            1000ml (Sports Blend) based on your preference. Sports Blend is best
            consumed before, during, or after physical activity. Hydration Blend
            can be consumed anytime throughout the day.
          </p>
        </QA>

        <QA q="Can I take Namakh every day?">
          <p>
            Yes, both blends can be taken daily. Hydration Blend is formulated
            for everyday use. Sports Blend is dosed higher because most people
            simply don’t get enough electrolytes through diet alone, and that
            higher dose supports performance and recovery whether or not that
            particular day includes intense training. Sports Blend is perfect on
            days when you’re sweating heavily or just have, and need to
            replenish what you lost. On days you’re not sweating much, Hydration
            Blend is the better fit.
          </p>
        </QA>

        <QA q="Can I take more than one scoop?">
          <p>
            Stick to the usage directions on the label per serving, but
            spreading scoops across the day, say one in the morning and one in
            the evening, is absolutely fine depending on the situation.
            Tournaments, back-to-back training sessions, or any day with
            multiple intense sessions can call for more than one serving. Just
            avoid over-concentrating a single serving; space it out rather than
            doubling up all at once.
          </p>
        </QA>
      </Panel>
    ),
  },
  {
    id: "orders-shipping",
    label: "Orders & Shipping",
    content: (
      <Panel title="Orders & Shipping">
        <QA q="How long does shipping take?">
          <p>
            We aim to dispatch orders within 2 to 3 business days. Delivery
            timelines after that depend on your location and courier schedules.
          </p>
        </QA>

        <QA q="What’s your return policy?">
          <p>
            See our <a href="/refund-policy">Refund Policy</a> page for full
            details on returns, replacements, and refunds.
          </p>
        </QA>

        <QA q="How do I track my order?">
          <p>
            You’ll receive tracking details by email once your order ships. For
            any issues, email us at{" "}
            <a href="mailto:hydratewithnamakh@gmail.com">
              hydratewithnamakh@gmail.com
            </a>{" "}
            with your order number.
          </p>
        </QA>
      </Panel>
    ),
  },
  {
    id: "safety",
    label: "Safety",
    content: (
      <Panel title="Safety">
        <QA q="Is Namakh safe if I have a medical condition?">
          <p>
            Namakh products are dietary supplements and are not intended to
            diagnose, treat, cure, or prevent any disease. If you have a medical
            condition, are pregnant, nursing, or on medication, particularly
            blood pressure medication, please consult your physician before use.
          </p>
        </QA>

        <QA q="Is Namakh FSSAI certified?">
          <p>
            Yes. Namakh is manufactured under FSSAI license no.{" "}
            <span className="font-mono text-bone">23526001000347</span>.
          </p>
        </QA>

        <QA q="How should I store Namakh?">
          <p>Store in a cool, dry space away from direct sunlight.</p>
        </QA>
      </Panel>
    ),
  },
];

export default function FaqPage() {
  return (
    <DocPage
      kicker="/ FAQ"
      title="Frequently asked"
      titleAccent="questions."
      intro="Blends, mixing, daily use, delivery, and safety — answered plainly."
    >
      <DocTabs tabs={TABS} />

      <Reveal>
        <div className="mt-20 rounded-3xl border border-line bg-ink-2 px-7 py-8 md:px-10 md:py-10">
          <p className="font-display text-xl md:text-2xl text-bone">
            Still have a question?
          </p>
          <p className="mt-3 text-bone-dim">
            Reach out to us at{" "}
            <a
              href="mailto:hydratewithnamakh@gmail.com"
              className="text-bone link-reveal"
            >
              hydratewithnamakh@gmail.com
            </a>
          </p>
        </div>
      </Reveal>
    </DocPage>
  );
}
