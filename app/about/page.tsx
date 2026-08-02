import type { Metadata } from "next";
import Image from "next/image";
import DocPage from "@/components/doc/doc-page";
import Reveal from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "About — Namakh",
  description:
    "Why Namakh exists: clean electrolytes, formulated by an athlete to a single standard — if it's not good enough for my loved ones, it's not good enough for anyone.",
};

/**
 * The wordmark set inline as a word of running text.
 *
 * Sizing is optical, not nominal: the asset is all-caps, so matching cap height
 * (~0.72em) rather than the full em keeps it from reading as an oversized logo.
 * Opacity knocks the pure-white PNG down to roughly --color-bone-dim on ink so
 * it sits in the sentence instead of jumping out of it.
 */
function Wordmark({
  className = "h-[0.72em] opacity-[0.72]",
  sizes = "68px",
  priority = false,
}: {
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/assets/namakh_logo.png"
      alt="Namakh"
      width={1887}
      height={408}
      priority={priority}
      /* Without `sizes` next/image ships the 1920px variant for a ~60px mark. */
      sizes={sizes}
      className={`inline-block w-auto align-baseline ${className}`}
    />
  );
}

export default function AboutPage() {
  return (
    <DocPage
      kicker="/ About"
      title="Clean Electrolytes,"
      titleAccent="actually possible."
      intro={
        <>
          Why <Wordmark priority /> exists, told by the person who made it.
        </>
      }
    >
      <Reveal>
        <div className="doc-prose max-w-2xl">
          <p>
            {/* Lead word — sized up from the inline 0.72em and lifted slightly
                in opacity so it carries the opening of the essay. */}
            <Wordmark
              className="h-[0.88em] opacity-[0.82]"
              sizes="72px"
              priority
            />{" "}
            didn’t come from the perspective of making money. I started it
            to see if making electrolytes clean was actually possible, or if
            there was a real reason every other brand loaded theirs with sugar or
            used the cheapest forms of electrolytes available. I assumed there
            had to be a good reason for it.
          </p>

          <p className="text-bone text-lg">I was wrong.</p>

          <p>Hi!</p>

          <p>
            I’m <b>Harsh</b>, and I’ve been playing competitive ultimate frisbee for
            seven years. I play club with Airborne, represent Tamil Nadu at the
            state level, and have had the privilege of representing India three
            times.
          </p>

          <p>
            What I found, once I actually looked, was that many electrolyte
            powders are designed around cost and marketing rather than
            performance. Cheap ingredients, unnecessary fillers, artificial
            colours, and more sugar than most people actually need.
          </p>

          <p>
            As an athlete, I wanted something I’d be happy drinking every day and
            confident recommending to my teammates. But I also had one rule from
            the very beginning.
          </p>

          <p>
            My brother, who runs his own food business, always says that if a
            product isn’t good enough to give to your own family, it isn’t good
            enough to sell. That idea stuck with me. So if I wouldn’t feel
            comfortable giving Namakh to my mum, my brother, or the people
            closest to me, I wasn’t going to make it.
          </p>

          <p>
            So I started reading research, comparing ingredients, calculating
            electrolyte ratios, and making my own formulations. I spent months
            testing different mineral sources, flavours, and dosages until I had
            something I genuinely trusted—not just for myself on the field, but
            for the people I love.
          </p>

          <p>Namakh is the result.</p>

          <p>
            Every ingredient is there for a reason. No fillers. No artificial
            colours. No unnecessary ingredients added just to make the label look
            more impressive. Just thoughtfully chosen electrolytes in amounts
            that make sense, using quality ingredients selected for how they
            perform, not because they were the cheapest option.
          </p>

          <p>
            Today, I use Namakh before training, during tournaments, after long
            days in the heat, and on ordinary mornings when I simply want to stay
            hydrated. More importantly, it’s the same product I’d happily hand to
            my family without a second thought.
          </p>

          <p>
            That has always been the standard behind Namakh, and it always will
            be.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="rule mt-14" />
        <p className="mt-14 max-w-2xl font-display text-2xl md:text-3xl leading-snug text-bone">
          If it’s not good enough for my loved ones, it’s not good enough for
          anyone.
        </p>
        <p className="mt-6 kicker">/ Harsh Nilesh Nisar — Founder</p>
      </Reveal>
    </DocPage>
  );
}
