import { cookieStorage, createStorage, type Config, webSocket } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseGoerli } from "wagmi/chains";
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

export const projectId = process.env.PROJECT_ID as string;

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
    [baseGoerli.id]: webSocket("wss://goerli.base.org/ws"),
    [liskSepolia.id]: webSocket("wss://rpc.sepolia-api.lisk.com/ws"),
  },
});

export const config = wagmiAdapter.wagmiConfig;

declare module "wagmi" {
  interface Register {
    config: Config;
  }
}
