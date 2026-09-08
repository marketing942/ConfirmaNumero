import fs from "node:fs";

const sourceEnv = process.env.CPPEM_ENV_FILE ?? "C:/Projetos/cppem/site-cppem/.env.local";
const values = {};
if (fs.existsSync(sourceEnv)) {
  for (const line of fs.readFileSync(sourceEnv, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) values[match[1]] = match[2].replace(/^['\"]|['\"]$/g, "");
  }
}

const token = process.env.NOTION_TOKEN ?? values.NOTION_TOKEN;
const referenceDatabaseId = process.env.NOTION_DATABASE_ID ?? values.NOTION_DATABASE_ID;
if (!token || !referenceDatabaseId) throw new Error("NOTION_TOKEN e NOTION_DATABASE_ID são obrigatórios.");

const headers = { Authorization: `Bearer ${token}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" };
const notion = async (url, init = {}) => {
  const response = await fetch(`https://api.notion.com/v1${url}`, { ...init, headers: { ...headers, ...init.headers } });
  if (!response.ok) throw new Error(`${init.method ?? "GET"} ${url}: ${response.status} ${await response.text()}`);
  return response.json();
};
const plainText = (items = []) => items.map((item) => item.plain_text ?? "").join("");

const search = await notion("/search", { method: "POST", body: JSON.stringify({ query: "Números Oficiais CPPEM", filter: { property: "object", value: "data_source" }, page_size: 50 }) });
let dataSource = search.results?.find((item) => plainText(item.title) === "Números Oficiais CPPEM");
let databaseId = dataSource?.parent?.database_id;

if (!dataSource) {
  const reference = await notion(`/databases/${referenceDatabaseId}`);
  if (reference.parent?.type !== "page_id") throw new Error("A database de referência não possui uma página pai compatível.");
  const database = await notion("/databases", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: reference.parent.page_id },
      icon: { type: "emoji", emoji: "🛡️" },
      title: [{ type: "text", text: { content: "Números Oficiais CPPEM" } }],
      initial_data_source: { properties: {
        Nome: { title: {} },
        "Número E.164": { rich_text: {} },
        Ativo: { checkbox: {} },
        "Data de ativação": { date: {} },
        "Observações": { rich_text: {} },
      } },
    }),
  });
  databaseId = database.id;
  dataSource = database.data_sources?.[0];
}

if (!dataSource?.id) throw new Error("Não foi possível localizar o data source criado.");
const entries = [
  ["CPPEM Marketing", "558194458120"],
  ["Pedagógico CPPEM", "558195460966"],
  ["Emilly CPPEM", "558195881908"],
];
for (const [name, number] of entries) {
  const existing = await notion(`/data_sources/${dataSource.id}/query`, { method: "POST", body: JSON.stringify({ page_size: 1, filter: { property: "Número E.164", rich_text: { equals: number } } }) });
  if (existing.results?.length) continue;
  await notion("/pages", { method: "POST", body: JSON.stringify({
    parent: { type: "data_source_id", data_source_id: dataSource.id },
    properties: {
      Nome: { title: [{ type: "text", text: { content: name } }] },
      "Número E.164": { rich_text: [{ type: "text", text: { content: number } }] },
      Ativo: { checkbox: true },
      "Data de ativação": { date: { start: new Date().toISOString().slice(0, 10) } },
    },
  }) });
}

console.log(`NOTION_PHONE_DATABASE_ID=${databaseId}`);
console.log(`NOTION_PHONE_DATA_SOURCE_ID=${dataSource.id}`);
console.log(`Cadastros iniciais verificados: ${entries.length}`);
