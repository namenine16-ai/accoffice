import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

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
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "20px" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}