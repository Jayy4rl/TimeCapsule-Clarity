import { useState } from 'react';
import { WalletProvider } from './context/WalletContext';
import { ConnectWallet, CreateCapsule, CapsuleList } from './components';
import './App.css';

type TabType = 'create' | 'view';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('create');

  return (
    <WalletProvider>
      <div className="app">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">⏰</span>
            <h1>Time Capsule</h1>
          </div>
          <ConnectWallet />
        </header>

        <main className="main">
          <nav className="tabs">
            <button
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              🔒 Create Capsule
            </button>
            <button
              className={`tab ${activeTab === 'view' ? 'active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              📦 View Capsules
            </button>
          </nav>

          <div className="content">
            {activeTab === 'create' && <CreateCapsule />}
            {activeTab === 'view' && <CapsuleList />}
          </div>
        </main>

        <footer className="footer">
          <p>
            Built on <a href="https://www.stacks.co/" target="_blank" rel="noopener noreferrer">Stacks</a> • 
            Powered by Bitcoin
          </p>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;
