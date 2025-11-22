import { defineChain } from "viem";

const defaultRpc = process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

export const polygonAmoy = defineChain({
  id: 80002,
  name: "Polygon Amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: {
    default: { http: [defaultRpc] },
    public: { http: [defaultRpc] }
  },
  blockExplorers: {
    default: { name: "Polygonscan", url: "https://amoy.polygonscan.com" }
  },
  testnet: true
});
