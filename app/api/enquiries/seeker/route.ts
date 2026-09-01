import { NextRequest, NextResponse } from "next/server";
import { getInquiriesForSeeker } from "@/lib/server/dal";

export async function GET(request: NextRequest) {
  const seekerId = request.nextUrl.searchParams.get("seekerId");
  if (!seekerId) {
    return NextResponse.json({ error: "seekerId is required." }, { status: 400 });
  }

  try {
    const enquiries = await getInquiriesForSeeker(seekerId);
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("GET /api/enquiries/seeker failed:", error);
    return NextResponse.json(
      { error: "Unable to load enquiries." },
      { status: 500 }
    );
  }
}
