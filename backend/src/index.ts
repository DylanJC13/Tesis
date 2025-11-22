import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import pinataSDK from "@pinata/sdk";
import type PinataClient from "@pinata/sdk";
import { createHash } from "crypto";
import { Readable } from "stream";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Solo se permiten archivos PDF"));
    }
    cb(null, true);
  }
});

app.use(cors());
app.use(express.json());

const pinata: PinataClient | null = process.env.PINATA_JWT
  ? new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT })
  : null;

if (!pinata) {
  console.warn("PINATA_JWT no configurado. El endpoint /api/upload-diploma fallará hasta que se configure.");
} else {
  pinata
    .testAuthentication()
    .then(() => console.log("Pinata autenticado correctamente"))
    .catch((err) => console.warn("Fallo autenticación con Pinata", err?.message));
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/upload-diploma", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!pinata) {
      return res.status(500).json({ error: "Pinata no configurado (PINATA_JWT faltante)" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Archivo PDF requerido en el campo 'file'" });
    }

    const hashHex = `0x${createHash("sha256").update(file.buffer).digest("hex")}`;

    const result = await pinata.pinFileToIPFS(
      Readable.from(file.buffer),
      {
        pinataMetadata: {
          name: `${req.body.diplomaId || "diploma"}.pdf`,
          keyvalues: {
            diplomaId: String(req.body.diplomaId ?? ""),
            nombreEstudiante: String(req.body.nombreEstudiante ?? ""),
            programa: String(req.body.programa ?? "")
          }
        }
      } as any
    );

    return res.json({
      cid: result.IpfsHash,
      hashHex,
      size: file.size,
      mimeType: file.mimetype
    });
  } catch (error: any) {
    console.error("upload error", error);
    return res.status(500).json({
      error: "No se pudo subir el diploma a IPFS",
      details: error?.message
    });
  }
});

// Multer/body parser error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: "Error inesperado" });
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});
