import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import type { Chain } from 'viem';
import { activeChain } from '../config';

export function createWagmi(chain: Chain) {
  return createConfig({
    chains: [chain],
    connectors: [injected({ shimDisconnect: true }), coinbaseWallet({ appName: 'STABLE Admin', version: '4', preference: { options: 'eoaOnly' } })],
    transports: { [chain.id]: http() },
    multiInjectedProviderDiscovery: true,
  });
}

export let wagmiConfig = createWagmi(activeChain);
export function initWagmi(chain: Chain) {
  wagmiConfig = createWagmi(chain);
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof createWagmi>;
  }
}
