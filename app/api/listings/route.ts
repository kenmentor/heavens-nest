import { NextRequest, NextResponse } from "next/server";
import { getListings, createListing, type ListingFilters } from "@/lib/server/dal";
import { listingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const purpose = searchParams.get("purpose");
  const location = searchParams.get("location");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const filters: ListingFilters = {
    purpose: purpose === "rent" || purpose === "sale" ? purpose : undefined,
    location: location && location !== "all" ? location : undefined,
    minPrice: minPrice && !Number.isNaN(Number(minPrice)) ? Number(minPrice) : undefined,
    maxPrice: maxPrice && !Number.isNaN(Number(maxPrice)) ? Number(maxPrice) : undefined,
  };

  try {
    const listings = await getListings(filters);
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("GET /api/listings failed:", error);
    return NextResponse.json(
      { error: "Unable to load listings." },
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

  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const listing = await createListing(parsed.data);
    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings failed:", error);
    return NextResponse.json(
      { error: "Unable to create listing." },
      { status: 500 }
    );
  }
}
