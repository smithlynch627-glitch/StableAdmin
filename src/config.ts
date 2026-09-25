import { defineChain, type Chain } from 'viem';
import { chainConfig } from 'viem/op-stack';

const env = import.meta.env;

export const API_URL = (env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
/** Public marketplace URL, used for "view on site" links. */
export const SITE_URL = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

export interface ChainInfo { chainId: number; name: string; rpcUrl: string; explorerUrl: string; isTestnet: boolean }

export function makeChain(n: ChainInfo): Chain {
  return defineChain({
    ...chainConfig,
    id: n.chainId,
    name: n.name,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [env.VITE_RPC_URL || n.rpcUrl] } },
    blockExplorers: { default: { name: `${n.name} Explorer`, url: n.explorerUrl } },
    testnet: n.isTestnet,
  });
}

/** Set in main.tsx from the backend's active network before rendering. */
export let activeChain: Chain = makeChain({
  chainId: 91342, name: 'GIWA Sepolia', rpcUrl: 'https://sepolia-rpc.giwa.io', explorerUrl: 'https://sepolia-explorer.giwa.io', isTestnet: true,
});
export function setActiveChain(c: Chain) {
  activeChain = c;
}
