"use client";

import { useEffect, useState } from "react";
import { deliveryWindow } from "@/lib/commerce/pricing";

/**
 * The delivery estimate is derived from today's date, and the server renders
 * in UTC while the buyer's browser is on IST. Rendering it during SSR would
 * produce two different strings and a hydration mismatch, so it only appears
 * after mount. The em dash placeholder keeps the line from reflowing.
 */
export default function DeliveryWindow() {
  const [window_, setWindow] = useState<string | null>(null);
  useEffect(() => setWindow(deliveryWindow()), []);
  return <>{window_ ?? "\u2014"}</>;
}
