import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

import AuthProvider from "@/context/authprovider";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <AuthProvider>
      <body>
        {children}
         <Toaster />
      </body>
      </AuthProvider>

    </html>
  );
}