import { useWallet } from '../context/WalletContext';
import './ConnectWallet.css';

export const ConnectWallet = () => {
  const { isConnected, userAddress, connectWallet, disconnectWallet } = useWallet();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && userAddress) {
    return (
      <div className="wallet-connected">
        <span className="wallet-address">{truncateAddress(userAddress)}</span>
        <button onClick={disconnectWallet} className="disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="connect-btn">
      Connect Wallet
    </button>
  );
};
