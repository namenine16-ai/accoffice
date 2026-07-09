import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { Providers } from "@/components/layout/Providers";
import { cn } from "@/utils/cn";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AccOffice",
  description: "Accounting Office Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn(geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-5">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}