// Network configuration for X402 payments
export const NETWORK_CONFIG = {
  base: {
    chainId: 8453,
    chainIdHex: '0x2105',
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  polygon: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    usdc: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  },
} as const;

export type NetworkName = keyof typeof NETWORK_CONFIG;

// Famous wallet addresses for presets (ENS names and one address)
export const WHALE_WALLETS = {
  vitalik: {
    address: 'vitalik.eth',
    name: 'vitalik.eth',
  },
  jesse: {
    address: 'jesse.base.eth',
    name: 'jesse.base.eth',
  },
  paradigm: {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    name: '0xd8dA...6045',
  },
} as const;

// Meme coins to detect in portfolio
export const MEME_COINS = [
  'PEPE', 'DOGE', 'SHIB', 'FLOKI', 'BONK',
  'WIF', 'BRETT', 'TOSHI', 'DEGEN'
];

// Stablecoins
export const STABLECOINS = ['USDC', 'USDT', 'DAI'];

// X402 API configuration
export const X402_API_URL = process.env.NEXT_PUBLIC_X402_API_URL || 'http://localhost:3002';
