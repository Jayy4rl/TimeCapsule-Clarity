import { NETWORK } from '../config/stacks';

const API_BASE_URL = NETWORK.client.baseUrl;

export interface BlockInfo {
  burn_block_height: number;
  stacks_tip_height: number;
  burn_block_time: number;
}

/**
 * Fetch the current block information from the Stacks API
 */
export const fetchBlockInfo = async (): Promise<BlockInfo | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v2/info`);
    if (!response.ok) {
      throw new Error('Failed to fetch block info');
    }
    const data = await response.json();
    return {
      burn_block_height: data.burn_block_height,
      stacks_tip_height: data.stacks_tip_height,
      burn_block_time: data.burn_block_time,
    };
  } catch (error) {
    console.error('Error fetching block info:', error);
    return null;
  }
};

/**
 * Calculate estimated unlock time based on block difference
 * @param currentBlock Current block height
 * @param unlockBlock Unlock block height
 * @returns Estimated time string
 */
export const calculateEstimatedTime = (currentBlock: number, unlockBlock: number): string => {
  const blocksRemaining = unlockBlock - currentBlock;
  
  if (blocksRemaining <= 0) {
    return 'Ready to claim';
  }
  
  // Average block time is ~10 minutes on Stacks
  const minutesRemaining = blocksRemaining * 10;
  
  if (minutesRemaining < 60) {
    return `~${minutesRemaining} minutes`;
  }
  
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  if (hoursRemaining < 24) {
    return `~${hoursRemaining} hours`;
  }
  
  const daysRemaining = Math.floor(hoursRemaining / 24);
  return `~${daysRemaining} days`;
};

/**
 * Format microSTX to STX with proper decimals
 */
export const microStxToStx = (microStx: number): string => {
  return (microStx / 1_000_000).toFixed(6);
};

/**
 * Format STX to microSTX
 */
export const stxToMicroStx = (stx: number): number => {
  return Math.floor(stx * 1_000_000);
};

/**
 * Truncate Stacks address for display
 */
export const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Validate Stacks address format
 */
export const isValidStacksAddress = (address: string): boolean => {
  // Basic validation: Stacks addresses start with SP (mainnet) or ST (testnet)
  // and are typically 41-42 characters
  const stacksAddressRegex = /^(SP|ST)[0-9A-Z]{38,39}$/;
  return stacksAddressRegex.test(address);
};
