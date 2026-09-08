import Image from "next/image";
import { ArrowDown, BadgeCheck, Database, LockKeyhole, SearchCheck, ShieldCheck } from "lucide-react";
import { PhoneChecker } from "@/components/phone-checker";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#inicio" aria-label="CPPEM — início">
            <Image src="/brand/emblema-leao.webp" width={50} height={50} alt="" priority />
            <span><strong>CPPEM</strong><small>Número seguro</small></span>
          </a>
          <a className="header-link" href="#como-funciona">Como funciona</a>
          <a className="ghost-button" href="https://cppem.com.br" target="_blank" rel="noreferrer">Ir para o site CPPEM</a>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow"><ShieldCheck size={15} /> Canal oficial de verificação</span>
            <h1>Antes de responder,<br /><span>confirme o número.</span></h1>
            <p>Recebeu uma mensagem em nome do CPPEM? Digite o telefone e descubra, em poucos segundos, se ele pertence à nossa equipe.</p>
            <div className="trust-row">
              <span><LockKeyhole size={17} /> Consulta privada</span>
              <span><BadgeCheck size={17} /> Base oficial CPPEM</span>
            </div>
          </div>
          <PhoneChecker />
        </div>
        <a className="scroll-cue" href="#como-funciona" aria-label="Ver como funciona"><ArrowDown size={18} /></a>
      </section>

      <section className="how-section" id="como-funciona">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Proteção em três passos</span>
            <h2>Uma checagem simples.<br /><span>Uma decisão mais segura.</span></h2>
          </div>
          <div className="steps-grid">
            <article><span className="step-number">01</span><div className="step-icon"><SearchCheck size={25} /></div><h3>Digite o número</h3><p>Informe o telefone completo, com DDD. Você pode colar com ou sem espaços e pontuação.</p></article>
            <article><span className="step-number">02</span><div className="step-icon"><Database size={25} /></div><h3>Consulte a base</h3><p>O sistema compara o telefone com o cadastro oficial de canais ativos do CPPEM.</p></article>
            <article><span className="step-number">03</span><div className="step-icon"><ShieldCheck size={25} /></div><h3>Veja o resultado</h3><p>Você recebe uma confirmação clara para continuar a conversa ou interromper o contato.</p></article>
          </div>
        </div>
      </section>

      <section className="alert-section">
        <div className="container alert-card">
          <Image src="/brand/emblema-leao.webp" width={84} height={84} alt="" />
          <div><span className="eyebrow">Atenção contra golpes</span><h2>A CPPEM nunca solicita senhas ou códigos de acesso.</h2><p>Mesmo quando o número for confirmado, não compartilhe senhas, códigos recebidos por SMS ou dados completos do cartão.</p></div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <Image src="/brand/logo-cppem.png" width={700} height={253} alt="CPPEM" />
          <p>Consulta oficial de números CPPEM</p>
          <span>© {new Date().getFullYear()} CPPEM Concursos Públicos</span>
        </div>
      </footer>
    </main>
  );
}
