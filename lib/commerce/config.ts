/**
 * Commerce configuration — every number the checkout adds up lives here.
 *
 * Settled with the client on 2026-09-15: prices are final as listed, and
 * shipping is charged, calculated at checkout (rates still to be supplied).
 * COD stays off. Changing the business rules is an edit to this file, not to
 * any component.
 */

export type ShippingMode = "free" | "flat" | "threshold" | "live";
export type TaxMode = "none" | "inclusive" | "exclusive";

export const COMMERCE = {
  currencyCode: "INR",
  currencySymbol: "₹",

  shipping: {
    /**
     * "free"      — never charge.
     * "flat"      — charge `flatFee` on every order.
     * "threshold" — charge `flatFee` until the subtotal reaches `freeAbove`.
     * "live"      — quote from Shiprocket at checkout, priced by `liveRates`.
     *               Decided 2026-10-13.
     */
    mode: "live" as ShippingMode,
    flatFee: 79,
    freeAbove: 999,
    /** Delivery window quoted at checkout, in business days. */
    etaDays: [3, 6] as const,
    dispatchNote: "Dispatched within 2–3 business days of order confirmation.",
  },

  tax: {
    /**
     * "none" since 2026-10-21: the business is not GST registered, so no GST
     * is charged or mentioned and no GSTIN is shown. Before that it was
     * "inclusive". Do not flip without the client and a GSTIN.
     *
     * "none"      — no tax line, no tax note. Prices are final.
     * "inclusive" — prices in lib/products.ts already contain GST. No tax
     *               line, just an "Inclusive of GST" note.
     * "exclusive" — GST is added on top and shown as its own line.
     */
    mode: "none" as TaxMode,
    ratePct: 18,
    label: "GST",
  },

  /**
   * How a Shiprocket courier rate becomes the price a buyer pays. Shiprocket
   * quotes what the courier charges the store; these rules decide what the
   * store charges the customer. Edit here, nowhere else.
   */
  liveRates: {
    /** Added on top of the courier's rate. Negative values subsidise. */
    markupPct: 0,
    /** Round the customer price up to the nearest multiple. 1 disables. */
    roundUpTo: 10,
    /** Shipping is free once the subtotal reaches this. 0 disables. */
    freeAbove: 0,
    /**
     * Charged when Shiprocket cannot be reached, so checkout never stalls on
     * an outside service. It should sit at or above a typical courier rate,
     * or every outage is a loss on every order.
     */
    fallbackFee: 79,
    /** How long a quoted price is honoured before the buyer must re-quote. */
    quoteTtlMinutes: 15,
  },

  shiprocket: {
    /**
     * Must match a pickup address nickname in the Shiprocket panel exactly,
     * capitalisation included (Settings → Pickup Addresses). Set 2026-10-13:
     * "Celebration, Verite Radial, Auroville".
     */
    pickupLocation: "Warehouse",
    /**
     * PIN code of that pickup address; quotes are priced from here. The client
     * wrote 605111 on the address (Villupuram district, Irumbai area). The
     * Auroville post office itself is 605101. Must match what is saved in the
     * Shiprocket panel — PROVISIONAL until confirmed there.
     */
    pickupPincode: "605111",
    /**
     * Courier booking. Off: the order lands in Shiprocket and a person picks
     * the courier, prints the label and schedules pickup in their panel. On:
     * the courier quoted at checkout is booked automatically, which charges
     * the Shiprocket wallet with nobody looking. Test on one real order with
     * this on before leaving it on — that path has not run against a live
     * account yet.
     */
    autoAssignCourier: false,
    /** Only meaningful with autoAssignCourier. Requests the pickup as well. */
    autoRequestPickup: false,
  },

  cod: {
    /** Built and styled, deliberately off. Flip to true to expose it. */
    enabled: false,
    fee: 0,
    /** COD is hidden above this order value when enabled. 0 disables the cap. */
    maxOrderValue: 5000,
  },

  cart: {
    maxQtyPerLine: 10,
    storageKey: "namakh.cart.v1",
    draftStorageKey: "namakh.checkout.v1",
  },

  support: {
    email: "hydratewithnamakh@gmail.com",
    phone: "+91 95439 90007",
  },

  /**
   * The seller, as given by the client on 2026-10-21. A sole proprietorship,
   * not GST registered. The registered address is the only address shown to
   * buyers; the Auroville pickup address appears only in the Shipping Policy.
   */
  business: {
    legalName: "Harsh Nilesh Nisar",
    brand: "Namakh",
    address: "No. 61, Perumal Koil Street, Puducherry 605001, India",
    fssaiLicence: "23526001000347",
    /** Issued 19 March 2026. Renew before this date; not shown on the site. */
    fssaiValidUntil: "2028-03-18",
  },

  /** Only market served today. The address form is built around it. */
  country: "India",
};

/** Payment rails the checkout knows about. */
export type PaymentMethodId = "razorpay" | "cod";

/**
 * Razorpay is not live yet — the merchant account is pending approval, and
 * approval requires this very flow to be submitted for review. Until then the
 * checkout collects everything and records the order as awaiting payment.
 * Flip this to true once keys land in .env.local; see app/api/checkout/route.ts.
 */
export const PAYMENTS_LIVE = false;

/**
 * Where the just-placed order is parked for the confirmation page to read.
 * sessionStorage, because there is no order database yet — see the note in
 * app/api/checkout/route.ts.
 */
export const LAST_ORDER_KEY = "namakh.order.last";
