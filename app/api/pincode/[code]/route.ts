import { NextResponse } from "next/server";
import { COMMERCE } from "@/lib/commerce/config";
import { canonicalState } from "@/lib/commerce/validation";
import type { PincodeLookup } from "@/lib/commerce/types";

/** Shape of the upstream india-post response, narrowed to what we use. */
type PostOffice = { Name: string; District: string; State: string; Country: string };
type UpstreamEntry = { Status: string; PostOffice: PostOffice[] | null };

const UPSTREAM = "https://api.postalpincode.in/pincode";

function fail(status: number, error: string, pincode: string) {
  return NextResponse.json<PincodeLookup>(
    { pincode, serviceable: false, city: "", state: "", error },
    { status },
  );
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;

  if (!/^[1-9][0-9]{5}$/.test(code)) {
    return fail(400, "Enter a valid 6-digit PIN code.", code);
  }

  let entries: UpstreamEntry[];
  try {
    const res = await fetch(`${UPSTREAM}/${code}`, {
      // PIN code to city/state mapping changes about never. Cache for a day.
      next: { revalidate: 86_400 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    entries = (await res.json()) as UpstreamEntry[];
  } catch {
    return fail(
      502,
      "Could not verify this PIN code right now. Enter your city and state manually.",
      code,
    );
  }

  const office = entries?.[0]?.PostOffice?.[0];
  if (entries?.[0]?.Status !== "Success" || !office) {
    return fail(404, "We could not find that PIN code. Check and try again.", code);
  }

  if (office.Country !== COMMERCE.country) {
    return fail(422, `We currently ship within ${COMMERCE.country} only.`, code);
  }

  return NextResponse.json<PincodeLookup>({
    pincode: code,
    serviceable: true,
    city: office.District,
    state: canonicalState(office.State),
  });
}
