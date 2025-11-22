"use client";

import { useState } from "react";
import { useReadContract } from "wagmi";
import { DiplomaStruct, diplomaContractAddress, diplomaNftAbi, ipfsGatewayUrl } from "@/lib/contract";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export default function VerifyPage() {
  const [diplomaId, setDiplomaId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashResult, setHashResult] = useState<string | null>(null);

  const { data, isFetching, refetch, error } = useReadContract({
    address: diplomaContractAddress,
    abi: diplomaNftAbi,
    functionName: "getDiplomaById",
    args: [diplomaId],
    query: {
      enabled: false
    }
  });

  const diploma = data as DiplomaStruct | undefined;
  const exists = diploma && diploma.graduateWallet !== zeroAddress && diploma.diplomaId.length > 0;

  const handleLookup = async () => {
    setHashResult(null);
    await refetch();
  };

  const compareHash = async () => {
    if (!selectedFile || !diploma) return;
    const buffer = await selectedFile.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashHex =
      "0x" +
      Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    setHashResult(hashHex.toLowerCase() === diploma.fileHash.toLowerCase() ? "ok" : "fail");
  };

  return (
    <main className="space-y-6">
      <div>
        <p className="badge bg-white/10">Portal público</p>
        <h1 className="font-display text-3xl font-semibold text-white">Verificar Diploma</h1>
        <p className="text-sm text-muted">
          Consulta el diploma por ID y valida que el PDF corresponda con el hash on-chain.
        </p>
      </div>

      {!diplomaContractAddress && (
        <div className="card text-sm text-amber-300">
          Configura NEXT_PUBLIC_DIPLOMA_NFT_ADDRESS para habilitar la verificación.
        </div>
      )}

      <section className="card space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="md:col-span-2 text-sm">
            <span className="text-slate-200">Diploma ID</span>
            <input
              className="input mt-1"
              value={diplomaId}
              onChange={(e) => setDiplomaId(e.target.value)}
              placeholder="Ej. DIP-001-2024"
            />
          </label>
          <div className="flex items-end">
            <button className="btn w-full" onClick={handleLookup} disabled={!diplomaId || isFetching}>
              {isFetching ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </div>
        {error && <div className="text-sm text-rose-400">{error.message}</div>}
      </section>

      {exists ? (
        <section className="card space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="badge bg-primary/20 text-primary">Diploma encontrado</div>
              <h2 className="font-display text-2xl text-white">{diploma?.nombreEstudiante}</h2>
              <p className="text-sm text-muted">{diploma?.programa}</p>
            </div>
            <div className="text-xs text-muted">
              Graduado: <span className="font-mono text-slate-100">{diploma?.graduateWallet}</span>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="text-muted">Fecha de grado</div>
              <div className="font-semibold text-white">{diploma?.fechaGrado}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="text-muted">Institución</div>
              <div className="font-semibold text-white">{diploma?.nombreInstitucion}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="text-muted">Hash SHA-256 (PDF)</div>
              <div className="font-mono text-xs text-slate-100">{diploma?.fileHash}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <div className="text-muted">Archivo en IPFS</div>
              <a className="text-primary hover:underline" href={ipfsGatewayUrl(diploma?.ipfsCid || "")} target="_blank">
                {diploma?.ipfsCid}
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white">Verificar PDF</h3>
            <p className="text-xs text-muted">
              Opcional: sube un PDF para comparar su hash con el registrado on-chain.
            </p>
            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                className="input md:w-2/3"
                type="file"
                accept="application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <button
                className="btn md:w-1/3"
                onClick={compareHash}
                disabled={!selectedFile}
                type="button"
              >
                Comparar hash
              </button>
            </div>
            {hashResult === "ok" && (
              <div className="mt-2 text-sm text-emerald-300">Diploma auténtico: el hash coincide.</div>
            )}
            {hashResult === "fail" && (
              <div className="mt-2 text-sm text-rose-300">Documento alterado: el hash no coincide.</div>
            )}
          </div>
        </section>
      ) : (
        data && (
          <div className="card text-sm text-amber-300">Diploma no encontrado para ese ID.</div>
        )
      )}
    </main>
  );
}
