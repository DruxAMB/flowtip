import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Load private key from env, remove "0x" prefix if present
const PRIVATE_KEY = process.env.TESTNET_PRIVATE_KEY?.replace('0x', '') || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84531
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 84532
    },
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      accounts: [PRIVATE_KEY],
      chainId: 4202
    }
  },
  etherscan: {
    apiKey: {
      baseGoerli: process.env.BASESCAN_API_KEY as string,
      baseSepolia: process.env.BASESCAN_API_KEY as string
    },
    customChains: [
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      }
    ]
  },
  sourcify: {
    enabled: true
  }
};

export default config;
