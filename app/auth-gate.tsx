"use client";

import { useState } from "react";
import { Check, LockKeyhole, Sparkles } from "lucide-react";

type Account = { id: string; username: string; displayName?: string; completion: "NEW" | "BASIC_COMPLETE" | "ENRICHED"; metro?: string; interests: string[]; availability?: string; goals?: string };

export function AuthGate({ onSuccess }: { onSuccess: (user: Account) => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, username, password }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    onSuccess((await fetch("/api/auth").then((result) => result.json())).user);
  }

  return <main className="grid min-h-screen bg-[#f8f6f0] lg:grid-cols-2">
    <section className="hidden flex-col justify-between bg-[#172536] p-12 text-white lg:flex">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d85c48] text-xl font-bold">F</span><span className="text-2xl font-bold">Finding Apne Log</span></div>
      <div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-[#8ed6bf]"><Sparkles size={16}/>Community, on your terms</p><h1 className="mt-5 max-w-lg text-5xl font-bold leading-tight">Meet people through shared interests.</h1></div>
    </section>
    <section className="grid place-items-center p-6"><form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-[#dfe3db] bg-white p-8 shadow-xl">
      <div className="mb-7 flex items-center justify-between"><div><p className="font-bold text-[#2c706b]">Finding Apne Log</p><h2 className="mt-1 text-3xl font-bold text-[#172536]">{mode === "signup" ? "Create your account" : "Welcome back"}</h2></div><LockKeyhole className="text-[#d85c48]"/></div>
      <div className="mb-6 flex rounded-xl bg-[#f3f4ef] p-1"><button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-2 text-sm font-bold ${mode === "signup" ? "bg-white shadow-sm" : "text-[#65717d]"}`}>Create account</button><button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg py-2 text-sm font-bold ${mode === "login" ? "bg-white shadow-sm" : "text-[#65717d]"}`}>Log in</button></div>
      <label className="block text-sm font-bold text-[#42505d]">Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label>
      <label className="mt-5 block text-sm font-bold text-[#42505d]">Password<input autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label>
      {error && <p className="mt-4 rounded-xl bg-[#fff0eb] p-3 text-sm font-semibold text-[#b74331]">{error}</p>}
      <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d85c48] py-3.5 font-bold text-white">{mode === "signup" ? "Create account" : "Log in"}<Check size={17}/></button>
    </form></section>
  </main>;
}

export function Onboarding({ onComplete }: { onComplete: (user: Account) => void }) {
  const [displayName, setDisplayName] = useState(""); const [metro, setMetro] = useState("San Francisco"); const [interests, setInterests] = useState(""); const [availability, setAvailability] = useState(""); const [connectionMode, setConnectionMode] = useState("in-person"); const [goals, setGoals] = useState(""); const [hometown, setHometown] = useState(""); const [country, setCountry] = useState("India"); const [birthDate, setBirthDate] = useState(""); const [gender, setGender] = useState(""); const [moveDate, setMoveDate] = useState(""); const [adult, setAdult] = useState(false); const [error, setError] = useState("");
  const limit = new Date(); limit.setMonth(limit.getMonth() + 6);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const interestList = interests.split(",").map((item) => item.trim()).filter(Boolean);
    const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, metro, interests: interestList, availability, connectionMode, goals, hometown, country, birthDate, gender, moveDate, isAdult: adult }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    onComplete(data.user);
  }
  return <main className="min-h-screen bg-[#f8f6f0] px-5 py-10 text-[#172536]"><div className="mx-auto max-w-2xl">
    <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-[#2c706b]"><Sparkles size={16}/>Profile setup</p><h1 className="mt-3 text-4xl font-bold">Tell us a little about yourself.</h1><p className="mt-4 max-w-xl text-[#5c6978]">Complete these details to start finding people. You can change them anytime.</p>
    <form onSubmit={save} className="mt-8 space-y-6 rounded-3xl border border-[#dfe3db] bg-white p-7 shadow-sm">
      <aside className="rounded-2xl bg-[#e1f0eb] p-4 text-sm leading-relaxed text-[#315b57]"><strong>This information helps us build your profile and make better suggestions.</strong><br/>You choose what other members can see, and you can edit it later.</aside>
      <label className="block font-bold">What should people call you?<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="First name or chosen name" className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block font-bold">Hometown or city<input value={hometown} onChange={(event) => setHometown(event.target.value)} placeholder="For example, Mumbai" className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label><label className="block font-bold">Home country<input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="India" className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label></div>
      <label className="block font-bold">Your Bay Area metro<select value={metro} onChange={(event) => setMetro(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe3db] bg-white px-4 py-3 font-normal outline-[#2c706b]"><option>San Francisco</option><option>East Bay</option><option>South Bay</option><option>Peninsula</option></select></label>
      <label className="block font-bold">What are you into?<textarea value={interests} onChange={(event) => setInterests(event.target.value)} placeholder="Cafe hopping, watching basketball, crocheting, art, trying new bars" className="mt-2 min-h-24 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/><span className="mt-2 block text-sm font-normal text-[#65717d]">Add at least three hobbies or interests, separated by commas.</span></label>
      <fieldset><legend className="font-bold">How would you like to connect?</legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{[["in-person", "In person", "Meet locally"], ["online", "Online", "Chat from anywhere"], ["both", "Both", "Open to either"]].map(([value, title, copy]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 ${connectionMode === value ? "border-[#2c706b] bg-[#e1f0eb]" : "border-[#dfe3db]"}`}><input className="sr-only" type="radio" value={value} checked={connectionMode === value} onChange={(event) => setConnectionMode(event.target.value)}/><strong className="block">{title}</strong><span className="mt-1 block text-xs text-[#65717d]">{copy}</span></label>)}</div></fieldset>
      <label className="block font-bold">When are you usually free to connect?<input value={availability} onChange={(event) => setAvailability(event.target.value)} placeholder="For example, weeknights after 6pm or Sunday mornings" className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label>
      <label className="block font-bold">What kinds of connections are you hoping for?<input value={goals} onChange={(event) => setGoals(event.target.value)} placeholder="For example, creative friends, cafe hopping, or online chats" className="mt-2 w-full rounded-xl border border-[#dfe3db] px-4 py-3 font-normal outline-[#2c706b]" required/></label>
      <div className="rounded-2xl border border-[#dfe3db] p-5"><p className="font-bold">Private details</p><p className="mt-1 text-sm text-[#65717d]">These details help with suggestions. Other members cannot see them.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Date of birth<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe3db] px-3 py-2 font-normal" required/></label><label className="block text-sm font-bold">Gender<select value={gender} onChange={(event) => setGender(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dfe3db] bg-white px-3 py-2 font-normal" required><option value="">Select an option</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer to self-describe</option><option>Prefer not to say</option></select></label></div><label className="mt-4 block text-sm font-bold">When did you move or plan to move to the US?<input type="date" value={moveDate} onChange={(event) => setMoveDate(event.target.value)} max={limit.toISOString().slice(0, 10)} className="mt-2 w-full rounded-xl border border-[#dfe3db] px-3 py-2 font-normal" required/><span className="mt-1 block font-normal text-[#65717d]">If you have not moved yet, choose a date within the next six months.</span></label></div>
      <label className="flex items-start gap-3 rounded-xl bg-[#f8f6f0] p-4 text-sm"><input type="checkbox" checked={adult} onChange={(event) => setAdult(event.target.checked)} className="mt-1"/><span><strong>I confirm that I am 18 or older.</strong><br/><span className="text-[#65717d]">Finding Apne Log is for adult community connection.</span></span></label>
      {error && <p className="rounded-xl bg-[#fff0eb] p-3 text-sm font-semibold text-[#b74331]">{error}</p>}<button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d85c48] py-3.5 font-bold text-white">Start finding people <Check size={17}/></button>
    </form>
  </div></main>;
}
