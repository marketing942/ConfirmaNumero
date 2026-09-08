import { findOfficialPhone, formatBrazilianPhone, normalizeBrazilianPhone } from "@/lib/phone-registry";

const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt <= now) { attempts.set(ip, { count: 1, resetAt: now + 60_000 }); return false; }
  current.count += 1;
  return current.count > 15;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) return Response.json({ verified: false, message: "Muitas consultas seguidas. Aguarde um minuto e tente novamente." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ verified: false, message: "Informe um número válido." }, { status: 400 }); }
  const rawNumber = body && typeof body === "object" && "number" in body ? String(body.number) : "";
  const numberE164 = normalizeBrazilianPhone(rawNumber);
  if (!numberE164) return Response.json({ verified: false, message: "Digite um telefone brasileiro completo, com DDD." }, { status: 400 });
  const entry = await findOfficialPhone(numberE164);
  if (!entry) return Response.json({ verified: false, message: "O telefone informado não pertence aos canais oficiais cadastrados pela CPPEM." });
  return Response.json({ verified: true, label: entry.label, formatted: formatBrazilianPhone(entry.numberE164), message: "Você pode continuar o atendimento, mantendo os cuidados básicos de segurança." });
}
