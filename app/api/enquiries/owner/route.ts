import { NextRequest, NextResponse } from "next/server";
import { getEnquiriesByOwner } from "@/lib/server/dal";

export async function GET(request: NextRequest) {
  const ownerId = request.nextUrl.searchParams.get("ownerId");
  if (!ownerId) {
    return NextResponse.json({ error: "ownerId is required." }, { status: 400 });
  }

  try {
    const enquiries = await getEnquiriesByOwner(ownerId);
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("GET /api/enquiries/owner failed:", error);
    return NextResponse.json(
      { error: "Unable to load enquiries." },
      { status: 500 }
    );
  }
}
