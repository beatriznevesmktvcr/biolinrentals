import Link from "next/link";
import { receitas } from "@/data/receitas";
import { ALERGENOS, REFEICOES, type Alergeno } from "@/lib/types";
import { usuarioAtual } from "@/lib/auth";
import { textosDaLoja } from "@/lib/config";

export default async function Home() {
  const [usuario, loja] = await Promise.all([usuarioAtual(), textosDaLoja()]);
  const contagem = (chave: Alergeno) => receitas.filter((r) => r[chave]).length;
  const porRefeicao = (k: keyof typeof REFEICOES) => receitas.filter((r) => r.refeicao === k).length;
  const whatsappUrl = loja.whatsapp ? `https://wa.me/${loja.whatsapp.replace(/\D/g, "")}` : null;

  return (
    <div className="space-y-16 pt-12">
      {/* HERO */}
      <section className="text-center space-y-6">
        <div className="text-6xl md:text-7xl flex justify-center gap-3" aria-hidden>
          <span className="float">🍓</span>
          <span className="float" style={{ animationDelay: "0.6s" }}>
            🥑
          </span>
          <span className="float" style={{ animationDelay: "1.2s" }}>
            🥕
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl leading-tight font-light">
          Receitinhas para todo dia,
          <br />
          <span className="text-coral-dark font-medium">sem açúcar e sem sufoco</span>
        </h1>
        <p className="text-lg md:text-xl text-ink-soft max-w-2xl mx-auto font-light">
          Um portal com receitas pensadas para bebês e crianças: sem açúcar, sal opcional e separadas por
          alergia. Pague uma vez, use para sempre.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {usuario ? (
            <Link href="/receitas" className="btn btn-primary text-lg">
              📖 Ver as receitas
            </Link>
          ) : (
            <>
              <a href="#como-comprar" className="btn btn-primary text-lg">
                💛 Quero acesso vitalício
              </a>
              <Link href="/entrar" className="btn btn-ghost text-lg">
                Já tenho login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* O QUE TEM DENTRO */}
      <section className="space-y-5">
        <h2 className="text-3xl text-center">O que você encontra lá dentro</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-5 bg-sun/60">
            <div className="text-4xl" aria-hidden>
              🌟
            </div>
            <h3 className="text-xl mt-2">Gerais</h3>
            <p className="text-sm text-ink-soft font-light">Sem açúcar e sal opcional, sempre.</p>
            <p className="text-xs font-semibold text-coral-dark mt-2">{receitas.length} receitas</p>
          </div>
          {(Object.keys(ALERGENOS) as Alergeno[]).map((k, i) => (
            <div key={k} className={`card p-5 ${["bg-peach/60", "bg-mint/60", "bg-sky/60", "bg-berry/60"][i]}`}>
              <div className="text-4xl" aria-hidden>
                {ALERGENOS[k].emoji}
              </div>
              <h3 className="text-xl mt-2">{ALERGENOS[k].label}</h3>
              <p className="text-sm text-ink-soft font-light">{ALERGENOS[k].descricao}</p>
              <p className="text-xs font-semibold text-coral-dark mt-2">{contagem(k)} receitas</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {(Object.keys(REFEICOES) as (keyof typeof REFEICOES)[]).map((k) => (
            <span key={k} className={`chip ${REFEICOES[k].cor} text-ink text-base`}>
              {REFEICOES[k].emoji} {REFEICOES[k].label} · {porRefeicao(k)}
            </span>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="grid md:grid-cols-3 gap-5">
        {[
          ["1️⃣", "Faça o Pix", "Você paga uma única vez. Nada de mensalidade."],
          ["2️⃣", "Receba seu login", "Eu crio seu usuário e te mando login e senha no WhatsApp."],
          ["3️⃣", "Use para sempre", "Entre quando quiser, no celular ou no computador. Novas receitas entram sem custo."],
        ].map(([e, t, d]) => (
          <div key={t} className="card p-6">
            <div className="text-4xl" aria-hidden>
              {e}
            </div>
            <h3 className="text-xl mt-2">{t}</h3>
            <p className="text-ink-soft font-light mt-1">{d}</p>
          </div>
        ))}
      </section>

      {/* COMO COMPRAR */}
      <section id="como-comprar" className="card p-6 md:p-10 bg-lilac/50 text-center space-y-4 scroll-mt-24">
        <h2 className="text-3xl">Como ter acesso</h2>
        {loja.valor && <p className="text-4xl text-coral-dark font-medium">{loja.valor}</p>}
        <p className="max-w-xl mx-auto whitespace-pre-line font-light text-lg">{loja.comoComprar}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener" className="btn btn-primary text-lg">
              💬 Chamar no WhatsApp
            </a>
          )}
          <Link href="/entrar" className="btn btn-ghost text-lg">
            Já tenho login
          </Link>
        </div>
      </section>

      {/* REGRINHAS */}
      <section className="card p-6 md:p-8 bg-sun/60">
        <h2 className="text-2xl md:text-3xl mb-4">Nossas regrinhas de ouro</h2>
        <ul className="grid md:grid-cols-3 gap-4 text-ink font-light">
          <li className="flex gap-3">
            <span className="text-3xl" aria-hidden>
              🚫🍬
            </span>
            <span>
              <strong className="font-semibold">Zero açúcar</strong> até os 2 anos: nem mel, nem adoçante, nem suco de caixinha.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-3xl" aria-hidden>
              🧂
            </span>
            <span>
              <strong className="font-semibold">Sal opcional:</strong> nada antes de 1 ano, e só uma pitadinha depois.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-3xl" aria-hidden>
              🥣
            </span>
            <span>
              <strong className="font-semibold">Comida de verdade:</strong> ingredientes simples que você já tem em casa.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
