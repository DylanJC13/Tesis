import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";

dotenv.config();

const hasPolygonAmoy = Boolean(process.env.POLYGON_AMOY_RPC_URL);

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  defaultNetwork: "hardhatMainnet",
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1"
    },
    ...(hasPolygonAmoy
      ? {
          polygonAmoy: {
            type: "http",
            chainType: "l1",
            url: configVariable("POLYGON_AMOY_RPC_URL"),
            accounts: process.env.PRIVATE_KEY ? [configVariable("PRIVATE_KEY")] : [],
            chainId: 80002
          }
        }
      : {})
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
      ? {
          polygonAmoy: configVariable("POLYGONSCAN_API_KEY")
        }
      : undefined,
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  }
});
