import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/access";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user || user.completion === "NEW") return NextResponse.json({ error: "Complete your profile first." }, { status: 401 });
    const { targetId, reason } = await request.json();
    if (typeof targetId !== "string" || targetId === user.id || typeof reason !== "string" || !reason.trim() || reason.length > 500) return NextResponse.json({ error: "Please provide a short report reason." }, { status: 400 });
    await prisma.report.create({ data: { reporterId: user.id, targetId, reason: reason.trim() } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to submit report." }, { status: 400 });
  }
}
