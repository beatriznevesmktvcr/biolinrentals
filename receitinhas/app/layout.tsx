import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import { Nav } from "@/components/Nav";
import { usuarioAtual } from "@/lib/auth";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-quicksand",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Receitinhas · receitas sem açúcar para as crianças",
    template: "%s · Receitinhas",
  },
  description:
    "Portal de receitas sem açúcar e sal opcional para bebês e crianças, separadas por alergia: sem ovo, sem trigo, sem leite (APLV) e sem banana.",
};

export const viewport: Viewport = {
  themeColor: "#ff8c7a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioAtual();
  return (
    <html lang="pt-BR" className={`${quicksand.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav usuario={usuario ? { nome: usuario.nome, admin: usuario.papel === "admin" } : null} />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16">{children}</main>
        <footer className="text-center text-sm text-ink-soft px-4 pb-8">
          <p className="max-w-2xl mx-auto font-light">
            Feito com carinho para mães e pais. As receitas são sugestões educativas e não substituem a
            orientação do pediatra ou nutricionista da sua família. Em caso de alergia, converse sempre
            com o médico antes de introduzir alimentos novos.
          </p>
        </footer>
      </body>
    </html>
  );
}
