import { NextResponse } from "next/server";
import { fromSession } from "../../../lib/demo-auth";
import { recommendations } from "../../../lib/matching";
const token = (request: Request) => request.headers.get("cookie")?.match(/apne_session=([^;]+)/)?.[1];
export async function POST(request: Request) { try { const user = await fromSession(token(request)); if (!user || user.completion === "NEW") return NextResponse.json({ error: "Complete your profile first." }, { status: 401 }); const { query } = await request.json(); if (!query?.trim()) return NextResponse.json({ error: "Tell us what you are looking for." }, { status: 400 }); return NextResponse.json({ matches: await recommendations(user.id, query) }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Matching is unavailable." }, { status: 500 }); } }
