import type { PincodeLookup } from "./types";

/**
 * Client-side PIN code lookup. Calls our own route rather than
 * api.postalpincode.in directly so the upstream response can be cached and
 * reshaped server-side, and so a CORS change upstream cannot break checkout.
 *
 * Failure is never fatal: the caller falls back to manual city/state entry.
 */
const cache = new Map<string, PincodeLookup>();

export async function lookupPincode(
  pincode: string,
  signal?: AbortSignal,
): Promise<PincodeLookup> {
  const code = pincode.trim();
  const cached = cache.get(code);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/pincode/${code}`, { signal });
    const data = (await res.json()) as PincodeLookup;
    if (!res.ok) {
      return { pincode: code, serviceable: false, city: "", state: "", error: data.error };
    }
    cache.set(code, data);
    return data;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return {
      pincode: code,
      serviceable: false,
      city: "",
      state: "",
      error: "Could not verify this PIN code. Enter your city and state manually.",
    };
  }
}
