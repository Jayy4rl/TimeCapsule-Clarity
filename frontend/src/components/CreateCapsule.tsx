import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTimeCapsule } from '../hooks/useTimeCapsule';
import { useWallet } from '../context/WalletContext';
import './CreateCapsule.css';

export const CreateCapsule = () => {
  const { isConnected, userAddress } = useWallet();
  const { createVault } = useTimeCapsule();

  const [amount, setAmount] = useState('');
  const [unlockBlocks, setUnlockBlocks] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);

      // Convert STX to microSTX (1 STX = 1,000,000 microSTX)
      const microStx = Math.floor(parseFloat(amount) * 1_000_000);
      
      // Calculate unlock block (current + blocks to wait)
      // For testnet, we estimate current block and add user input
      const blocksToWait = parseInt(unlockBlocks);
      
      // Use a reasonable estimate for current block height
      // In production, fetch this from the API
      const estimatedCurrentBlock = 180000; // Update based on network
      const unlockBlock = estimatedCurrentBlock + blocksToWait;

      const beneficiaryAddress = beneficiary || userAddress!;

      await createVault(microStx, unlockBlock, beneficiaryAddress);
      
      // Reset form
      setAmount('');
      setUnlockBlocks('');
      setBeneficiary('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create capsule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-capsule">
      <h2>🔒 Create Time Capsule</h2>
      <p className="description">
        Lock your STX tokens until a specific block height. Only the beneficiary can claim after unlock.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount (STX)</label>
          <input
            id="amount"
            type="number"
            step="0.000001"
            min="0.000001"
            placeholder="1.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={!isConnected || isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="unlockBlocks">Lock Duration (blocks)</label>
          <input
            id="unlockBlocks"
            type="number"
            min="1"
            placeholder="100"
            value={unlockBlocks}
            onChange={(e) => setUnlockBlocks(e.target.value)}
            required
            disabled={!isConnected || isLoading}
          />
          <span className="hint">
            ~{unlockBlocks ? Math.round(parseInt(unlockBlocks) * 10 / 60) : 0} hours (avg 10 min/block)
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="beneficiary">Beneficiary Address (optional)</label>
          <input
            id="beneficiary"
            type="text"
            placeholder={userAddress || 'Connect wallet first'}
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            disabled={!isConnected || isLoading}
          />
          <span className="hint">
            Leave empty to set yourself as beneficiary
          </span>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={!isConnected || isLoading} className="submit-btn">
          {isLoading ? 'Creating...' : '🚀 Create Capsule'}
        </button>

        {!isConnected && (
          <p className="connect-prompt">Connect your wallet to create a capsule</p>
        )}
      </form>
    </div>
  );
};
