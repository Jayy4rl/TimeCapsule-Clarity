import { useState, useEffect, useCallback } from 'react';
import { useTimeCapsule, Capsule } from '../hooks/useTimeCapsule';
import { useWallet } from '../context/WalletContext';
import './CapsuleList.css';

interface CapsuleWithId extends Capsule {
  id: number;
  isUnlockable: boolean;
}

export const CapsuleList = () => {
  const { isConnected, userAddress } = useWallet();
  const { getCapsuleCount, getCapsule, isUnlockable, claimVault } = useTimeCapsule();

  const [capsules, setCapsules] = useState<CapsuleWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState('');

  const fetchCapsules = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const count = await getCapsuleCount();
      const capsulePromises: Promise<CapsuleWithId | null>[] = [];

      // Fetch last 10 capsules (or all if less than 10)
      const startId = Math.max(1, count - 9);
      for (let i = count; i >= startId; i--) {
        capsulePromises.push(
          (async () => {
            const capsule = await getCapsule(i);
            if (!capsule) return null;
            const unlockable = await isUnlockable(i);
            return { ...capsule, id: i, isUnlockable: unlockable };
          })()
        );
      }

      const results = await Promise.all(capsulePromises);
      setCapsules(results.filter((c): c is CapsuleWithId => c !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch capsules');
    } finally {
      setIsLoading(false);
    }
  }, [getCapsuleCount, getCapsule, isUnlockable]);

  useEffect(() => {
    fetchCapsules();
  }, [fetchCapsules]);

  const handleSearch = async () => {
    if (!searchId) return;

    setIsLoading(true);
    setError(null);

    try {
      const id = parseInt(searchId);
      const capsule = await getCapsule(id);

      if (!capsule) {
        setError(`Capsule #${id} not found`);
        return;
      }

      const unlockable = await isUnlockable(id);
      setCapsules([{ ...capsule, id, isUnlockable: unlockable }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search capsule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (capsuleId: number) => {
    try {
      await claimVault(capsuleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim capsule');
    }
  };

  const formatStx = (microStx: number) => {
    return (microStx / 1_000_000).toFixed(6);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const canClaim = (capsule: CapsuleWithId) => {
    return (
      isConnected &&
      userAddress &&
      capsule.beneficiary === userAddress &&
      capsule.isUnlockable &&
      !capsule.isClaimed
    );
  };

  return (
    <div className="capsule-list">
      <div className="list-header">
        <h2>📦 Time Capsules</h2>
        <div className="search-box">
          <input
            type="number"
            placeholder="Search by ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={fetchCapsules} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading capsules...</div>
      ) : capsules.length === 0 ? (
        <div className="empty">No capsules found</div>
      ) : (
        <div className="capsules-grid">
          {capsules.map((capsule) => (
            <div
              key={capsule.id}
              className={`capsule-card ${capsule.isClaimed ? 'claimed' : ''} ${
                capsule.isUnlockable ? 'unlockable' : 'locked'
              }`}
            >
              <div className="capsule-header">
                <span className="capsule-id">#{capsule.id}</span>
                <span className={`status ${capsule.isClaimed ? 'claimed' : capsule.isUnlockable ? 'ready' : 'locked'}`}>
                  {capsule.isClaimed ? '✅ Claimed' : capsule.isUnlockable ? '🔓 Ready' : '🔒 Locked'}
                </span>
              </div>

              <div className="capsule-amount">
                <span className="label">Amount</span>
                <span className="value">{formatStx(capsule.amount)} STX</span>
              </div>

              <div className="capsule-details">
                <div className="detail">
                  <span className="label">Unlock Block</span>
                  <span className="value">{capsule.unlockBlock.toLocaleString()}</span>
                </div>
                <div className="detail">
                  <span className="label">Owner</span>
                  <span className="value address">{truncateAddress(capsule.owner)}</span>
                </div>
                <div className="detail">
                  <span className="label">Beneficiary</span>
                  <span className="value address">{truncateAddress(capsule.beneficiary)}</span>
                </div>
              </div>

              {canClaim(capsule) && (
                <button onClick={() => handleClaim(capsule.id)} className="claim-btn">
                  🎁 Claim Capsule
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
