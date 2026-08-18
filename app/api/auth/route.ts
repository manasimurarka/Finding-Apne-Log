import { NextResponse } from "next/server";
import { deleteSession, fromSession, logIn, publicUser, signUp } from "../../../lib/demo-auth";
const cookie = "apne_session";
const options = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 };
const token = (request: Request) => request.headers.get("cookie")?.match(/apne_session=([^;]+)/)?.[1];
export async function GET(request: Request) { const user = await fromSession(token(request)); return NextResponse.json({ user: user ? publicUser(user) : null }); }
export async function POST(request: Request) { try { const { action, username, password } = await request.json(); const session = action === "signup" ? await signUp(username, password) : await logIn(username, password); const response = NextResponse.json({ ok: true }); response.cookies.set(cookie, session, options); return response; } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to continue." }, { status: 400 }); } }
export async function DELETE(request: Request) { await deleteSession(token(request)); const response = NextResponse.json({ ok: true }); response.cookies.set(cookie, "", { ...options, maxAge: 0 }); return response; }
