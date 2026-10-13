import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Shipping quotes are honoured for minutes; keep the table from growing forever.
crons.interval("delete expired shipping quotes", { hours: 24 }, internal.shiprocket.deleteExpiredQuotes, {});

export default crons;
