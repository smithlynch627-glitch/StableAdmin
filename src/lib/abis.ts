// Platform-owner functions used by the admin panel (see /contracts).
const fn = (name: string, inputs: readonly any[] = [], outputs: readonly any[] = [], stateMutability = 'nonpayable') =>
  ({ type: 'function', name, inputs, outputs, stateMutability }) as const;
const errors = ['FeeTooHigh', 'ZeroAddress', 'EnforcedPause', 'ExpectedPause', 'OwnableUnauthorizedAccount'].map(
  (name) => ({ type: 'error', name, inputs: name === 'OwnableUnauthorizedAccount' ? [{ name: 'account', type: 'address' }] : [] }) as const,
);

export const marketAdminAbi = [
  ...errors,
  fn('setMarketFeeBps', [{ name: 'bps', type: 'uint16' }]),
  fn('setFeeRecipient', [{ name: 'recipient', type: 'address' }]),
  fn('setCollectionApproval', [{ name: 'collection', type: 'address' }, { name: 'approved', type: 'bool' }]),
  fn('setCollectionBlocked', [{ name: 'collection', type: 'address' }, { name: 'blocked', type: 'bool' }]),
  fn('pause'), fn('unpause'),
] as const;

export const factoryAdminAbi = [...errors, fn('setPlatformFeeBps', [{ name: 'bps', type: 'uint16' }]), fn('pause'), fn('unpause')] as const;

export const vaultAdminAbi = [
  ...errors,
  fn('withdrawAllEth', [{ name: 'to', type: 'address' }]),
  fn('withdrawToken', [{ name: 'token', type: 'address' }, { name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }]),
] as const;
