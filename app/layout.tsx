import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finding Apne Log | Find your people",
  description: "Meet people through shared interests and community."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
