import { createConfig, http } from 'wagmi';
import { base, polygon } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [base, polygon],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'Wallet Roast',
    }),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            metadata: {
              name: 'Wallet Roast',
              description: 'Get savagely roasted based on your on-chain data',
              url: 'https://walletroast.com',
              icons: ['https://walletroast.com/logo.png'],
            },
            showQrModal: false, // ConnectKit handles the QR modal
          }),
        ]
      : []),
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
