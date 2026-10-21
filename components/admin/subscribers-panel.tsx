"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { IconCheck, IconCopy, IconDownload, IconLoader2 } from "@tabler/icons-react";
import { api } from "@/convex/_generated/api";

const SOURCE_LABEL = { footer: "Footer form", checkout: "Checkout opt-in" } as const;

/** Must match the `take()` in `admin.listSubscribers`. */
const LIST_CAP = 5000;

/**
 * One CSV cell. Quoted, with quotes doubled, and with a leading apostrophe on
 * anything a spreadsheet would run as a formula: the email is typed by a
 * stranger, and `=HYPERLINK(...)@x.co` passes a loose email check.
 */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** The newsletter list, with copy and CSV export for whichever mail tool comes next. */
export default function SubscribersPanel() {
  const rows = useQuery(api.admin.listSubscribers);
  const [copied, setCopied] = useState(false);

  if (rows === undefined) {
    return (
      <div className="grid place-items-center py-20">
        <IconLoader2 className="h-5 w-5 animate-spin text-bone-faint" />
      </div>
    );
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(rows.map((row) => row.email).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadCsv = () => {
    const csv = [
      "email,source,signed_up",
      ...rows.map((row) =>
        [row.email, row.source, new Date(row.createdAt).toISOString()].map(csvCell).join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `namakh-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-bone-dim">
          {rows.length >= LIST_CAP
            ? `Showing the newest ${LIST_CAP.toLocaleString("en-IN")} subscribers; the list and CSV leave out older ones.`
            : `${rows.length} ${rows.length === 1 ? "subscriber" : "subscribers"}`}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void copyAll()}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-bone-dim transition-colors hover:border-bone/30 hover:text-bone disabled:opacity-50"
          >
            {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy emails"}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs text-bone-dim transition-colors hover:border-bone/30 hover:text-bone disabled:opacity-50"
          >
            <IconDownload className="h-3.5 w-3.5" /> Download CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-ink-2">
        {rows.length === 0 ? (
          <p className="px-4 py-20 text-center text-sm text-bone-faint">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li
                key={row.email}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="text-bone">{row.email}</span>
                <span className="text-xs text-bone-faint">
                  {SOURCE_LABEL[row.source]} ·{" "}
                  {new Date(row.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
