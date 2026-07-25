import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "AIMS | Agent Operations Control Plane", description: "Govern and observe AI agent operations." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
