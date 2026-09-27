import { defineChain, type Chain } from 'viem';
import { chainConfig } from 'viem/op-stack';
import type { AppConfig } from './lib/types';

const env = import.meta.env;

export const API_URL = (env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
/** Public marketplace URL, used for "view on site" links. */
export const SITE_URL = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

/**
 * Contracts and chain pinned at build time (Netlify env). Admin transactions are only ever sent to these
 * contracts, even if the API were tampered with. Leave empty to trust the API (not recommended).
 */
const addrList = (v?: string) => (v || '').split(',').map((a) => a.trim().toLowerCase()).filter((a) => /^0x[0-9a-f]{40}$/.test(a));
const first = (v?: string) => addrList(v)[0] || '';
export const PINNED = {
  market: first(env.VITE_MARKET_ADDRESS),
  factories: addrList(env.VITE_FACTORY_ADDRESSES),
  vault: first(env.VITE_FEE_VAULT_ADDRESS),
  /** Optional: the Safe that must own the marketplace. The panel refuses to sign for any other Safe. */
  safe: first(env.VITE_SAFE_ADDRESS),
  contracts: [...addrList(env.VITE_MARKET_ADDRESS), ...addrList(env.VITE_FACTORY_ADDRESSES), ...addrList(env.VITE_FEE_VAULT_ADDRESS)],
  chainId: Number(env.VITE_CHAIN_ID || 0) || null,
  /** The browser RPC. When set, chain reads never go through a URL the API supplies. */
  rpc: (env.VITE_RPC_URL || '').trim(),
};
/** WETH on GIWA (OP Stack predeploy, same address on every OP chain). */
export const WETH = (first(env.VITE_WETH_ADDRESS) || '0x4200000000000000000000000000000000000006') as `0x${string}`;

/** Set in main.tsx from the API (/api/config). Pinned values above always win over it. */
export let appConfig: AppConfig | null = null;
export function setAppConfig(c: AppConfig | null) {
  appConfig = c;
}

/** STABLE contract addresses by role: the build-time pins, or the API's values when the site was built without pins. */
export function stableContracts() {
  const lc = (a?: string | null) => (a || '').toLowerCase();
  return {
    market: (PINNED.market || lc(appConfig?.market)) as `0x${string}`,
    vault: (PINNED.vault || lc(appConfig?.feeVault)) as `0x${string}`,
    factories: (PINNED.factories.length ? PINNED.factories : [lc(appConfig?.factory)].filter(Boolean)) as `0x${string}`[],
    weth: WETH,
    pinned: !!PINNED.market,
  };
}

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
