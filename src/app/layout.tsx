import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "LogFi — Log Your Money. Own Your Life.",
  description: "Catat keuangan, kelola tugas, lacak kebiasaan — semua dalam satu dashboard. Asisten harian pribadi untuk kehidupan finansial yang lebih baik.",
  keywords: ["personal finance", "habit tracker", "task manager", "logfi", "daily assistant"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className={`${inter.className} bg-[#0A0A0B] text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
