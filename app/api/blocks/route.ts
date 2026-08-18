import { NextResponse } from "next/server";
import { currentUser } from "../../../lib/access";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user || user.completion === "NEW") return NextResponse.json({ error: "Complete your profile first." }, { status: 401 });
    const { targetId } = await request.json();
    if (typeof targetId !== "string" || targetId === user.id) return NextResponse.json({ error: "Choose another member." }, { status: 400 });
    await prisma.$transaction([
      prisma.block.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: targetId } }, create: { blockerId: user.id, blockedId: targetId }, update: {} }),
      prisma.invitation.updateMany({ where: { status: "PENDING", OR: [{ fromId: user.id, toId: targetId }, { fromId: targetId, toId: user.id }] }, data: { status: "BLOCKED" } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to block this member." }, { status: 400 });
  }
}
