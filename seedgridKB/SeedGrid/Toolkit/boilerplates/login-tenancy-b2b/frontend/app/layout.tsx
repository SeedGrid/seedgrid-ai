import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import { LocaleProvider } from "@/components/providers/locale-provider";

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const fontBody = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SeedGrid App",
  description: "Aplicativo do cliente SeedGrid: conta, usuarios, perfis, assinatura e temas.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${fontDisplay.variable} ${fontBody.variable}`}>
        {/* i18n POR FORA do resto: o `LocaleProvider` (copiado do seedgrid-pulse-ui) monta o
            `SgComponentsI18nProvider` do fe-components e le a preferencia do `localStorage` por
            `useSyncExternalStore` — nunca no inicializador do `useState`, que causava o React #418
            em toda tela. Ver o cabecalho de components/providers/locale-provider.tsx. */}
        <LocaleProvider defaultLocale="pt-BR">
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
