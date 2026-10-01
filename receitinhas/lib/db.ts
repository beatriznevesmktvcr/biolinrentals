/**
 * Banco de dados (só usuários; as receitas ficam em data/receitas.ts).
 *  - Em produção (Vercel): Postgres via DATABASE_URL (ex.: Neon, criado com um clique na Vercel).
 *  - Sem DATABASE_URL (no seu computador): usa o PGlite, um Postgres embutido que salva em ./dados.
 * As tabelas são criadas automaticamente na primeira vez.
 */
type Row = Record<string, unknown>;
type Executor = (text: string, params: unknown[]) => Promise<Row[]>;

const g = globalThis as unknown as { __receitinhasDb?: Promise<Executor> };

async function criarExecutor(): Promise<Executor> {
  const url = process.env.DATABASE_URL;
  let exec: Executor;
  if (url) {
    const { default: postgres } = await import("postgres");
    const local = /localhost|127\.0\.0\.1/.test(url);
    const sql = postgres(url, { ssl: local ? false : "require", max: 5, prepare: false });
    exec = async (text, params) => (await sql.unsafe(text, params as never[])) as unknown as Row[];
  } else {
    if (process.env.VERCEL) {
      throw new Error(
        "Falta o banco de dados: na Vercel, abra a aba Storage, crie um banco Neon (Postgres), conecte ao projeto e faça um novo deploy.",
      );
    }
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdirSync } = await import("node:fs");
    const dir = process.env.PGLITE_DIR ?? "./dados/receitinhas";
    mkdirSync(dir, { recursive: true });
    const pg = new PGlite(dir);
    exec = async (text, params) => (await pg.query<Row>(text, params)).rows;
  }
  await prepararEsquema(exec);
  return exec;
}

function db(): Promise<Executor> {
  g.__receitinhasDb ??= criarExecutor().catch((e) => {
    g.__receitinhasDb = undefined;
    throw e;
  });
  return g.__receitinhasDb;
}

/** Executa uma consulta SQL com parâmetros ($1, $2...). */
export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  const exec = await db();
  return (await exec(text, params)) as T[];
}

export async function um<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

async function prepararEsquema(exec: Executor) {
  const ddl = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL DEFAULT 'membro',
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      observacao TEXT NOT NULL DEFAULT '',
      criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
      ultimo_acesso TIMESTAMPTZ
    );
  `;
  for (const stmt of ddl.split(";").map((s) => s.trim()).filter(Boolean)) {
    await exec(stmt, []);
  }

  // Administradora inicial a partir das variáveis de ambiente.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  if (email && senha) {
    const [{ n: admins }] = (await exec("SELECT count(*)::int AS n FROM usuarios WHERE papel = 'admin'", [])) as { n: number }[];
    if (admins === 0) {
      const { hashSync } = await import("bcryptjs");
      await exec(
        `INSERT INTO usuarios (email, nome, senha_hash, papel) VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO UPDATE SET papel = 'admin'`,
        [email, process.env.ADMIN_NOME ?? "Administradora", hashSync(senha, 10)],
      );
    }
  }
}
