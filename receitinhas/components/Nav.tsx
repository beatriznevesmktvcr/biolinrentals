"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Início", emoji: "🏠" },
  { href: "/receitas", label: "Receitas", emoji: "📖" },
  { href: "/gerar", label: "Gerar com IA", emoji: "✨" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-cream/80 border-b border-ink/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-coral-dark">
          <span className="text-3xl float inline-block" aria-hidden>
            🥣
          </span>
          Receitinhas
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`chip ${
                isActive(l.href) ? "bg-coral text-white shadow-md" : "bg-white/70 text-ink hover:bg-white"
              }`}
            >
              <span aria-hidden>{l.emoji}</span> {l.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden chip bg-white/80"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Abrir menu"
        >
          {open ? "✕" : "☰"} Menu
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-wrap gap-2 pop">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`chip ${isActive(l.href) ? "bg-coral text-white" : "bg-white text-ink"}`}
            >
              <span aria-hidden>{l.emoji}</span> {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
