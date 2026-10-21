import { COMMERCE, PAYMENTS_LIVE } from "@/lib/commerce/config";
import { formatINR, lineTotal } from "@/lib/commerce/pricing";
import { trackingPath } from "@/lib/commerce/tracking";
import type { PlacedOrder } from "@/lib/commerce/types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * The "we have your order" email. Mail clients ignore stylesheets, so the
 * styling is inline, and it is deliberately plain: light background, one link.
 */
export function orderReceivedEmail(order: PlacedOrder, origin: string) {
  const trackUrl = `${origin}${trackingPath(order.orderNumber, order.trackToken)}`;
  const biz = COMMERCE.business;
  const seller = `${biz.brand} · ${biz.legalName} (sole proprietor) · ${biz.address} · FSSAI Lic. No. ${biz.fssaiLicence}`;
  const firstName = order.address.fullName.trim().split(/\s+/)[0] || "there";
  // TODO(PAYMENTS_LIVE): once Razorpay is wired, a prepaid buyer pays in the
  // checkout modal. Send a "payment received" email from recordPayment then,
  // rather than this one from the checkout route before payment exists.
  const next =
    order.paymentMethod === "cod"
      ? "It is cash on delivery, so there is nothing to pay now. We will pack it shortly."
      : PAYMENTS_LIVE
        ? "We will pack it as soon as your payment is confirmed."
        : "It is waiting for payment, and nothing has been charged yet.";

  const rows = order.lines
    .map(
      (line) => `<tr>
        <td style="padding:6px 0;color:#111">${escapeHtml(line.name)} &times; ${line.qty}</td>
        <td style="padding:6px 0;color:#111;text-align:right">${formatINR(lineTotal(line))}</td>
      </tr>`,
    )
    .join("");

  const a = order.address;
  const address = [a.fullName, a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`, a.country]
    .filter(Boolean)
    .map((part) => escapeHtml(part))
    .join("<br>");

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">
  <div style="max-width:520px;margin:0 auto;background:#fff;padding:28px;border-radius:8px">
    <p style="margin:0 0 4px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#777">Order ${escapeHtml(order.orderNumber)}</p>
    <h1 style="margin:0 0 16px;font-size:22px">Thank you, ${escapeHtml(firstName)}.</h1>
    <p style="margin:0 0 20px">Your order is saved. ${next}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5">${rows}
      <tr><td style="padding:6px 0;color:#555">Shipping</td><td style="padding:6px 0;color:#555;text-align:right">${order.totals.shipping === 0 ? "Free" : formatINR(order.totals.shipping)}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold">Total</td><td style="padding:8px 0;font-weight:bold;text-align:right">${formatINR(order.totals.total)}</td></tr>
    </table>
    <p style="margin:20px 0 6px;color:#777;font-size:13px">Delivering to</p>
    <p style="margin:0 0 24px">${address}</p>
    <a href="${trackUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px">Track your order</a>
    <p style="margin:24px 0 0;color:#777;font-size:13px">Questions? Write to <a href="mailto:${COMMERCE.support.email}" style="color:#777">${COMMERCE.support.email}</a> or call ${COMMERCE.support.phone}.</p>
    <p style="margin:12px 0 0;color:#999;font-size:12px">${seller}</p>
  </div>
</body></html>`;

  const text = [
    `Thank you, ${firstName}.`,
    `Order ${order.orderNumber} is saved. ${next}`,
    "",
    ...order.lines.map((l) => `${l.name} x ${l.qty}  ${formatINR(lineTotal(l))}`),
    `Shipping: ${order.totals.shipping === 0 ? "Free" : formatINR(order.totals.shipping)}`,
    `Total: ${formatINR(order.totals.total)}`,
    "",
    `Track your order: ${trackUrl}`,
    "",
    `Questions? ${COMMERCE.support.email} / ${COMMERCE.support.phone}`,
    "",
    seller,
  ].join("\n");

  return { subject: `Order ${order.orderNumber} received`, html, text };
}
