# DiplomasNFT (Polygon Amoy)

MVP para emitir diplomas académicos como NFTs en Polygon Amoy. El PDF se sube a IPFS (Pinata) y el hash SHA-256 queda on-chain. Incluye portal público de verificación.

## Estructura
- `contracts/`: Hardhat 3 (ESM) + Solidity 0.8.23 + ethers v6. Contrato `DiplomaNFT`.
- `backend/`: Express + TypeScript. Endpoint `/api/upload-diploma` que calcula SHA-256 y sube el PDF a IPFS (Pinata).
- `frontend/`: Next.js 14 (App Router) + React 18 + wagmi v2 + viem + Tailwind.

## Requisitos
- Node.js >= 20
- npm >= 10

## Instalación (monorepo)
```bash
npm install
```

## Variables de entorno
- `contracts/.env.example`: `POLYGON_AMOY_RPC_URL`, `PRIVATE_KEY` (con prefijo 0x), `POLYGONSCAN_API_KEY` (opcional), `INSTITUTION_ADMIN_ADDRESS` (opcional).
- `backend/.env.example`: `PINATA_JWT`, `PORT`.
- `frontend/.env.example`: `NEXT_PUBLIC_POLYGON_AMOY_RPC_URL`, `NEXT_PUBLIC_DIPLOMA_NFT_ADDRESS`, `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_DEPLOY_BLOCK` (bloque desde el que leer eventos).

## Contratos (Hardhat 3)
```bash
cd contracts
npm run compile
npm run test
npm run deploy -- --network polygonAmoy   # requiere vars en .env
```
- Redes: por defecto `hardhatMainnet` (edr-simulated). Se crea `polygonAmoy` si `POLYGON_AMOY_RPC_URL` está definido.
- Verificación en Polygonscan: define `POLYGONSCAN_API_KEY` y usa `npx hardhat verify --network polygonAmoy <address> "<adminAddress>"`.

## Backend
```bash
cd backend
npm run dev    # watch mode
npm run start  # usa dist (npm run build primero)
```
- Endpoint `POST /api/upload-diploma` (form-data):
  - Campos: `file` (PDF), `diplomaId`, `nombreEstudiante`, `programa`.
  - Respuesta: `{ cid, hashHex, size, mimeType }`.

## Frontend (Next.js)
```bash
cd frontend
npm run dev
# o
npm run build && npm run start
```
- `/admin`: conecta wallet (wagmi), sube PDF al backend, recibe `{cid, hashHex}` y firma `mintDiploma`. Muestra link a Polygonscan + IPFS y tabla de eventos `DiplomaMinted`.
- `/verificar`: busca por `diplomaId` vía `getDiplomaById`, muestra metadatos y link IPFS. Permite cargar un PDF local para comparar el hash con `fileHash` on-chain.

## Notas
- El contrato solo permite mintear a `institutionAdmin` (seteado al desplegar, actualizable por `owner`).
- El `tokenURI` apunta a `ipfs://<cid>` (PDF).
- Pinata SDK usado para el MVP; para producción considerar actualizar al SDK moderno o Web3.Storage según políticas de la institución.
