import { NextResponse } from "next/server";
import { currentUser, safeProfile } from "../../../lib/access";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user || user.completion === "NEW") return NextResponse.json({ error: "Complete your profile first." }, { status: 401 });
  const conversations = await prisma.conversation.findMany({
    where: { invitation: { OR: [{ fromId: user.id }, { toId: user.id }] } },
    include: { invitation: { include: { from: { include: { profile: true } }, to: { include: { profile: true } } } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ conversations: conversations.map((conversation) => {
    const other = conversation.invitation.fromId === user.id ? conversation.invitation.to : conversation.invitation.from;
    return {
      id: conversation.id,
      createdAt: conversation.createdAt,
      counterpart: other.profile ? { id: other.id, ...safeProfile(other.profile) } : null,
      lastMessage: conversation.messages[0] ? { body: conversation.messages[0].body, createdAt: conversation.messages[0].createdAt } : null,
    };
  }) });
}
