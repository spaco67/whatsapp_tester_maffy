import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Define metadata
export const metadata: Metadata = {
  title: "WhatsApp Dashboard",
  description: "WhatsApp Dashboard powered by Whapi Cloud",
};

// This is the main layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
