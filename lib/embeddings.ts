export async function embed(input: string) {
  const key = process.env.FEATHERLESS_API_KEY;
  const baseUrl = process.env.FEATHERLESS_BASE_URL;
  const model = process.env.FEATHERLESS_EMBEDDING_MODEL;
  if (!key || !baseUrl || !model) return null;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input }),
  });
  if (!response.ok) throw new Error("Featherless embedding request failed");
  const json = await response.json();
  return json.data?.[0]?.embedding as number[] | undefined ?? null;
}
