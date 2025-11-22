import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DiplomasNFT | Polygon Amoy",
  description: "Emite y verifica diplomas académicos como NFTs en Polygon Amoy."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="mx-auto max-w-6xl px-6 py-6">
            <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-glow">
                  DN
                </div>
                <div>
                  <div className="font-display text-lg font-semibold text-white">DiplomasNFT</div>
                  <div className="text-xs text-muted">Polygon Amoy</div>
                </div>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-200">
                <Link className="hover:text-white" href="/verificar">
                  Verificar
                </Link>
                <Link className="hover:text-white" href="/admin">
                  Admin
                </Link>
              </nav>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
