import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Web3Provider } from "@/providers/Web3Provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InáPay",
  description:
    "Pagamentos digitais rápidos, simples e modernos. Powered by Celo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta
          name="talentapp:project_verification"
          content="c0dd93bd76cd1cb69ae3a6a4b2a1024c18ed2e2d07e6ce5c88e94c7ec27ce878263470cfff29512ac8b22f116fd20a4c592392ea651a5ed82e544ae880c0430f"
        />
      </head>
      <body className="min-h-full bg-celo-black text-celo-white">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
