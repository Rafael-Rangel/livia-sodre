import { NextResponse } from "next/server";
import { createSession, validateCredentials } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!validateCredentials(String(password || ""))) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
