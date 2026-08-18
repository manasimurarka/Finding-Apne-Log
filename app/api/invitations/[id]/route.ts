import { NextResponse } from "next/server";
import { currentUser } from "../../../../lib/access";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const { id } = await params;
    const { action } = await request.json();
    if (!["accept", "decline", "block"].includes(action)) return NextResponse.json({ error: "Choose accept, decline, or block." }, { status: 400 });
    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation || invitation.toId !== user.id || invitation.status !== "PENDING") return NextResponse.json({ error: "That invitation is no longer available." }, { status: 404 });
    if (action === "accept") {
      const conversation = await prisma.$transaction(async (tx) => {
        await tx.invitation.update({ where: { id }, data: { status: "ACCEPTED" } });
        return tx.conversation.upsert({ where: { invitationId: id }, create: { invitationId: id }, update: {} });
      });
      return NextResponse.json({ status: "ACCEPTED", conversationId: conversation.id });
    }
    if (action === "block") {
      await prisma.$transaction([
        prisma.block.upsert({ where: { blockerId_blockedId: { blockerId: user.id, blockedId: invitation.fromId } }, create: { blockerId: user.id, blockedId: invitation.fromId }, update: {} }),
        prisma.invitation.update({ where: { id }, data: { status: "BLOCKED" } }),
      ]);
      return NextResponse.json({ status: "BLOCKED" });
    }
    await prisma.invitation.update({ where: { id }, data: { status: "DECLINED" } });
    return NextResponse.json({ status: "DECLINED" });
  } catch {
    return NextResponse.json({ error: "Unable to update the invitation." }, { status: 400 });
  }
}
