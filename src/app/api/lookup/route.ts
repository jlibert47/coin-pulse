import { lookupCoin } from "@/lib/lookup";
import { currentYear } from "@/lib/format";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type")?.trim() ?? "";
  const yearRaw = request.nextUrl.searchParams.get("year");
  const mint = request.nextUrl.searchParams.get("mint") ?? undefined;
  const year = yearRaw ? Number(yearRaw) : undefined;

  if (!type) {
    return Response.json({ error: "Enter a coin type to search." }, { status: 400 });
  }
  if (
    year != null &&
    (!Number.isInteger(year) || year < 1600 || year > currentYear() + 1)
  ) {
    return Response.json({ error: "Enter a valid coin date (year)." }, { status: 400 });
  }

  try {
    const result = await lookupCoin({ type, year, mint });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
