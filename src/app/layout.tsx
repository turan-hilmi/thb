import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kat İrtifakı Yönetim Sistemi",
  description: "Kat irtifakı ve arsa payı yönetim sistemi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
