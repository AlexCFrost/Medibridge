import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerModal from "./components/DisclaimerModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medibridge",
  description: "GAI-assisted medical report simplification for patients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DisclaimerModal />
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold">MediBridge</h1>
              <p className="text-sm text-blue-100">AI-Assisted Medical Report Simplification</p>
            </div>
          </header>

          <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
