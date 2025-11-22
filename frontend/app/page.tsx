import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-primary/20 p-10 shadow-xl shadow-black/40">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <p className="badge bg-primary/20 text-sm text-primary">MVP en Polygon Amoy</p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl">
              Diplomas académicos como NFTs verificables
            </h1>
            <p className="max-w-2xl text-base text-slate-200">
              Sube el PDF a IPFS, acuña el NFT con metadatos mínimos y permite que cualquier persona verifique
              la autenticidad del diploma desde la blockchain.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="btn px-5 py-3 text-base" href="/admin">
                Emitir diploma NFT
              </Link>
              <Link
                className="btn bg-white/10 px-5 py-3 text-base text-white hover:bg-white/20"
                href="/verificar"
              >
                Verificar diploma
              </Link>
            </div>
          </div>
          <div className="card max-w-sm space-y-4 bg-white/10">
            <div className="text-sm text-muted">On-chain snapshot</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Red</span>
                <span className="font-semibold text-white">Polygon Amoy</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Almacenamiento</span>
                <span className="font-semibold text-white">IPFS (Pinata)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Contrato</span>
                <span className="font-semibold text-white">DiplomaNFT (ERC-721)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
