import Link from "next/link";
import { IconExternalLink, IconPackage } from "@tabler/icons-react";
import Navbar from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/ui/footer-modern";
import OrderSummary from "@/components/checkout/order-summary";
import OrderTimeline from "@/components/track/order-timeline";
import { api } from "@/convex/_generated/api";
import { convexServerClient } from "@/lib/convex-server";
import { COMMERCE } from "@/lib/commerce/config";
import { STATUS_COPY } from "@/lib/commerce/tracking";

export const metadata = { title: "Track your order — Namakh" };

/** Every order is different, and the token is in the URL. Never cache this. */
export const dynamic = "force-dynamic";

function NotFound({ reason }: { reason: string }) {
  return (
    <div className="rounded-3xl border border-line bg-ink-2 px-7 py-14 md:px-12">
      <span className="kicker">/ Tracking</span>
      <h1 className="display-xl mt-4 text-3xl text-bone md:text-5xl">
        We could not open that order
      </h1>
      <p className="mt-5 max-w-lg text-bone-dim">{reason}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/track"
          className="rounded-full bg-bone px-8 py-3.5 text-center text-sm font-medium text-ink transition-colors hover:bg-salt"
        >
          Look up by order number
        </Link>
        <a
          href={`mailto:${COMMERCE.support.email}`}
          className="rounded-full border border-line px-8 py-3.5 text-center text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
        >
          Email support
        </a>
      </div>
    </div>
  );
}

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { orderNumber } = await params;
  const { t: token } = await searchParams;

  const shell = (children: React.ReactNode) => (
    <div className="grain relative min-h-screen bg-ink text-bone font-sans">
      <Navbar />
      <MobileNav />
      <main className="relative z-[2] mx-auto max-w-4xl px-5 pb-32 pt-28 md:px-10 md:pt-40">
        {children}
      </main>
      <Footer />
    </div>
  );

  if (!token) {
    return shell(
      <NotFound reason="That link is missing its tracking code. Use the full link from your confirmation page, or look the order up with your order number and email." />,
    );
  }

  const order = await convexServerClient().query(api.orders.getByToken, {
    orderNumber: decodeURIComponent(orderNumber),
    token,
  });

  if (!order) {
    return shell(
      <NotFound reason="This tracking link is not valid for that order number. Links are unique to each order, so check you copied the whole thing." />,
    );
  }

  const copy = STATUS_COPY[order.status];

  return shell(
    <>
      <header className="mb-10">
        <span className="kicker">/ Order {order.orderNumber}</span>
        <h1 className="display-xl mt-4 text-4xl text-bone md:text-6xl">{copy.label}</h1>
        <p className="mt-5 max-w-xl text-lg text-bone-dim">{copy.blurb}</p>

        {order.awb && (
          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-line bg-ink-2 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <IconPackage className="h-5 w-5 shrink-0 text-bone-dim" />
              <div>
                <p className="text-sm text-bone">{order.courier ?? "Courier"}</p>
                <p className="font-mono-jb text-xs text-bone-faint">AWB {order.awb}</p>
              </div>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
              >
                Live courier scans <IconExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-line bg-ink-2 p-6 md:p-7">
          <h2 className="mb-6 font-display text-lg text-bone">Progress</h2>
          <OrderTimeline status={order.status} events={order.events} />
        </div>

        <div className="space-y-8">
          <OrderSummary lines={order.lines} totals={order.totals} title="Your order" />

          <div className="rounded-3xl border border-line bg-ink-2 p-6 md:p-7">
            <h2 className="font-display text-lg text-bone">Delivering to</h2>
            <address className="mt-4 text-sm not-italic leading-relaxed text-bone-dim">
              {order.address.fullName}
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.address.phone}
            </address>
            <p className="mt-5 border-t border-line pt-5 text-xs text-bone-faint">
              Wrong address? Email{" "}
              <a
                href={`mailto:${COMMERCE.support.email}?subject=Order%20${order.orderNumber}`}
                className="text-bone-dim underline underline-offset-2"
              >
                {COMMERCE.support.email}
              </a>{" "}
              before it ships and we will fix it.
            </p>
          </div>
        </div>
      </div>
    </>,
  );
}
