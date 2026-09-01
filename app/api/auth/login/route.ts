import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/server/dal";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const user = await verifyCredentials(
      parsed.data.email,
      parsed.data.password
    );
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json(
      { error: "Unable to login." },
      { status: 500 }
    );
  }
}
