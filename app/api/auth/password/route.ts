import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/lib/server/dal";
import { changePasswordSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id")?.trim() || null;
  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const result = await changePassword(
      userId,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/password failed:", error);
    return NextResponse.json(
      { error: "Unable to change password." },
      { status: 500 }
    );
  }
}
