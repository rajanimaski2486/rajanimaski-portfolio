import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChatRoot } from "@/components/chat/chat-root";

// Clean sans for body + headlines; mono for all metadata.
const sans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
  weight: "100 900",
});
const mono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Rajani Maski · Staff / Principal AI engineer",
  description:
    "15+ years from classical IR to modern AI: model training, relevance ranking, learning-to-rank, retrieval at 2000+ RPS, and agentic + multimodal systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} bg-base text-primary antialiased`}>
        {children}
        <ChatRoot />
      </body>
    </html>
  );
}
