"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { SelectField, TextField } from "@/components/checkout/field";
import { COMMERCE } from "@/lib/commerce/config";
import { lookupPincode } from "@/lib/commerce/pincode";
import { INDIAN_STATES } from "@/lib/commerce/validation";
import type { FieldErrors } from "@/lib/commerce/validation";
import type { ShippingAddress } from "@/lib/commerce/types";

type LookupState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok"; city: string; state: string }
  | { status: "error"; message: string };

export default function AddressForm({
  address,
  onChange,
  errors,
}: {
  address: ShippingAddress;
  onChange: (patch: Partial<ShippingAddress>) => void;
  errors: FieldErrors;
}) {
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  // Kept in a ref so the effect below depends only on the PIN code itself —
  // re-running it whenever the buyer edits their street address would fire a
  // lookup on every keystroke.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const pincode = address.pincode.trim();

  useEffect(() => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setLookup({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLookup({ status: "checking" });
      try {
        const result = await lookupPincode(pincode, controller.signal);
        if (controller.signal.aborted) return;

        if (!result.serviceable) {
          setLookup({
            status: "error",
            message: result.error ?? "We could not verify that PIN code.",
          });
          return;
        }

        setLookup({ status: "ok", city: result.city, state: result.state });
        onChangeRef.current({ city: result.city, state: result.state });
      } catch {
        // Aborted by a newer keystroke. Nothing to report.
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [pincode]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        id="fullName"
        label="Full name"
        value={address.fullName}
        onChange={(v) => onChange({ fullName: v })}
        error={errors.fullName}
        autoComplete="name"
        placeholder="As it should appear on the parcel"
        className="sm:col-span-2"
      />

      <TextField
        id="phone"
        label="Mobile number"
        value={address.phone}
        onChange={(v) => onChange({ phone: v })}
        error={errors.phone}
        inputMode="tel"
        autoComplete="tel"
        placeholder="10-digit mobile number"
        hint="Used only for delivery updates."
        className="sm:col-span-2"
      />

      <TextField
        id="line1"
        label="Address"
        value={address.line1}
        onChange={(v) => onChange({ line1: v })}
        error={errors.line1}
        autoComplete="address-line1"
        placeholder="House / flat number, building, street"
        className="sm:col-span-2"
      />

      <TextField
        id="line2"
        label="Apartment, landmark (optional)"
        value={address.line2}
        onChange={(v) => onChange({ line2: v })}
        autoComplete="address-line2"
        placeholder="Near…"
        className="sm:col-span-2"
      />

      <TextField
        id="pincode"
        label="PIN code"
        value={address.pincode}
        onChange={(v) => onChange({ pincode: v.replace(/\D/g, "").slice(0, 6) })}
        error={errors.pincode ?? (lookup.status === "error" ? lookup.message : undefined)}
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="560001"
        maxLength={6}
        hint={
          lookup.status === "checking" ? (
            <span className="flex items-center gap-1.5">
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> Checking serviceability…
            </span>
          ) : lookup.status === "ok" ? (
            <span className="flex items-center gap-1.5 text-[var(--color-hydration)]">
              <IconCheck className="h-3.5 w-3.5" /> Delivers to {lookup.city}, {lookup.state}
            </span>
          ) : (
            "City and state fill in automatically."
          )
        }
      />

      <TextField
        id="city"
        label="City"
        value={address.city}
        onChange={(v) => onChange({ city: v })}
        error={errors.city}
        autoComplete="address-level2"
        placeholder="City"
      />

      <SelectField
        id="state"
        label="State"
        value={address.state}
        onChange={(v) => onChange({ state: v })}
        options={INDIAN_STATES}
        placeholder="Select a state"
        error={errors.state}
      />

      <TextField
        id="country"
        label="Country"
        value={COMMERCE.country}
        onChange={() => {}}
        readOnly
        hint={`We ship within ${COMMERCE.country} only.`}
      />
    </div>
  );
}
