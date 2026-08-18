# Finding Apne Log

**Find your people, wherever you are.**

Finding Apne Log is an AI-assisted community matching app designed for immigrants and people building a life in a new city.

Instead of swiping through profiles, users describe the kind of connection they are looking for — a tennis partner, someone from a similar background, a new friend, or simply people with shared interests — and the system recommends relevant people based on profile context and semantic similarity.

## How it works

1. Create an account and complete a profile with interests, location, availability, connection preferences, and background.
2. Choose which profile information other users are allowed to see.
3. Use **Find People** to describe who you would like to meet in natural language.
4. Featherless AI generates embeddings for the request and user matching context.
5. The backend filters eligible profiles and ranks them using semantic similarity and shared interests.
6. Send an invitation to someone you would like to connect with.
7. A private chat opens only after the other person accepts.

The app also supports blocking and reporting, and private matching information is never exposed directly to other users.

## How it is different

Most dating, friend-finding, and social networking apps start with profiles: users browse people, judge limited information, and decide who to message.

Finding Apne Log starts with **intent** instead.

A user can simply say what they need in that moment — someone to play badminton with, people from a familiar cultural background, a friend nearby, or someone with a particular shared interest — and the system searches for people who may actually fit that context.

The goal is not to maximize swipes or profile views. It is to make introductions feel more intentional, relevant, and mutually wanted.

## Tech Stack

* Next.js 16
* React + TypeScript
* Tailwind CSS
* Prisma
* PostgreSQL on Render
* Featherless AI embeddings
* Render / Vercel deployment support

## Sponsor Integrations

**Featherless AI**
Used to generate semantic embeddings for user profiles and natural-language people searches.

**Render**
Used for PostgreSQL infrastructure and application deployment configuration.

## Run Locally

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and configure:

```env
DATABASE_URL=
FEATHERLESS_API_KEY=
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_CHAT_MODEL=Qwen/Qwen2.5-7B-Instruct
FEATHERLESS_EMBEDDING_MODEL=Qwen/Qwen3-Embedding-0.6B
APP_URL=http://localhost:3000
SESSION_SECRET=
```

Set up the database:

```bash
npx prisma generate --schema prisma/schema.prisma
npx prisma db push --schema prisma/schema.prisma
```

Start the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Project Context

Finding Apne Log was originally built around the **Open Atlas AI for Social Good Hackathon 2026** challenge space, exploring how AI could help newcomers build meaningful community and find the people they need in a new place.

The current repository preserves the working MVP as a foundation for future development.
