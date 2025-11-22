import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GhostCursor } from "@/components/ui/ghost-cursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tetris Pro - Futuristic Puzzle Game",
  description: "A modern, futuristic Tetris game built with Next.js and React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GhostCursor />
        {children}
      </body>
    </html>
  );
}

