import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import type { ContractCallOptions } from '@stacks/connect';
import {
  uintCV,
  principalCV,
  cvToValue,
  fetchCallReadOnlyFunction,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../config/stacks';
import { useWallet } from '../context/WalletContext';

export interface Capsule {
  owner: string;
  amount: number;
  unlockBlock: number;
  beneficiary: string;
  isClaimed: boolean;
}

export const useTimeCapsule = () => {
  const { isConnected } = useWallet();

  /**
   * Create a new time-locked vault
   * @param amount - Amount of STX in microSTX (1 STX = 1,000,000 microSTX)
   * @param unlockBlock - Block height when the vault can be claimed
   * @param beneficiary - Address that can claim the vault
   */
  const createVault = useCallback(
    async (amount: number, unlockBlock: number, beneficiary: string) => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const options: ContractCallOptions = {
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-vault',
        functionArgs: [
          uintCV(amount),
          uintCV(unlockBlock),
          principalCV(beneficiary),
        ],
        postConditionMode: 0x01, // Allow mode for simplicity - in production use strict post conditions
        onFinish: (data) => {
          console.log('Transaction submitted:', data);
          return data;
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      };

      await openContractCall(options);
    },
    [isConnected]
  );

  /**
   * Claim a vault (only beneficiary can claim after unlock time)
   * @param capsuleId - The ID of the capsule to claim
   */
  const claimVault = useCallback(
    async (capsuleId: number) => {
      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      const options: ContractCallOptions = {
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'claim-vault',
        functionArgs: [uintCV(capsuleId)],
        postConditionMode: 0x01,
        onFinish: (data) => {
          console.log('Claim transaction submitted:', data);
          return data;
        },
        onCancel: () => {
          console.log('Claim cancelled');
        },
      };

      await openContractCall(options);
    },
    [isConnected]
  );

  /**
   * Get capsule details (read-only)
   * @param capsuleId - The ID of the capsule
   */
  const getCapsule = useCallback(async (capsuleId: number): Promise<Capsule | null> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-capsule',
        functionArgs: [uintCV(capsuleId)],
        senderAddress: CONTRACT_ADDRESS,
      });

      const value = cvToValue(result);
      
      if (!value) return null;

      return {
        owner: value.owner,
        amount: Number(value.amount),
        unlockBlock: Number(value['unlock-block']),
        beneficiary: value.beneficiary,
        isClaimed: value['is-claimed'],
      };
    } catch (error) {
      console.error('Error fetching capsule:', error);
      return null;
    }
  }, []);

  /**
   * Get total capsule count (read-only)
   */
  const getCapsuleCount = useCallback(async (): Promise<number> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-capsule-count',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
      });

      return Number(cvToValue(result));
    } catch (error) {
      console.error('Error fetching capsule count:', error);
      return 0;
    }
  }, []);

  /**
   * Check if a capsule is unlockable (read-only)
   * @param capsuleId - The ID of the capsule
   */
  const isUnlockable = useCallback(async (capsuleId: number): Promise<boolean> => {
    try {
      const result = await fetchCallReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'is-unlockable',
        functionArgs: [uintCV(capsuleId)],
        senderAddress: CONTRACT_ADDRESS,
      });

      return Boolean(cvToValue(result));
    } catch (error) {
      console.error('Error checking unlockable status:', error);
      return false;
    }
  }, []);

  return {
    createVault,
    claimVault,
    getCapsule,
    getCapsuleCount,
    isUnlockable,
  };
};
