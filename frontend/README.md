# Time Capsule Frontend

A React + TypeScript frontend for the Time Capsule smart contract on Stacks blockchain.

## Features

- 🔗 **Wallet Connection** - Connect with Leather or Xverse wallet using `@stacks/connect`
- 🔒 **Create Capsules** - Lock STX tokens until a specific block height
- 📦 **View Capsules** - Browse and search time capsules
- 🎁 **Claim Capsules** - Claim unlocked capsules as beneficiary
- ⏱️ **Live Block Height** - Real-time block height from Stacks API
- 📊 **Time Estimation** - Estimated time until capsule unlocks

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **@stacks/connect** for wallet integration
- **@stacks/transactions** for smart contract interactions
- **@stacks/network** for network configuration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Stacks wallet (Leather or Xverse)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Configuration

Update the contract address in `src/config/stacks.ts`:

```typescript
export const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS';
export const CONTRACT_NAME = 'Time_Capsule';
```

For testnet development, the default network is set to testnet. Change `NETWORK_TYPE` for mainnet:

```typescript
export const NETWORK_TYPE: NetworkType = 'mainnet';
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ConnectWallet   # Wallet connection button
│   ├── CreateCapsule   # Form to create new capsules
│   └── CapsuleList     # Display and claim capsules
├── config/             # Configuration files
│   └── stacks.ts       # Stacks network config
├── context/            # React context providers
│   └── WalletContext   # Wallet state management
├── hooks/              # Custom React hooks
│   └── useTimeCapsule  # Contract interaction hook
└── utils/              # Utility functions
    └── stacks.ts       # Stacks helpers
```

## Contract Interactions

### Create Vault

```typescript
const { createVault } = useTimeCapsule();

// Amount in microSTX, unlock block, beneficiary address
await createVault(1000000, 200000, 'ST1PQHQKV...');
```

### Claim Vault

```typescript
const { claimVault } = useTimeCapsule();

// Capsule ID
await claimVault(1);
```

### Read-Only Functions

```typescript
const { getCapsule, getCapsuleCount, isUnlockable } = useTimeCapsule();

const capsule = await getCapsule(1);
const count = await getCapsuleCount();
const canClaim = await isUnlockable(1);
```

## License

MIT
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
