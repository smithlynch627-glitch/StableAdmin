import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { activeChain } from '../config';
import { useToast } from '../components/ui';
import { useWalletUI } from '../components/Wallet';
import { api, ApiError } from './api';
import { ensureSession } from './session';
import { wagmiConfig } from './wagmi';

export function errorMessage(e: unknown): string {
  const err = e as any;
  if (e instanceof ApiError) return e.message;
  const reverted = typeof err?.walk === 'function' ? err.walk((x: any) => x?.name === 'ContractFunctionRevertedError') : null;
  if (reverted?.data?.errorName) return `Reverted: ${reverted.data.errorName}`;
  const text = `${err?.shortMessage || ''} ${err?.message || ''}`;
  if (err?.code === 4001 || /user rejected|user denied|rejected the request/i.test(text)) return 'You declined the request in your wallet.';
  return (err?.shortMessage || err?.message || 'Something went wrong').split('\n')[0].slice(0, 200);
}

/** Admin API calls with a wallet-signed session (the API re-checks the role on every call). */
export function useAuthedApi() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const token = useCallback(async () => {
    if (!address) throw new Error('Connect your wallet first');
    return ensureSession(address, (message) => signMessageAsync({ message }));
  }, [address, signMessageAsync]);
  return {
    get: async <T,>(path: string, params?: Record<string, any>) => api.get<T>(path, params, await token()),
    post: async <T,>(path: string, body?: unknown) => api.post<T>(path, body, await token()),
    put: async <T,>(path: string, body: unknown) => api.put<T>(path, body, await token()),
    patch: async <T,>(path: string, body: unknown) => api.patch<T>(path, body, await token()),
    del: async <T,>(path: string) => api.del<T>(path, await token()),
    request: async <T,>(method: string, path: string, body: unknown) => api.request<T>(method, path, body, await token()),
  };
}

/** Simulate → send → wait → sync, with toasts. */
export function useTx() {
  const toast = useToast();
  const qc = useQueryClient();
  const { address } = useAccount();
  const { ensureReady } = useWalletUI();
  const [busy, setBusy] = useState<string | null>(null);
  const run = useCallback(async (label: string, params: any) => {
    if (!(await ensureReady()) || !address) return null;
    setBusy(label);
    try {
      const { request } = await simulateContract(wagmiConfig, { ...params, account: address, chainId: activeChain.id });
      const hash = await writeContract(wagmiConfig, request as any);
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: activeChain.id });
      if (receipt.status !== 'success') throw new Error('The transaction failed on-chain.');
      await api.post('/orders/sync', { txHash: hash }).catch(() => undefined);
      toast('Transaction confirmed');
      qc.invalidateQueries();
      return receipt;
    } catch (e) {
      toast(errorMessage(e), 'error');
      return null;
    } finally {
      setBusy(null);
    }
  }, [address, ensureReady, qc, toast]);
  return { busy, run };
}
