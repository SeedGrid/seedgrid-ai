import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import { PRODUCT_NAME } from "@/lib/brand";

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
  title: `${PRODUCT_NAME} Admin`,
  description: `Backoffice do ${PRODUCT_NAME} com identidade visual SeedGrid.`,
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
