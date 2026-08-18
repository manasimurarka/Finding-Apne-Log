import { prisma } from "./prisma";
import { safeProfile } from "./access";
import { embed } from "./embeddings";

type MatchProfile = {
  userId: string;
  displayName: string;
  metro: string;
  interests: string[];
  availability: string;
  goals: string;
  connectionMode: string;
  hometown: string;
  country: string;
  birthDate: Date;
  gender: string;
  moveDate: Date;
  matchDocument: string;
  embedding: unknown;
  visibility: unknown;
};

export const matchDocument = (profile: Omit<MatchProfile, "userId" | "embedding" | "visibility" | "matchDocument">) =>
  [
    `Connection goals: ${profile.goals}.`,
    `Interests: ${profile.interests.join(", ")}.`,
    `Availability: ${profile.availability}.`,
    `Connection mode: ${profile.connectionMode}.`,
    `Private matching context: hometown ${profile.hometown}, country ${profile.country}, gender ${profile.gender}, moved or moving ${profile.moveDate.toISOString().slice(0, 10)}.`,
  ].join(" ");

const cosine = (a: number[], b: number[]) => {
  if (a.length !== b.length || !a.length) return 0;
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magnitude = (values: number[]) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  const divisor = magnitude(a) * magnitude(b);
  return divisor ? dot / divisor : 0;
};

function sharedTerms(query: string, candidate: MatchProfile) {
  const words = query.toLowerCase();
  return candidate.interests.filter((interest) => words.includes(interest.toLowerCase())).slice(0, 2);
}

function safeWhy(query: string, candidate: MatchProfile) {
  const shown = safeProfile(candidate);
  const terms = sharedTerms(query, candidate).filter((term) => shown.interests?.includes(term));
  if (terms.length) return `Their profile lists ${terms.join(" and ")}.`;
  if (shown.availability) return `Their profile says they are open ${shown.availability.toLowerCase()}.`;
  if (shown.goals) return `Their stated connection goal is ${shown.goals.toLowerCase()}.`;
  if (shown.connectionMode) return `They are open to connecting ${shown.connectionMode}.`;
  return "Their profile may be a good fit for your request.";
}

export async function recommendations(userId: string, query: string) {
  const source = await prisma.profile.findUnique({ where: { userId } });
  if (!source) throw new Error("Complete your profile first.");

  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const excluded = new Set(blocks.map((block) => block.blockerId === userId ? block.blockedId : block.blockerId));
  const reports = await prisma.report.findMany({
    where: { OR: [{ reporterId: userId }, { targetId: userId }] },
    select: { reporterId: true, targetId: true },
  });
  reports.forEach((report) => excluded.add(report.reporterId === userId ? report.targetId : report.reporterId));
  const queryEmbedding = await embed(`${query}. ${source.matchDocument}`).catch(() => null);
  const onlineCompatible = source.connectionMode === "online" || source.connectionMode === "both";
  const candidates = await prisma.profile.findMany({
    where: {
      userId: { not: userId, notIn: [...excluded] },
      user: { is: { isSeed: false, completion: { in: ["BASIC_COMPLETE", "ENRICHED"] } } },
      OR: [
        { metro: source.metro },
        ...(onlineCompatible ? [{ connectionMode: "online" }, { connectionMode: "both" }] : []),
      ],
    },
  }) as MatchProfile[];

  await prisma.findQuery.create({ data: { userId, text: query.trim() } });
  return candidates
    .map((candidate) => {
      const overlap = sharedTerms(query, candidate).length / Math.max(candidate.interests.length, 1);
      const vectorScore = queryEmbedding && Array.isArray(candidate.embedding) ? cosine(queryEmbedding, candidate.embedding as number[]) : 0;
      const score = queryEmbedding ? vectorScore : overlap;
      const profile = safeProfile(candidate);
      return {
        id: candidate.userId,
        name: profile.displayName,
        neighborhood: profile.metro,
        ...profile,
        score: Math.max(0, Math.round(score * 100)),
        why: safeWhy(query, candidate),
        disclosure: "This explanation uses only details the member chose to share.",
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 12);
}
