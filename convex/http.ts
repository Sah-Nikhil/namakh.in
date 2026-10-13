import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { courierTrackingUrl, mapShiprocketStatus } from "../lib/shiprocket/status";
import { auth } from "./auth";

const http = httpRouter();

// Sign-in, sign-out and token refresh for the admin panel.
auth.addHttpRoutes(http);

function str(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

/**
 * Shiprocket's order-status webhook.
 *
 * Configure it in the Shiprocket panel under Settings → API → Webhooks, with
 * this deployment's site URL plus /hooks/parcel-status, and set the x-api-key
 * field to the same value as the SHIPROCKET_WEBHOOK_TOKEN env var here.
 *
 * Shiprocket retries on a non-2xx, so anything that is not our fault (an
 * unknown order, a status we do not map) answers 200 and is dropped. Only a
 * bad token and a malformed body are errors.
 */
http.route({
  // Shiprocket refuses webhook URLs containing "shiprocket", "kartrocket", "sr"
  // or "kr", so the path is deliberately brand-neutral. Don't rename it back.
  path: "/hooks/parcel-status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (!expected) {
      console.error("SHIPROCKET_WEBHOOK_TOKEN is not set on this deployment.");
      return new Response("Not configured", { status: 503 });
    }
    if (request.headers.get("x-api-key") !== expected) {
      return new Response("Unauthorised", { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Malformed body", { status: 400 });
    }
    if (typeof body !== "object" || body === null) {
      return new Response("Malformed body", { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const orderNumber = str(payload.order_id);
    const rawStatus = str(payload.current_status);

    if (!orderNumber || !rawStatus) {
      return new Response("Missing order_id or current_status", { status: 400 });
    }

    const mapped = mapShiprocketStatus(rawStatus);
    if (!mapped) {
      // A courier-specific status we have not seen. Recording it as a guessed
      // stage would move the buyer's timeline backwards or forwards wrongly.
      console.warn(`Unmapped Shiprocket status "${rawStatus}" for ${orderNumber}.`);
      return new Response("Ignored", { status: 200 });
    }

    const awb = str(payload.awb);
    const courier = str(payload.courier_name);

    await ctx.runMutation(internal.orders.recordStatus, {
      orderNumber,
      status: mapped.status,
      label: mapped.label,
      detail: courier ? `${courier}${awb ? ` · AWB ${awb}` : ""}` : undefined,
      source: "shiprocket",
      courier,
      awb,
      trackingUrl: awb ? courierTrackingUrl(awb) : undefined,
      shiprocketOrderId: str(payload.sr_order_id),
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;
