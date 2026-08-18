import { fromSession } from "./demo-auth";
import { prisma } from "./prisma";

export const sessionToken = (request: Request) => request.headers.get("cookie")?.match(/apne_session=([^;]+)/)?.[1];
export async function currentUser(request: Request) { return fromSession(sessionToken(request)); }
export const defaults = { hometown: false, country: false, interests: true, availability: true, connectionMode: true, goals: true };
export const visibility = (value: unknown) => ({ ...defaults, ...(typeof value === "object" && value ? value : {}) });
export function safeProfile(profile: { displayName: string; metro: string; interests: string[]; availability: string; goals: string; connectionMode: string; hometown: string; country: string; visibility: unknown }) { const shown = visibility(profile.visibility); return { displayName: profile.displayName, metro: profile.metro, ...(shown.interests ? { interests: profile.interests } : {}), ...(shown.availability ? { availability: profile.availability } : {}), ...(shown.goals ? { goals: profile.goals } : {}), ...(shown.connectionMode ? { connectionMode: profile.connectionMode } : {}), ...(shown.hometown ? { hometown: profile.hometown } : {}), ...(shown.country ? { country: profile.country } : {}) }; }
export async function assertConversationMember(request: Request, conversationId: string) { const user = await currentUser(request); if (!user) return null; const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, include: { invitation: true } }); if (!conversation || (conversation.invitation.fromId !== user.id && conversation.invitation.toId !== user.id)) return null; return { user, conversation }; }
