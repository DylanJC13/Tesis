"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { parseAbiItem } from "viem";
import { diplomaContractAddress, diplomaNftAbi, deployFromBlock, ipfsGatewayUrl, explorerTxUrl } from "@/lib/contract";

type MintForm = {
  nombreEstudiante: string;
  programa: string;
  fechaGrado: string;
  nombreInstitucion: string;
  diplomaId: string;
};

type MintedDiploma = {
  diplomaId: string;
  to: string;
  ipfsCid: string;
  fileHash: string;
  blockNumber: bigint;
};

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { data: txHash, isPending: isWriting, writeContractAsync, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash
  });

  const [form, setForm] = useState<MintForm>({
    nombreEstudiante: "",
    programa: "",
    fechaGrado: "",
    nombreInstitucion: "",
    diplomaId: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [minted, setMinted] = useState<MintedDiploma[]>([]);
  const [uploading, setUploading] = useState(false);

  const connector = useMemo(() => connectors[0], [connectors]);

  const fetchEvents = useCallback(async () => {
    if (!publicClient || !diplomaContractAddress) return;
    try {
      const logs = await publicClient.getLogs({
        address: diplomaContractAddress,
        event: parseAbiItem(
          "event DiplomaMinted(string diplomaId, address indexed to, string ipfsCid, bytes32 fileHash)"
        ),
        fromBlock: deployFromBlock
      });

      setMinted(
        logs
          .map((log) => ({
            diplomaId: log.args.diplomaId as string,
            to: log.args.to as string,
            ipfsCid: log.args.ipfsCid as string,
            fileHash: log.args.fileHash as string,
            blockNumber: log.blockNumber
          }))
          .reverse()
      );
    } catch (err) {
      console.warn("No se pudieron leer los eventos", err);
    }
  }, [publicClient]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (isConfirmed) {
      setStatus("Diploma acuñado en blockchain 🎉");
      void fetchEvents();
    }
  }, [isConfirmed, fetchEvents]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConnected || !address) {
      setStatus("Conecta la wallet institucional para acuñar.");
      return;
    }
    if (!diplomaContractAddress) {
      setStatus("Configura NEXT_PUBLIC_DIPLOMA_NFT_ADDRESS en el frontend.");
      return;
    }
    if (!file) {
      setStatus("Adjunta el PDF del diploma.");
      return;
    }

    setStatus(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("diplomaId", form.diplomaId);
      formData.append("nombreEstudiante", form.nombreEstudiante);
      formData.append("programa", form.programa);

      const uploadRes = await fetch(`${backendBase}/api/upload-diploma`, {
        method: "POST",
        body: formData
      });

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || "Error al subir PDF");
      }

      const { cid, hashHex: rawHash } = uploadJson as { cid: string; hashHex: string };
      const hashHex = (rawHash?.startsWith("0x") ? rawHash : `0x${rawHash}`) as `0x${string}`;

      await writeContractAsync({
        address: diplomaContractAddress,
        abi: diplomaNftAbi,
        functionName: "mintDiploma",
        args: [
          address,
          form.diplomaId,
          cid,
          hashHex,
          form.nombreEstudiante,
          form.programa,
          form.fechaGrado,
          form.nombreInstitucion
        ]
      });

      setStatus("Transacción enviada, esperando confirmación...");
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Error al acuñar diploma");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="badge bg-white/10">Panel institución</p>
          <h1 className="font-display text-3xl font-semibold text-white">Emitir Diploma NFT</h1>
          <p className="text-sm text-muted">Sube el PDF, obtén su hash y acuña en Polygon Amoy.</p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                <div>Wallet</div>
                <div className="font-mono">{address}</div>
              </div>
              <button className="btn bg-white/10 text-white" onClick={() => disconnect()}>
                Desconectar
              </button>
            </>
          ) : (
            <button
              className="btn"
              onClick={() => connector && connect({ connector })}
              disabled={isConnecting || !connector}
            >
              {isConnecting ? "Conectando..." : "Conectar wallet"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="card md:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Datos del diploma</h2>
            <p className="text-sm text-muted">Los campos irán on-chain junto con el hash del PDF.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-slate-200">Nombre del estudiante</span>
                <input
                  className="input"
                  required
                  value={form.nombreEstudiante}
                  onChange={(e) => setForm({ ...form, nombreEstudiante: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-200">Programa</span>
                <input
                  className="input"
                  required
                  value={form.programa}
                  onChange={(e) => setForm({ ...form, programa: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-200">Fecha de grado</span>
                <input
                  className="input"
                  type="date"
                  required
                  value={form.fechaGrado}
                  onChange={(e) => setForm({ ...form, fechaGrado: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-200">Institución</span>
                <input
                  className="input"
                  required
                  value={form.nombreInstitucion}
                  onChange={(e) => setForm({ ...form, nombreInstitucion: e.target.value })}
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-slate-200">Diploma ID (clave única)</span>
                <input
                  className="input"
                  required
                  value={form.diplomaId}
                  onChange={(e) => setForm({ ...form, diplomaId: e.target.value })}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-slate-200">Archivo PDF</span>
                <input
                  className="input"
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {status && <div className="text-sm text-amber-300">{status}</div>}
            {connectError && <div className="text-sm text-rose-400">{connectError.message}</div>}
            {writeError && <div className="text-sm text-rose-400">{writeError.message}</div>}
            <div className="flex gap-3">
              <button
                className="btn px-5 py-3"
                type="submit"
                disabled={uploading || isWriting || isConfirming}
              >
                {uploading
                  ? "Subiendo a IPFS..."
                  : isWriting
                  ? "Firmando..."
                  : isConfirming
                  ? "Confirmando..."
                  : "Acuñar diploma"}
              </button>
              {txHash && (
                <a className="btn bg-white/10 text-white" href={explorerTxUrl(txHash)} target="_blank" rel="noreferrer">
                  Ver en Polygonscan
                </a>
              )}
            </div>
          </form>
        </section>

        <section className="card space-y-3">
          <h3 className="text-lg font-semibold text-white">Ayuda rápida</h3>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>1. Sube el PDF para obtener su hash SHA-256.</li>
            <li>2. Firma la transacción con la wallet institucional.</li>
            <li>3. Comparte el CID de IPFS con el graduado.</li>
          </ul>
          <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-muted">
            Backend: <span className="font-mono">{backendBase}</span>
          </div>
          {diplomaContractAddress && (
            <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs text-muted">
              Contrato: <span className="font-mono">{diplomaContractAddress}</span>
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Diplomas emitidos (eventos)</h2>
          <button className="text-xs text-primary hover:underline" onClick={() => fetchEvents()}>
            Refrescar
          </button>
        </div>
        {minted.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay diplomas en este despliegue.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="px-2 py-2">Diploma ID</th>
                  <th className="px-2 py-2">Graduado</th>
                  <th className="px-2 py-2">CID</th>
                  <th className="px-2 py-2">Hash</th>
                  <th className="px-2 py-2">Bloque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {minted.map((item) => (
                  <tr key={`${item.diplomaId}-${item.blockNumber}`} className="text-slate-100">
                    <td className="px-2 py-2 font-semibold">{item.diplomaId}</td>
                    <td className="px-2 py-2 font-mono text-xs">{item.to}</td>
                    <td className="px-2 py-2">
                      <a className="text-primary hover:underline" href={ipfsGatewayUrl(item.ipfsCid)} target="_blank">
                        {item.ipfsCid.slice(0, 10)}...
                      </a>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{item.fileHash}</td>
                    <td className="px-2 py-2">{item.blockNumber.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
