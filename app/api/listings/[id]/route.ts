import { NextRequest, NextResponse } from "next/server";
import {
  getListingById,
  updateListing,
  deleteListing,
} from "@/lib/server/dal";
import { listingUpdateSchema } from "@/lib/validations";

type Context = { params: Promise<{ id: string }> };

function callerFromRequest(
  request: NextRequest
): { userId: string | null; role: string | null } {
  return {
    userId: request.headers.get("x-user-id")?.trim() || null,
    role: request.headers.get("x-user-role")?.trim() || null,
  };
}

export async function GET(_request: NextRequest, { params }: Context) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const { userId, role } = callerFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const existing = await getListingById(id);
  if (!existing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (existing.ownerId !== userId && role !== "admin") {
    return NextResponse.json(
      { error: "You can only modify your own listings." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = listingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  if (parsed.data.ownerId && parsed.data.ownerId !== userId) {
    return NextResponse.json(
      { error: "You cannot transfer ownership of a listing." },
      { status: 403 }
    );
  }

  const listing = await updateListing(id, parsed.data);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  const { userId, role } = callerFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const existing = await getListingById(id);
  if (!existing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (existing.ownerId !== userId && role !== "admin") {
    return NextResponse.json(
      { error: "You can only delete your own listings." },
      { status: 403 }
    );
  }

  const deleted = await deleteListing(id);
  if (!deleted) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
