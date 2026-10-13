import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import { STATUS_COPY, isTerminalFailure } from "@/lib/commerce/tracking";
import { TIMELINE, timelineIndex } from "@/lib/shiprocket/status";
import type { OrderStatus } from "@/lib/commerce/types";

type Event = {
  status: OrderStatus;
  label: string;
  detail?: string;
  occurredAt: number;
};

function formatStamp(ms: number): string {
  return new Date(ms).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * The parcel's journey. Six fixed stages, with the real events hung off the
 * stage they belong to, so a buyer sees both where the parcel is and every
 * scan that got it there.
 */
export default function OrderTimeline({
  status,
  events,
}: {
  status: OrderStatus;
  events: Event[];
}) {
  if (isTerminalFailure(status)) {
    const copy = STATUS_COPY[status];
    return (
      <div className="rounded-2xl border border-[var(--color-sports)]/40 bg-ink-2 p-6">
        <div className="flex items-start gap-3">
          <IconAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-sports)]" />
          <div>
            <h2 className="font-display text-lg text-bone">{copy.label}</h2>
            <p className="mt-1.5 text-sm text-bone-dim">{copy.blurb}</p>
          </div>
        </div>
        {events.length > 0 && (
          <ul className="mt-6 space-y-3 border-t border-line pt-5 text-xs text-bone-faint">
            {events.map((event, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>{event.label}</span>
                <span className="font-mono-jb shrink-0">{formatStamp(event.occurredAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const currentIndex = timelineIndex(status);

  return (
    <ol className="relative">
      {TIMELINE.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const stepEvents = events.filter((e) => e.status === step.status);
        const isLast = index === TIMELINE.length - 1;

        return (
          <li key={step.status} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[0.6875rem] top-6 h-[calc(100%-1rem)] w-px ${
                  done ? "bg-salt/40" : "bg-line"
                }`}
              />
            )}

            <span
              className={`relative z-[1] mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                done
                  ? "border-salt bg-salt text-ink"
                  : active
                    ? "border-bone bg-bone text-ink"
                    : "border-line bg-ink-3"
              }`}
            >
              {done ? (
                <IconCheck className="h-3.5 w-3.5" />
              ) : active ? (
                <span className="h-2 w-2 rounded-full bg-ink" />
              ) : null}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span
                  className={`text-sm ${
                    done || active ? "text-bone" : "text-bone-faint"
                  }`}
                >
                  {step.label}
                </span>
                {stepEvents.length > 0 && (
                  <span className="font-mono-jb text-xs text-bone-faint">
                    {formatStamp(stepEvents[stepEvents.length - 1].occurredAt)}
                  </span>
                )}
              </div>

              {active && (
                <p className="mt-1 text-xs text-bone-dim">{STATUS_COPY[status].blurb}</p>
              )}

              {stepEvents.map(
                (event, i) =>
                  event.detail && (
                    <p key={i} className="mt-1 text-xs text-bone-faint">
                      {event.detail}
                    </p>
                  ),
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
