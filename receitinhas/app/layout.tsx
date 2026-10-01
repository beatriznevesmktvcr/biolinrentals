import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Receitinhas · ideias sem açúcar para as crianças",
    template: "%s · Receitinhas",
  },
  description:
    "Plataforma lúdica com receitas sem açúcar e sal opcional para bebês e crianças, filtros para alergias (sem ovo, sem trigo, sem leite/APLV, sem banana) e gerador de cardápio com IA (com login pelo ChatGPT).",
};

export const viewport: Viewport = {
  themeColor: "#ff8c7a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16">{children}</main>
        <footer className="text-center text-sm text-ink-soft px-4 pb-8">
          <p className="max-w-2xl mx-auto">
            Feito com carinho para mães e pais. As informações aqui são educativas e não substituem a
            orientação do pediatra ou nutricionista da sua família. Em caso de alergia, converse sempre
            com o médico antes de introduzir alimentos novos.
          </p>
        </footer>
      </body>
    </html>
  );
}
