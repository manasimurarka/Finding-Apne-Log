import { NextResponse } from "next/server";
import { assertConversationMember } from "../../../../../lib/access";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await assertConversationMember(request, id);
  if (!member || member.user.completion === "NEW") return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const messages = await prisma.message.findMany({ where: { conversationId: id }, include: { sender: { include: { profile: true } } }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ messages: messages.map((message) => ({ id: message.id, body: message.body, createdAt: message.createdAt, mine: message.senderId === member.user.id, senderName: message.sender.profile?.displayName ?? "Member" })) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await assertConversationMember(request, id);
    if (!member || member.user.completion === "NEW") return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    const { body } = await request.json();
    if (typeof body !== "string" || !body.trim() || body.length > 2000) return NextResponse.json({ error: "Messages must be between 1 and 2,000 characters." }, { status: 400 });
    const message = await prisma.message.create({ data: { conversationId: id, senderId: member.user.id, body: body.trim() } });
    return NextResponse.json({ message: { id: message.id, body: message.body, createdAt: message.createdAt, mine: true } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to send message." }, { status: 400 });
  }
}
