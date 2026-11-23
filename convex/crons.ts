import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Shipping quotes are honoured for minutes; keep the table from growing forever.
crons.interval("delete expired shipping quotes", { hours: 24 }, internal.shiprocket.deleteExpiredQuotes, {});

// Safety net for payments whose webhook never arrived and whose buyer never
// came back to the confirmation page. Asks PhonePe about recent open attempts.
crons.interval("reconcile open PhonePe payments", { minutes: 10 }, internal.phonepe.reconcileOpen, {});

export default crons;
