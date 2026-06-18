import { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Keepr — Where teams and agents build together",
  description: "Keepr is the all-in-one AI-powered workspace where notes, docs, tasks, projects, and intelligent agents work together. Plan, build, and ship — supercharged with automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
