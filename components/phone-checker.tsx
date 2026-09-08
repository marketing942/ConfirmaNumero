"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Check, LoaderCircle, LockKeyhole, Phone, RotateCcw, Search, ShieldX } from "lucide-react";

type CheckResult = { verified: boolean; label?: string; formatted?: string; message: string };

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (!local) return digits.startsWith("55") ? "+55 " : "";
  const ddd = local.slice(0, 2);
  const subscriber = local.slice(2);
  const split = subscriber.length > 8 ? 5 : 4;
  const first = subscriber.slice(0, split);
  const last = subscriber.slice(split);
  return `${digits.startsWith("55") ? "+55 " : ""}${ddd ? `(${ddd}${ddd.length === 2 ? ") " : ""}` : ""}${first}${last ? `-${last}` : ""}`;
}

export function PhoneChecker() {
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<CheckResult | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setResult(null);
    try {
      const response = await fetch("/api/consultar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number }) });
      const body = await response.json() as CheckResult;
      setResult(body);
      setStatus(response.ok ? "done" : "error");
    } catch {
      setResult({ verified: false, message: "Não foi possível fazer a consulta agora. Tente novamente em instantes." });
      setStatus("error");
    }
  }

  function reset() { setNumber(""); setResult(null); setStatus("idle"); }

  return (
    <div className="checker-card">
      <div className="checker-topline"><span>VERIFICAÇÃO</span><i /><small>BASE OFICIAL</small></div>
      {status === "done" && result ? (
        <div className={`result-view ${result.verified ? "is-valid" : "is-invalid"}`} aria-live="polite">
          <div className="result-icon">{result.verified ? <Check size={38} /> : <ShieldX size={38} />}</div>
          <span className="result-kicker">{result.verified ? "Número confirmado" : "Número não reconhecido"}</span>
          <h2>{result.verified ? "É um canal oficial CPPEM." : "Este número não consta em nossa base."}</h2>
          {result.verified && <div className="official-contact"><small>Identificação do canal</small><strong>{result.label}</strong><span>{result.formatted}</span></div>}
          <p>{result.message}</p>
          {!result.verified && <div className="warning-note"><AlertTriangle size={18} /><span>Não envie dados, não realize pagamentos e interrompa o contato.</span></div>}
          <button className="reset-button" type="button" onClick={reset}><RotateCcw size={17} /> Consultar outro número</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="checker-heading"><div className="checker-shield"><Phone size={24} /></div><div><span>Consulta antifraude</span><h2>Esse número é do CPPEM?</h2></div></div>
          <p className="checker-description">Digite o número que entrou em contato com você.</p>
          <label htmlFor="phone">Número de telefone</label>
          <div className="phone-field"><span>BR</span><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" value={number} onChange={(event) => setNumber(maskPhone(event.target.value))} aria-describedby="phone-help" required /><Phone size={19} /></div>
          <small id="phone-help">Aceitamos números com ou sem o código +55.</small>
          {status === "error" && result && <p className="form-error" role="alert">{result.message}</p>}
          <button className="submit-button" type="submit" disabled={status === "loading" || number.replace(/\D/g, "").length < 10}>
            {status === "loading" ? <><LoaderCircle className="spin" size={19} /> Consultando...</> : <><Search size={19} /> Verificar número</>}
          </button>
          <div className="privacy-line"><LockKeyhole size={14} /><span>O número consultado não é armazenado.</span></div>
        </form>
      )}
    </div>
  );
}
