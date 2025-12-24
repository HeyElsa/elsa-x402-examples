'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import { useRoast } from '@/hooks/use-roast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Flame, Zap, Skull, User } from 'lucide-react';
import { LoadingState } from './loading-state';
import { isValidAddressOrEns } from '@/lib/ens/resolve';
import { WHALE_WALLETS } from '@/lib/x402/constants';
import type { Intensity } from '@/lib/grok/prompts';
import Image from 'next/image';

const intensityConfig = {
  mild: { icon: Flame, label: 'MILD', color: 'bg-chart-4 hover:bg-chart-4/80 text-background' },
  spicy: { icon: Zap, label: 'SPICY', color: 'bg-primary hover:bg-primary/80 text-primary-foreground' },
  nuclear: {
    icon: Skull,
    label: 'NUCLEAR',
    color: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
  },
};

export function WalletRoastForm() {
  const [mounted, setMounted] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('nuclear');
  const [pendingRoast, setPendingRoast] = useState(false);

  const { address, isConnected } = useAccount();
  const { setOpen: openConnectModal } = useModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    step,
    error,
    portfolioStats,
    roastText,
    isStreaming,
    isLoading,
    startRoast,
    reset,
  } = useRoast();

  // Start roast after wallet connects
  useEffect(() => {
    if (pendingRoast && isConnected && !isLoading && address) {
      setPendingRoast(false);
      // Use connected address if walletAddress is empty (Roast Me flow)
      const targetAddress = walletAddress || address;
      if (!walletAddress) {
        setWalletAddress(address);
      }
      startRoast(targetAddress, intensity);
    }
  }, [pendingRoast, isConnected, isLoading, walletAddress, address, intensity, startRoast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAddressOrEns(walletAddress)) {
      return;
    }

    // If not connected, open wallet modal first
    if (!isConnected) {
      setPendingRoast(true);
      openConnectModal(true);
      return;
    }

    await startRoast(walletAddress, intensity);
  };

  const handleRoastMe = async () => {
    // If not connected, open wallet modal first
    if (!isConnected || !address) {
      setPendingRoast(true);
      setWalletAddress(''); // Will be set after connection
      openConnectModal(true);
      return;
    }

    // Use connected wallet address
    setWalletAddress(address);
    await startRoast(address, intensity);
  };

  const handleReset = () => {
    setWalletAddress('');
    reset();
  };

  const handleShare = () => {
    // X has 280 char limit - keep tweet concise
    const roastSnippet = roastText && roastText.length > 150
      ? roastText.substring(0, 147) + '...'
      : roastText;
    const tweetText = encodeURIComponent(
      `"${roastSnippet}"\n\nGet roasted for $0.01: https://walletroast.com\n\n@HeyElsaAI #x402`,
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Header with Logo */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <div className="relative animate-flame">
            <Image
              src="/logo.png"
              alt="Wallet Roast Logo"
              width={140}
              height={140}
              className="drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        <h1
          className="text-6xl md:text-7xl font-sans tracking-wider text-transparent bg-clip-text text-balance"
          style={{
            backgroundImage: 'linear-gradient(180deg, #FFD93D 0%, #FF6B35 50%, #F72C5B 100%)',
            textShadow: '4px 4px 0px rgba(0,0,0,0.3)',
            WebkitTextStroke: '2px rgba(0,0,0,0.1)',
          }}
        >
          WALLET ROAST
        </h1>

        <p className="text-xl text-muted-foreground font-[family-name:var(--font-nunito)]">
          Get savagely roasted based on your on-chain data
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-lg border-2 border-accent/50 shadow-lg transform hover:scale-105 transition-transform">
          <Flame className="h-5 w-5 animate-pulse" />
          $0.01 USDC on Base
        </div>
        <p className="text-sm text-muted-foreground/80 italic font-[family-name:var(--font-nunito)]">
          Cheaper than your last rugpull
        </p>
      </div>

      <Card className="p-6 md:p-8 space-y-6 bg-card border-4 border-primary/40 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative corner flames */}
        <div className="absolute -top-2 -right-2 text-4xl opacity-60 rotate-12">
          <span role="img" aria-label="fire">
            {"🔥"}
          </span>
        </div>
        <div className="absolute -bottom-2 -left-2 text-3xl opacity-40 -rotate-12">
          <span role="img" aria-label="fire">
            {"🔥"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input with comic styling */}
          <div className="relative">
            <Input
              type="text"
              placeholder="vitalik.eth or 0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isLoading}
              className="h-16 text-xl bg-input border-3 border-border font-mono rounded-xl pl-4 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Intensity buttons */}
          <div className="flex gap-3 justify-center">
            {(['mild', 'spicy', 'nuclear'] as Intensity[]).map((level) => {
              const config = intensityConfig[level];
              const Icon = config.icon;
              const isSelected = intensity === level;
              return (
                <Button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  disabled={isLoading}
                  className={`flex-1 h-14 text-lg font-bold rounded-xl border-3 transition-all transform ${
                    isSelected
                      ? `${config.color} scale-105 border-foreground/20 shadow-lg`
                      : 'bg-muted/50 hover:bg-muted text-muted-foreground border-transparent hover:scale-102'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-2 ${isSelected && level === 'nuclear' ? 'animate-shake' : ''}`} />
                  {config.label}
                </Button>
              );
            })}
          </div>

          {/* Roast button - connects wallet on click if needed */}
          <Button
            type="submit"
            disabled={!mounted || isLoading || !walletAddress.trim()}
            className={`w-full h-16 text-2xl font-bold rounded-xl transition-all transform hover:scale-102 ${
              isLoading
                ? 'bg-muted animate-pulse'
                : 'bg-gradient-to-r from-primary via-destructive to-primary bg-[length:200%_100%] hover:bg-right animate-fire-glow text-white'
            }`}
            style={{ backgroundPosition: 'left' }}
          >
            {!mounted ? (
              <span>Loading...</span>
            ) : isLoading ? (
              <span className="flex items-center gap-3">
                <Flame className="h-6 w-6 animate-spin" />
                ROASTING...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Flame className="h-6 w-6" />
                ROAST THIS WALLET
                <Flame className="h-6 w-6" />
              </span>
            )}
          </Button>

          {/* Roast Me button */}
          <Button
            type="button"
            onClick={handleRoastMe}
            disabled={!mounted || isLoading}
            variant="outline"
            className="w-full h-14 text-xl font-bold rounded-xl border-2 border-accent/50 hover:bg-accent/10 text-accent transition-all transform hover:scale-102"
          >
            <User className="h-5 w-5 mr-2" />
            ROAST ME
          </Button>

          {/* Persona quick-select */}
          <div className="flex gap-2 justify-center flex-wrap">
            <span className="text-muted-foreground text-sm font-[family-name:var(--font-nunito)]">Try:</span>
            {Object.values(WHALE_WALLETS).map((whale) => (
              <Button
                key={whale.address}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setWalletAddress(whale.address)}
                disabled={isLoading}
                className="text-accent hover:text-accent hover:bg-accent/10 font-mono text-sm rounded-full px-3"
              >
                {whale.name}
              </Button>
            ))}
          </div>
        </form>

        <LoadingState step={step} />

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive animate-bounce-in flex items-center gap-2">
            <span className="text-xl">😬</span>
            <span>{error}</span>
            <button
              onClick={handleReset}
              className="ml-auto underline hover:no-underline text-primary"
            >
              Try again
            </button>
          </div>
        )}
      </Card>

      {/* Result Card */}
      {roastText && portfolioStats && (
        <Card className="p-6 md:p-8 space-y-6 bg-card border-4 border-destructive/40 rounded-2xl shadow-2xl animate-bounce-in relative">
          {/* Speech bubble pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-card border-l-4 border-t-4 border-destructive/40 rotate-45" />

          <blockquote className="text-xl leading-relaxed font-[family-name:var(--font-nunito)] relative pl-6 border-l-4 border-primary/60">
            <span
              className="text-transparent bg-clip-text italic"
              style={{
                backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #F72C5B 50%, #FF6B35 100%)',
              }}
            >
              {roastText}
              {isStreaming && <span className="animate-pulse text-primary">|</span>}
            </span>
          </blockquote>

          {/* Wallet stats with retro terminal style */}
          <div className="bg-background/80 p-4 rounded-xl font-mono text-sm space-y-2 border-2 border-border">
            <div className="flex items-center gap-2">
              <span className="text-accent">{">"}</span>
              <span className="text-muted-foreground">Wallet:</span>
              <span className="text-accent font-bold">
                {portfolioStats.ensName || portfolioStats.wallet}
              </span>
              {portfolioStats.ensName && (
                <span className="text-muted-foreground/60">
                  ({portfolioStats.wallet.slice(0, 6)}...{portfolioStats.wallet.slice(-4)})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">{">"}</span>
              <span className="text-muted-foreground">Total Value:</span>
              <span className="text-chart-4 font-bold">${portfolioStats.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">{">"}</span>
              <span className="text-muted-foreground">Tokens:</span>
              <span className="text-foreground font-bold">{portfolioStats.tokenCount}</span>
            </div>
          </div>

          {/* Share button */}
          {!isStreaming && (
            <Button
              onClick={handleShare}
              className="w-full h-14 text-xl font-bold rounded-xl bg-black hover:bg-black/80 text-white transition-all transform hover:scale-102 shadow-lg border border-white/20"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              SHARE ON X
            </Button>
          )}
        </Card>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center space-y-3">
        <a
          href="https://x402.heyelsa.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          <span>Powered by</span>
          <img
            src="https://raw.githubusercontent.com/HeyElsa/brand-assets/main/Transparent/img_transparent.png"
            alt="Elsa"
            className="h-5 w-5"
          />
          <span className="text-muted-foreground/50">|</span>
          <span>x402</span>
        </a>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Zero API keys</span>
          <span className="text-muted-foreground/50">•</span>
          <span>Direct micropayment</span>
        </div>
        <p className="text-sm text-primary font-medium">
          This costs $0.01 paid directly via x402
        </p>
      </footer>
    </div>
  );
}
