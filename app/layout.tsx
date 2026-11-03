import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { SpielstandProvider } from "@/lib/spielstand";
import { Kopfzeile } from "@/components/Kopfzeile";

const schrift = Nunito({ subsets: ["latin"], display: "swap", variable: "--schrift" });

export const metadata: Metadata = {
  title: "SokraKI",
  description: "Im sokratischen Dialog mit KI zum individuellen Förderarbeitsblatt – Prototyp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={schrift.variable}>
      <body>
        <SpielstandProvider>
          <Kopfzeile />
          <main className="inhalt">{children}</main>
        </SpielstandProvider>
      </body>
    </html>
  );
}
