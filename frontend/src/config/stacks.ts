import { StacksMainnet, StacksTestnet, StacksDevnet } from '@stacks/network';

// Contract deployment details - update these after deployment
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Update with your deployed contract address
export const CONTRACT_NAME = 'Time_Capsule';

// Network configuration
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export const getNetwork = (networkType: NetworkType = 'testnet') => {
  switch (networkType) {
    case 'mainnet':
      return new StacksMainnet();
    case 'testnet':
      return new StacksTestnet();
    case 'devnet':
      return new StacksDevnet();
    default:
      return new StacksTestnet();
  }
};

// Default network for development
export const NETWORK_TYPE: NetworkType = 'testnet';
export const NETWORK = getNetwork(NETWORK_TYPE);

// App configuration for @stacks/connect
export const appDetails = {
  name: 'Time Capsule',
  icon: window.location.origin + '/vite.svg',
};
