import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { base, polygon } from 'wagmi/chains';

const config = getDefaultConfig({
  chains: [base, polygon],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  appName: 'Wallet Roast',
  appDescription: 'Get savagely roasted based on your on-chain data',
  appUrl: 'https://walletroast.com',
  appIcon: 'https://walletroast.com/logo.png',
});

export const wagmiConfig = createConfig(config);

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
