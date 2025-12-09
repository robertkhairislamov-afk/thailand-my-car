import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

// Reown Project ID
const projectId = 'af4323dd20b8828548cb0243ab222847';

// BSC Mainnet
const bscMainnet = {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed.binance.org'] }
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' }
  }
} as const;

// BSC Testnet
const bscTestnet = {
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://data-seed-prebsc-1-s1.binance.org:8545'] }
  },
  blockExplorers: {
    default: { name: 'BscScan Testnet', url: 'https://testnet.bscscan.com' }
  },
  testnet: true
} as const;

// Determine which chain to use based on environment
const IS_TESTNET = import.meta.env.VITE_BSC_TESTNET === 'true' ||
                   window.location.pathname.includes('testnet');

const networks = IS_TESTNET ? [bscTestnet] : [bscMainnet];

// Metadata
const metadata = {
  name: 'Thailand My Car',
  description: 'Инвестиции в рентал-бизнес автомобилей через блокчейн',
  url: 'https://saturway.space/thailand-my-car',
  icons: ['https://saturway.space/thailand-my-car/favicon.svg']
};

// Create Ethers adapter
const ethersAdapter = new EthersAdapter();

// Initialize AppKit - ONLY EVM WALLETS
createAppKit({
  adapters: [ethersAdapter],
  networks,
  projectId,
  metadata,
  // Disable ALL social/email features
  features: {
    email: false,
    socials: false,
    emailShowWallets: false,
    onramp: false,
    analytics: false,
  },
  // Theme
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#009696',
    '--w3m-color-mix': '#143C50',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '12px'
  },
  // Featured wallets
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3
  ],
  allWallets: 'SHOW',
});

export { projectId, bscMainnet, bscTestnet, IS_TESTNET };
