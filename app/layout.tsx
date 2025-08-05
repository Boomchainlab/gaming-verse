"use client";

import "@/lib/reown-appkit";
import ConnectButton from "@/components/ConnectButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <h1 className="text-xl font-bold">SLERFEARN</h1>
          <ConnectButton />
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
