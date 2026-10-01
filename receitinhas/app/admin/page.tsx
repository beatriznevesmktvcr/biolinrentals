import type { Metadata } from "next";
import { exigirAdmin, type Usuario } from "@/lib/auth";
import { q } from "@/lib/db";
import { receitas } from "@/data/receitas";
import { FormNovoMembro, LinhaMembro } from "./Painel";

export const metadata: Metadata = { title: "Painel" };

export default async function AdminPage() {
  const admin = await exigirAdmin();
  const membros = await q<Usuario>(
    "SELECT id, email, nome, papel, ativo, observacao, criado_em, ultimo_acesso FROM usuarios WHERE papel = 'membro' ORDER BY criado_em DESC",
  );
  const ativos = membros.filter((m) => m.ativo).length;

  return (
    <div className="pt-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl">🔑 Painel</h1>
        <p className="text-ink-soft text-lg font-light">
          Oi, {admin.nome.split(" ")[0]}. Aqui você cria os logins depois do Pix e cuida dos membros.
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        {[
          ["👩‍👧", "Membros ativos", String(ativos)],
          ["🧾", "Logins criados", String(membros.length)],
          ["📖", "Receitas no portal", String(receitas.length)],
        ].map(([e, t, n]) => (
          <div key={t} className="card p-5">
            <div className="text-3xl" aria-hidden>
              {e}
            </div>
            <p className="text-3xl font-display mt-1">{n}</p>
            <p className="text-sm text-ink-soft font-light">{t}</p>
          </div>
        ))}
      </section>

      <section className="max-w-2xl">
        <FormNovoMembro />
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl">Membros</h2>
        {membros.length === 0 ? (
          <p className="card p-6 text-ink-soft font-light">Nenhum login criado ainda. Crie o primeiro acima 💛</p>
        ) : (
          <div className="card overflow-hidden divide-y divide-ink/5">
            {membros.map((m) => (
              <LinhaMembro key={m.id} membro={JSON.parse(JSON.stringify(m))} />
            ))}
          </div>
        )}
      </section>

      <section className="card p-6 bg-sky/40 font-light">
        <h2 className="text-2xl mb-2">📝 Como adicionar receitas</h2>
        <p>
          As receitas ficam no arquivo <code>data/receitas.ts</code> do projeto. É só me mandar a receita
          (nome, ingredientes, modo de preparo e para quais restrições ela serve) que eu coloco no portal e
          publico. Fotos entram na pasta <code>public/fotos</code>.
        </p>
      </section>
    </div>
  );
}
