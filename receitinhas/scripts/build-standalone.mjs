// Gera receitinhas.html: a plataforma inteira em um único arquivo HTML.
// Uso: npm run build:html
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");

const { receitas } = await import(path.join(root, "data/receitas.ts"));
const { ALERGENOS, REFEICOES, IDADES } = await import(path.join(root, "lib/types.ts"));
const { IDADE_LABEL } = await import(path.join(root, "lib/cardapio.ts"));

const data = { receitas, ALERGENOS, REFEICOES, IDADES, IDADE_LABEL };
const json = JSON.stringify(data).replace(/</g, "\\u003c");

const template = readFileSync(path.join(here, "standalone.template.html"), "utf8");
const out = template.replace("__DATA__", json);
writeFileSync(path.join(root, "receitinhas.html"), out);
console.log(`receitinhas.html gerado (${(out.length / 1024).toFixed(0)} KB, ${receitas.length} receitas)`);
