import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppConfig, UserSession, showConnect, disconnect } from '@stacks/connect';

// App configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);

// Create user session
export const userSession = new UserSession({ appConfig });

interface WalletContextType {
  isConnected: boolean;
  userAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  userSession: UserSession;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Check if user is already signed in
  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then(() => {
        updateConnectionState();
      });
    } else if (userSession.isUserSignedIn()) {
      updateConnectionState();
    }
  }, []);

  const updateConnectionState = () => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      // Use testnet address for testnet, mainnet for mainnet
      const address = userData.profile.stxAddress.testnet || userData.profile.stxAddress.mainnet;
      setUserAddress(address);
      setIsConnected(true);
    } else {
      setUserAddress(null);
      setIsConnected(false);
    }
  };

  const connectWallet = useCallback(() => {
    showConnect({
      appDetails: {
        name: 'Time Capsule',
        icon: window.location.origin + '/vite.svg',
      },
      onFinish: () => {
        updateConnectionState();
      },
      onCancel: () => {
        console.log('User cancelled connection');
      },
      userSession,
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    userSession.signUserOut();
    setIsConnected(false);
    setUserAddress(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        userAddress,
        connectWallet,
        disconnectWallet,
        userSession,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
