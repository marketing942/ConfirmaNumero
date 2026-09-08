import type { Metadata } from "next";
import { Inter, Oxanium, Rajdhani } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const oxanium = Oxanium({ variable: "--font-display", subsets: ["latin"] });
const rajdhani = Rajdhani({ variable: "--font-ui", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Consulta de números oficiais | CPPEM",
  description: "Confirme se um número de WhatsApp ou telefone pertence oficialmente à equipe CPPEM.",
  applicationName: "CPPEM Número Seguro",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="pt-BR" className={`${inter.variable} ${oxanium.variable} ${rajdhani.variable}`}><body>{children}</body></html>;
}
