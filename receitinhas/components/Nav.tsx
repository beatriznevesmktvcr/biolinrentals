"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface Props {
  usuario: { nome: string; admin: boolean } | null;
}

export function Nav({ usuario }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = usuario
    ? [
        { href: "/receitas", label: "Receitas", emoji: "📖" },
        ...(usuario.admin ? [{ href: "/admin", label: "Painel", emoji: "🔑" }] : []),
        { href: "/conta", label: "Minha conta", emoji: "👩" },
      ]
    : [
        { href: "/", label: "Início", emoji: "🏠" },
        { href: "/#como-comprar", label: "Como ter acesso", emoji: "💛" },
      ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]));

  const itens = (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={() => setOpen(false)}
          className={`chip ${isActive(l.href) ? "bg-coral text-white shadow-md" : "bg-white/70 text-ink hover:bg-white"}`}
        >
          <span aria-hidden>{l.emoji}</span> {l.label}
        </Link>
      ))}
      {usuario ? (
        <form action="/sair" method="post">
          <button type="submit" className="chip bg-white/70 text-ink hover:bg-white">
            Sair
          </button>
        </form>
      ) : (
        <Link href="/entrar" onClick={() => setOpen(false)} className="chip bg-ink text-white">
          Entrar
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-cream/80 border-b border-ink/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href={usuario ? "/receitas" : "/"} className="flex items-center gap-2 font-display text-2xl text-coral-dark">
          <span className="text-3xl float inline-block" aria-hidden>
            🥣
          </span>
          Receitinhas
        </Link>

        <div className="hidden md:flex items-center gap-1">{itens}</div>

        <button
          className="md:hidden chip bg-white/80"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Abrir menu"
        >
          {open ? "✕" : "☰"} Menu
        </button>
      </div>

      {open && <div className="md:hidden px-4 pb-4 flex flex-wrap gap-2 pop">{itens}</div>}
    </nav>
  );
}
