"use client";

import { useState } from "react";
import { useConvexAuth, usePaginatedQuery, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { IconLoader2, IconLogout, IconRefresh } from "@tabler/icons-react";
import { api } from "@/convex/_generated/api";
import AdminSignIn from "@/components/admin/sign-in";
import OrderRow from "@/components/admin/order-row";
import SubscribersPanel from "@/components/admin/subscribers-panel";
import type { OrderStatus } from "@/lib/commerce/types";

const FILTERS: { label: string; status?: OrderStatus }[] = [
  { label: "All" },
  { label: "Awaiting payment", status: "awaiting_payment" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Packed", status: "packed" },
  { label: "Shipped", status: "shipped" },
  { label: "Delivered", status: "delivered" },
];

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const me = useQuery(api.admin.me, isAuthenticated ? {} : "skip");
  const [filter, setFilter] = useState<OrderStatus | undefined>(undefined);
  const [view, setView] = useState<"orders" | "subscribers">("orders");

  const allowed = isAuthenticated && me !== null && me !== undefined;

  const orders = usePaginatedQuery(
    api.admin.listOrders,
    allowed && view === "orders" ? { status: filter } : "skip",
    { initialNumItems: 25 },
  );

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <IconLoader2 className="h-5 w-5 animate-spin text-bone-faint" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-5 py-16 font-sans">
        <AdminSignIn notAllowed={isAuthenticated && me === null} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink font-sans text-bone">
      <header className="border-b border-line px-5 py-5 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div>
            <span className="kicker">/ Namakh</span>
            <h1 className="font-display text-2xl text-bone">
              {view === "orders" ? "Orders" : "Subscribers"}
            </h1>
          </div>
          <nav className="flex gap-1 rounded-full border border-line p-1 text-xs">
            {(["orders", "subscribers"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                className={`rounded-full px-4 py-1.5 capitalize transition-colors ${
                  view === option ? "bg-ink-3 text-bone" : "text-bone-faint hover:text-bone-dim"
                }`}
              >
                {option}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-bone-faint sm:block">{me.email}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
            >
              <IconLogout className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        {view === "subscribers" ? (
          <SubscribersPanel />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setFilter(option.status)}
                  className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
                    filter === option.status
                      ? "border-bone/40 bg-ink-3 text-bone"
                      : "border-line text-bone-faint hover:text-bone-dim"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-ink-2">
              <div className="hidden grid-cols-[7.5rem_1fr_9rem_1fr_6rem_9rem_2rem] gap-x-5 border-b border-line px-4 py-2.5 text-[0.65rem] uppercase tracking-wider text-bone-faint md:grid">
                <span>Order</span>
                <span>Customer</span>
                <span>City</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span />
              </div>

              {orders.status === "LoadingFirstPage" ? (
                <div className="grid place-items-center py-20">
                  <IconLoader2 className="h-5 w-5 animate-spin text-bone-faint" />
                </div>
              ) : orders.results.length === 0 ? (
                <p className="px-4 py-20 text-center text-sm text-bone-faint">
                  No orders here yet.
                </p>
              ) : (
                <ul>
                  {orders.results.map((order) => (
                    <OrderRow key={order.orderNumber} order={order} />
                  ))}
                </ul>
              )}
            </div>

            {orders.status === "CanLoadMore" && (
              <button
                type="button"
                onClick={() => orders.loadMore(25)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm text-bone-dim transition-colors hover:border-bone/30 hover:text-bone"
              >
                <IconRefresh className="h-4 w-4" /> Load more
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
