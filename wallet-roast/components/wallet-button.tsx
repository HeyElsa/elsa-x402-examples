'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, Check } from 'lucide-react';

export function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button disabled className="w-full h-16 text-xl font-bold rounded-xl bg-muted">
        Loading...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <Button
        onClick={() => disconnect()}
        variant="outline"
        className="w-full h-16 text-lg font-mono rounded-xl border-2 border-accent/30 bg-accent/10 hover:bg-accent/20 text-foreground"
      >
        <Check className="h-5 w-5 mr-2 text-accent" />
        <span className="text-accent">{address.slice(0, 6)}...{address.slice(-4)}</span>
        <span className="text-muted-foreground ml-2">(Disconnect)</span>
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {connectors.map((connector) => (
        <Button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="w-full h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground transition-all transform hover:scale-102 shadow-lg"
        >
          <Wallet className="h-6 w-6 mr-3" />
          {isPending ? 'Connecting...' : `Connect ${connector.name}`}
        </Button>
      ))}
    </div>
  );
}
