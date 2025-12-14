import { 
  STACKS_MAINNET, 
  STACKS_TESTNET, 
  STACKS_DEVNET,
  type StacksNetwork 
} from '@stacks/network';

// Contract deployment details - update these after deployment
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Update with your deployed contract address
export const CONTRACT_NAME = 'Time_Capsule';

// Network configuration
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export const getNetwork = (networkType: NetworkType = 'testnet'): StacksNetwork => {
  switch (networkType) {
    case 'mainnet':
      return STACKS_MAINNET;
    case 'testnet':
      return STACKS_TESTNET;
    case 'devnet':
      return STACKS_DEVNET;
    default:
      return STACKS_TESTNET;
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
