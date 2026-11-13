import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

import AuthProvider from "@/context/authprovider";
import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: "Mystery Messages",
  description: "Anonymous Messaging App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable, playfair.variable)}>
      <AuthProvider>
        <body>
          {children}
          <Toaster />
        </body>
      </AuthProvider>
    </html>
  );
}
