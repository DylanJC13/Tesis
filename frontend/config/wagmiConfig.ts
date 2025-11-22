import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { polygonAmoy } from "./chains";

const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology";

export const config = createConfig({
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(rpcUrl)
  },
  connectors: [
    injected({
      target: "metaMask",
      shimDisconnect: true
    })
  ]
});
