import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Great_Vibes,
  Outfit,
} from "next/font/google";
import { SmoothScroll } from "@/components/cinematic/SmoothScroll";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Lívia Sodré | Estética Avançada, Micropigmentação e Spa",
  description:
    "Clínica de estética em Guaratiba — micropigmentação, estética facial e corporal, cílios, unhas e spa. Beleza que transforma. Cuidado que conecta.",
  openGraph: {
    title: "Lívia Sodré Estética Avançada",
    description: "Beleza que transforma. Cuidado que conecta.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${script.variable} ${body.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/cinematic/frames/frame-022.webp"
          type="image/webp"
        />
        <link
          rel="preload"
          as="image"
          href="/cinematic/frames/frame-040.webp"
          type="image/webp"
        />
      </head>
      <body className="min-h-full font-[family-name:var(--font-body)]">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
