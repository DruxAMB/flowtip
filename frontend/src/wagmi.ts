import { cookieStorage, createStorage, type Config, http, fallback } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { Chain } from "wagmi/chains";

// Define Lisk Sepolia testnet
export const liskSepolia = {
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'LSK',
    symbol: 'LSK',
  },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia-api.lisk.com'] },
    public: { http: ['https://rpc.sepolia-api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'LiskScan', url: 'https://sepolia.lisk.com' },
  },
  testnet: true,
} as const satisfies Chain;

export const projectId = "da22a5c09951d7fad4ca93f403ef2298";

export const baseGoerli = {
  id: 84_532,
  name: "Base Sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Sepolia Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { 
      http: [
        "https://sepolia.base.org",
        "https://base-sepolia.g.alchemy.com/v2/demo"
      ]
    },
    default: { 
      http: [
        "https://sepolia.base.org",
        "https://base-sepolia.g.alchemy.com/v2/demo"
      ]
    },
  },
  blockExplorers: {
    etherscan: { name: "BaseScan", url: "https://sepolia.basescan.org" },
    default: { name: "BaseScan", url: "https://sepolia.basescan.org" },
  },
  testnet: true,
} as const satisfies Chain;

export const networks = [baseGoerli, liskSepolia];

export const metadata = {
  name: "tipflow",
  description: "Send and receive tips across chains",
  url: "https://tipflow.app", 
  icons: ["https://tipflow.app/icon.png"],
};

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [baseGoerli.id]: fallback([
      http(baseGoerli.rpcUrls.public.http[0]),
      http(baseGoerli.rpcUrls.public.http[1])
    ]),
    [liskSepolia.id]: http(),
  },
});

export const config = wagmiAdapter.wagmiConfig;

declare module "wagmi" {
  interface Register {
    config: Config;
  }
}
