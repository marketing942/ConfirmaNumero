import fs from "node:fs";

type RegistryEntry = { numberE164: string; label: string };

const OFFICIAL_BASELINE: RegistryEntry[] = [
  { numberE164: "558194458120", label: "CPPEM Marketing" },
  { numberE164: "558195460966", label: "Pedagógico CPPEM" },
  { numberE164: "558195881908", label: "Emilly CPPEM" },
];

export function normalizeBrazilianPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits;
  return null;
}

export function formatBrazilianPhone(e164: string) {
  const local = e164.startsWith("55") ? e164.slice(2) : e164;
  const ddd = local.slice(0, 2);
  const subscriber = local.slice(2);
  const split = subscriber.length > 8 ? 5 : 4;
  return `+55 (${ddd}) ${subscriber.slice(0, split)}-${subscriber.slice(split)}`;
}

function baselineLookup(numberE164: string) {
  return OFFICIAL_BASELINE.find((entry) => entry.numberE164 === numberE164) ?? null;
}

async function lookupSupabase(numberE164: string): Promise<RegistryEntry | null | undefined> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return undefined;
  const endpoint = new URL("/rest/v1/cppem_phone_registry", url);
  endpoint.searchParams.set("select", "number_e164,label");
  endpoint.searchParams.set("number_e164", `eq.${numberE164}`);
  endpoint.searchParams.set("active", "eq.true");
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(3500) });
  if (!response.ok) throw new Error(`Supabase respondeu ${response.status}`);
  const rows = await response.json() as Array<{ number_e164: string; label: string }>;
  return rows[0] ? { numberE164: rows[0].number_e164, label: rows[0].label } : null;
}

function notionPlainText(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.map((item) => (item && typeof item === "object" && "plain_text" in item ? String(item.plain_text) : "")).join("");
}

function readSharedDevelopmentEnv(name: string) {
  if (process.env.NODE_ENV === "production") return undefined;
  try {
    const source = fs.readFileSync("C:/Projetos/cppem/site-cppem/.env.local", "utf8");
    const line = source.split(/\r?\n/).find((item) => item.startsWith(`${name}=`));
    return line?.slice(name.length + 1).replace(/^['\"]|['\"]$/g, "");
  } catch {
    return undefined;
  }
}

async function lookupNotion(numberE164: string): Promise<RegistryEntry | null | undefined> {
  const token = process.env.NOTION_TOKEN ?? readSharedDevelopmentEnv("NOTION_TOKEN");
  const databaseId = process.env.NOTION_PHONE_DATABASE_ID ?? "3f543717-1061-47ee-8bec-fc6116a01287";
  if (!token || !databaseId) return undefined;
  const headers = { Authorization: `Bearer ${token}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" };
  const databaseResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
  if (!databaseResponse.ok) throw new Error(`Notion database respondeu ${databaseResponse.status}`);
  const database = await databaseResponse.json() as { data_sources?: Array<{ id: string }> };
  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) throw new Error("Database do Notion sem data source");
  const queryResponse = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
    method: "POST", headers, cache: "no-store", signal: AbortSignal.timeout(3500),
    body: JSON.stringify({ page_size: 1, filter: { and: [{ property: "Número E.164", rich_text: { equals: numberE164 } }, { property: "Ativo", checkbox: { equals: true } }] } }),
  });
  if (!queryResponse.ok) throw new Error(`Notion query respondeu ${queryResponse.status}`);
  const data = await queryResponse.json() as { results?: Array<{ properties?: Record<string, { title?: unknown; rich_text?: unknown }> }> };
  const properties = data.results?.[0]?.properties;
  if (!properties) return null;
  const label = notionPlainText(properties.Nome?.title) || notionPlainText(properties.Nome?.rich_text) || "Canal oficial CPPEM";
  return { numberE164, label };
}

export async function findOfficialPhone(numberE164: string) {
  const source = (process.env.PHONE_REGISTRY_SOURCE ?? "notion").toLowerCase();
  const lookups = source === "supabase" ? [lookupSupabase] : source === "notion" ? [lookupNotion] : [lookupSupabase, lookupNotion];
  let remoteSourceWasReached = false;
  for (const lookup of lookups) {
    try {
      const match = await lookup(numberE164);
      if (match) return match;
      if (match === null) remoteSourceWasReached = true;
    } catch (error) {
      remoteSourceWasReached = true;
      console.error("[phone-registry] Fonte indisponível:", error instanceof Error ? error.message : "erro desconhecido");
    }
  }
  return remoteSourceWasReached ? null : baselineLookup(numberE164);
}
