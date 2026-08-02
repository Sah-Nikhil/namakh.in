import React from "react";

/**
 * The proprietor / registered-address block that closes each policy document.
 * Identical wording in all four, so it lives here rather than four times over.
 */
export default function DocContactBlock() {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-ink-2 px-6 py-6 not-italic">
      <p className="text-bone">Harsh Nilesh Nisar (Proprietor – Namakh)</p>
      <address className="mt-2 not-italic text-sm text-bone-dim leading-relaxed">
        No. 61, Perumal Koil Street Puducherry – 605001, India
      </address>
      <p className="mt-3 text-sm text-bone-dim">
        Email:{" "}
        <a href="mailto:hydratewithnamakh@gmail.com">
          hydratewithnamakh@gmail.com
        </a>
      </p>
      <p className="text-sm text-bone-dim">
        Phone: <a href="tel:+919543990007">+91 95439 90007</a>
      </p>
    </div>
  );
}
