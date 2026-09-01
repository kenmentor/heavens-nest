import { NextRequest, NextResponse } from "next/server";
import { getEnquiries, createEnquiry } from "@/lib/server/dal";
import { enquirySchema } from "@/lib/validations";

export async function GET() {
  try {
    const enquiries = await getEnquiries();
    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("GET /api/enquiries failed:", error);
    return NextResponse.json(
      { error: "Unable to load enquiries." },
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

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const enquiry = await createEnquiry(parsed.data);
    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/enquiries failed:", error);
    return NextResponse.json(
      { error: "Unable to send enquiry." },
      { status: 500 }
    );
  }
}
