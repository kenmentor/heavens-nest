import { NextRequest, NextResponse } from "next/server";
import {
  getSaved,
  getSavedBySeeker,
  getListingById,
  saveProperty,
  unsaveProperty,
} from "@/lib/server/dal";

function validId(value: string | null | undefined): string | undefined {
  return value && value.trim() ? value.trim() : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const seekerId = validId(searchParams.get("seekerId"));

  try {
    const saved = seekerId ? await getSavedBySeeker(seekerId) : await getSaved();
    return NextResponse.json({ saved });
  } catch (error) {
    console.error("GET /api/saved failed:", error);
    return NextResponse.json(
      { error: "Unable to load saved properties." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const seekerId = validId((body as { seekerId?: string })?.seekerId);
  const listingId = validId((body as { listingId?: string })?.listingId);
  if (!seekerId || !listingId) {
    return NextResponse.json(
      { error: "seekerId and listingId are required." },
      { status: 422 }
    );
  }

  try {
    const listing = await getListingById(listingId);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const saved = await saveProperty(seekerId, listingId);
    return NextResponse.json({ saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/saved failed:", error);
    return NextResponse.json(
      { error: "Unable to save property." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const seekerId = validId(searchParams.get("seekerId"));
  const listingId = validId(searchParams.get("listingId"));
  if (!seekerId || !listingId) {
    return NextResponse.json(
      { error: "seekerId and listingId are required." },
      { status: 422 }
    );
  }

  try {
    const deleted = await unsaveProperty(seekerId, listingId);
    if (!deleted) {
      return NextResponse.json({ error: "Saved property not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/saved failed:", error);
    return NextResponse.json(
      { error: "Unable to remove saved property." },
      { status: 500 }
    );
  }
}
