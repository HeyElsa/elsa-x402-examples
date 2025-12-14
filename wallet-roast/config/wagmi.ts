import { createConfig, http } from 'wagmi';
import { base, polygon } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base, polygon],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'Wallet Roast',
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}
