import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NKortex AI",
  description: "A futuristic, immersive AI web platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-black text-white selection:bg-neon-purple/50">
        {children}
      </body>
    </html>
  );
}
