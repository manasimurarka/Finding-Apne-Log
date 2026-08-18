# Finding Apne Log

Finding Apne Log helps immigrants and people who are new to a city find community through shared interests, goals, and availability.

Moving somewhere new can make it hard to find the people who feel like your people. This project creates a calmer, consent-first way to meet others, whether someone is looking for a tennis partner, a cafe companion, a language-exchange group, an online friend, or simply a familiar community in a new place.

## What it does

1. Create an account and complete a profile with interests, connection preferences, availability, hometown, and move-to-the-US context.
2. Choose which profile details other members can see.
3. Use **Find people** to describe a connection in everyday language.
4. Receive text-first suggestions based on shared interests, goals, availability, location, and online or in-person preferences.
5. Send an invitation with an optional note.
6. The recipient decides whether to accept, decline, block, or report the request. A two-way chat opens only after acceptance.

## Built for privacy and consent

Finding Apne Log does not use photos or swipe mechanics to decide who is worth meeting. It is designed around context, choice, and mutual consent.

- Members control visibility for hometown, country, interests, availability, connection type, and goals.
- Date of birth, gender, move date, raw profile answers, matching documents, and embeddings remain private.
- Match explanations use only information a member chose to show.
- Invitations are one-way until the recipient accepts.
- Chats are available only to the two people in an accepted connection.
- Members can block or report others from matches, invitations, and conversations.

## How the matching is agentic

The matching workflow uses an AI-assisted retrieval layer instead of a fixed list of profiles:

- The server creates a private matching document from profile context.
- Featherless embeddings turn that context and each Find people request into semantic vectors.
- Postgres with pgvector retrieves relevant completed profiles while excluding blocked and reported pairs.
- The app ranks possible connections using semantic relevance, shared activity interests, connection mode, and availability.
- The browser receives only a sanitized profile preview and a safe explanation. It never receives embeddings, raw matching context, or private profile fields.

This makes the experience different from Tinder, Bumble BFF, and typical friend-finder apps. The goal is not to judge a photo in seconds. It is to help people find a useful, comfortable, and mutually wanted connection based on what they are actually looking for.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set the required values:

   ```bash
   DATABASE_URL=
   FEATHERLESS_API_KEY=
   FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
   FEATHERLESS_CHAT_MODEL=
   FEATHERLESS_EMBEDDING_MODEL=Qwen/Qwen3-Embedding-0.6B
   APP_URL=http://localhost:3000
   SESSION_SECRET=
   ```

3. Enable pgvector in the Postgres database and apply the schema:

   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

   ```bash
   npx prisma db push --schema prisma/schema.prisma
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

5. Validate before deployment:

   ```bash
   npm run typecheck
   npm run build
   ```

## Deploying safely

Keep all secrets out of Git. `.env` and `.env.local` are ignored by this repository.

For a Vercel deployment, add `DATABASE_URL`, `FEATHERLESS_API_KEY`, `FEATHERLESS_BASE_URL`, `FEATHERLESS_CHAT_MODEL`, `FEATHERLESS_EMBEDDING_MODEL`, `APP_URL`, and `SESSION_SECRET` in Vercel Project Settings under Environment Variables. Do not use a `NEXT_PUBLIC_` prefix for any of them.

When Vercel connects to Render Postgres, use the Render external database URL. Use a separate database for Vercel preview deployments when possible so test deployments do not access production member data.

## Tech stack

- Next.js 16 and TypeScript
- Tailwind CSS
- Prisma and Render Postgres with pgvector
- Featherless OpenAI-compatible embeddings
- Server-side username/password authentication with HttpOnly session cookies
- Vercel or Render for deployment

## Hackathon context

Built for the Open Atlas Data for Social Good Hackathon as a community-focused, platonic connection tool for immigrants and people building a new life in the United States.
