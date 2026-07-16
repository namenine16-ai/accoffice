import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { Providers } from "@/components/layout/Providers";
import { PermissionProvider } from "@/components/auth/PermissionProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { permissionsForRoles } from "@/lib/permissions";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarCollapsed = cookieStore.get("sidebar_collapsed")?.value === "true";
  const headersList = await headers();
  const isAuthPage = headersList.get("x-pathname") === "/login";

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const permissions = permissionsForRoles(session?.roles ?? []);

  return (
    <html
      lang="th"
      className={cn(geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body>
        <Providers>
          <PermissionProvider session={session} permissions={permissions}>
            {isAuthPage ? (
              children
            ) : (
              <NotificationProvider>
                <div className="flex min-h-screen flex-col md:flex-row">
                  <Sidebar initialCollapsed={sidebarCollapsed} />
                  <main className="flex-1 p-5">
                    {children}
                  </main>
                </div>
              </NotificationProvider>
            )}
          </PermissionProvider>
        </Providers>
      </body>
    </html>
  );
}