import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KrewOS - Construction Management",
  description: "Enterprise project management for construction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
           <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Toaster richColors position="top-right" />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
