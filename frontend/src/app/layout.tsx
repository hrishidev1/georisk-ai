import type { Metadata } from "next";
import "@/app/globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "GeoRisk AI — Intelligent Geospatial Workspace",
  description:
    "Next-generation geospatial data analytics and spatial risk forecasting platform built with clarity and precision.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground antialiased selection:bg-blue-600/10 selection:text-blue-700"
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <div className="animate-in-fade flex min-h-screen flex-col">
              {children}
            </div>
            <Toaster position="bottom-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
