import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";
import { embed } from "./embeddings";

export type Completion = "NEW" | "BASIC_COMPLETE" | "ENRICHED";
const hash = (password: string, salt = randomBytes(16).toString("hex")) => `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const verify = (password: string, stored: string) => { const [salt, key] = stored.split(":"); return timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash(password, salt).split(":")[1], "hex")); };
const clean = (username: string) => username.trim().toLowerCase();
const sessionId = (token: string) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Session configuration is missing.");
  return createHmac("sha256", secret).update(token).digest("base64url");
};

export function publicUser(user: { id: string; username: string; completion: Completion; profile?: { displayName: string; metro: string; interests: string[]; availability: string; goals: string } | null }) { return { id: user.id, username: user.username, completion: user.completion, displayName: user.profile?.displayName, metro: user.profile?.metro, interests: user.profile?.interests ?? [], availability: user.profile?.availability, goals: user.profile?.goals }; }
export async function signUp(username: string, password: string) { const normalized = clean(username); if (!/^[a-z0-9_]{3,30}$/.test(normalized)) throw new Error("Use 3–30 letters, numbers, or underscores for your username."); if (password.length < 8) throw new Error("Use a password with at least 8 characters."); const exists = await prisma.user.findUnique({ where: { username: normalized } }); if (exists) throw new Error("That username is already taken."); const user = await prisma.user.create({ data: { username: normalized, passwordHash: hash(password) } }); return createSession(user.id); }
export async function logIn(username: string, password: string) { const user = await prisma.user.findUnique({ where: { username: clean(username) } }); if (!user || !verify(password, user.passwordHash)) throw new Error("Incorrect username or password."); return createSession(user.id); }
export async function createSession(userId: string) { const token = randomBytes(32).toString("base64url"); await prisma.session.create({ data: { id: sessionId(token), userId, expiresAt: new Date(Date.now() + 7 * 86400000) } }); return token; }
export async function fromSession(token?: string) { if (!token) return null; const id = sessionId(token); const session = await prisma.session.findUnique({ where: { id }, include: { user: { include: { profile: true } } } }); if (!session || session.expiresAt < new Date()) { if (session) await prisma.session.delete({ where: { id } }); return null; } return session.user; }
export async function deleteSession(token?: string) { if (token) await prisma.session.deleteMany({ where: { id: sessionId(token) } }); }
export async function updateProfile(id: string, data: Record<string, unknown>) {
  const existingProfile = await prisma.profile.findUnique({ where: { userId: id }, select: { birthDate: true, gender: true, moveDate: true } });
  const interests = (data.interests as string[]) ?? [];
  const birthDate = data.birthDate ? new Date(String(data.birthDate)) : existingProfile?.birthDate ?? new Date();
  const gender = (data.gender as string | undefined) ?? existingProfile?.gender ?? "Prefer not to say";
  const moveDate = data.moveDate ? new Date(String(data.moveDate)) : existingProfile?.moveDate ?? new Date();
  const matchDocument = [
    `Connection goals: ${data.goals}.`,
    `Interests: ${interests.join(", ")}.`,
    `Availability: ${data.availability}.`,
    `Connection mode: ${data.connectionMode}.`,
    `Private matching context: hometown ${data.hometown}, country ${data.country}, gender ${gender}, moved or moving ${moveDate.toISOString().slice(0, 10)}.`,
  ].join(" ");
  const embedding = await embed(matchDocument).catch(() => null);
  await prisma.profile.upsert({
    where: { userId: id },
    create: { userId: id, displayName: String(data.displayName), metro: String(data.metro), interests, availability: String(data.availability), goals: String(data.goals), connectionMode: String(data.connectionMode), hometown: String(data.hometown), country: String(data.country), birthDate, gender, moveDate, matchDocument, embedding: embedding ?? undefined },
    update: { displayName: String(data.displayName), metro: String(data.metro), interests, availability: String(data.availability), goals: String(data.goals), connectionMode: String(data.connectionMode), hometown: String(data.hometown), country: String(data.country), birthDate, gender, moveDate, matchDocument, ...(embedding ? { embedding } : {}) },
  });
  const user = await prisma.user.update({ where: { id }, data: { completion: "BASIC_COMPLETE" }, include: { profile: true } });
  return publicUser(user);
}
