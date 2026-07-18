import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mystery Messages",
  description: "Anonymous Messaging App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}