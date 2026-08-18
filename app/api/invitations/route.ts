import { NextResponse } from "next/server";
import { currentUser, safeProfile } from "../../../lib/access";
import { prisma } from "../../../lib/prisma";

const invitationView = (invitation: { id: string; note: string; safeReason: string; status: string; createdAt: Date; from: { id: string; profile: Parameters<typeof safeProfile>[0] | null } }) => ({
  id: invitation.id,
  note: invitation.note,
  safeReason: invitation.safeReason,
  status: invitation.status,
  createdAt: invitation.createdAt,
  from: invitation.from.profile ? { id: invitation.from.id, ...safeProfile(invitation.from.profile) } : null,
});

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user || user.completion === "NEW") return NextResponse.json({ error: "Complete your profile first." }, { status: 401 });
  const invitations = await prisma.invitation.findMany({
    where: { toId: user.id, status: "PENDING" },
    include: { from: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invitations: invitations.map(invitationView) });
}

export async function POST(request: Request) {
  try {
    const user = await currentUser(request);
    if (!user || user.completion === "NEW") return NextResponse.json({ error: "Complete your profile first." }, { status: 401 });
    const { toId, note = "" } = await request.json();
    if (typeof toId !== "string" || toId === user.id) return NextResponse.json({ error: "Choose another member to invite." }, { status: 400 });
    if (typeof note !== "string" || note.length > 400) return NextResponse.json({ error: "Your invitation note is not valid." }, { status: 400 });
    const recipient = await prisma.user.findUnique({ where: { id: toId }, include: { profile: true } });
    if (!recipient?.profile || recipient.isSeed || recipient.completion === "NEW") return NextResponse.json({ error: "That member is unavailable." }, { status: 404 });
    const unavailable = await prisma.$transaction([
      prisma.block.findFirst({ where: { OR: [{ blockerId: user.id, blockedId: toId }, { blockerId: toId, blockedId: user.id }] } }),
      prisma.report.findFirst({ where: { OR: [{ reporterId: user.id, targetId: toId }, { reporterId: toId, targetId: user.id }] } }),
    ]);
    if (unavailable[0] || unavailable[1]) return NextResponse.json({ error: "You cannot invite this member." }, { status: 403 });
    const prior = await prisma.invitation.findUnique({ where: { fromId_toId: { fromId: user.id, toId } } });
    if (prior) return NextResponse.json({ error: prior.status === "PENDING" ? "This invitation is already pending." : "An invitation has already been sent to this member." }, { status: 409 });
    const invitation = await prisma.invitation.create({ data: { fromId: user.id, toId, note: note.trim(), safeReason: "They may share interests, availability, or connection goals with you." } });
    return NextResponse.json({ invitation }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to send the invitation." }, { status: 400 });
  }
}
