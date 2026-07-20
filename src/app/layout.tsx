import "./globals.css";

import AuthProvider from "@/context/authprovider";
import type { Metadata } from "next";

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
    <html lang="en">
      <AuthProvider>
      <body>
        {children}
      </body>
      </AuthProvider>

    </html>
  );
}