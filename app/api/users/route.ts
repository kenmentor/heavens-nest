import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser, getUserByEmail, updateUser } from "@/lib/server/dal";
import { userCreateSchema, userUpdateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users failed:", error);
    return NextResponse.json(
      { error: "Unable to load users." },
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

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  try {
    const existing = await getUserByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const user = await createUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users failed:", error);
    return NextResponse.json(
      { error: "Unable to create user." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  if (parsed.data.email) {
    const existing = await getUserByEmail(parsed.data.email);
    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
  }

  try {
    const user = await updateUser(userId, parsed.data);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error("PUT /api/users failed:", error);
    return NextResponse.json(
      { error: "Unable to update account." },
      { status: 500 }
    );
  }
}
