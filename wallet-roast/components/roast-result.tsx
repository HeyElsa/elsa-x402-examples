'use client';

import { ShareButton } from './share-button';

interface PortfolioStats {
  wallet: string;
  ensName: string | null;
  totalValue: number;
  tokenCount: number;
}

interface RoastResultProps {
  roastText: string;
  portfolioStats: PortfolioStats | null;
  isStreaming: boolean;
}

export function RoastResult({
  roastText,
  portfolioStats,
  isStreaming,
}: RoastResultProps) {
  if (!roastText && !isStreaming) return null;

  return (
    <div className="mt-6 animate-scaleIn">
      {/* Roast header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-2xl">🎤</span>
        <span className="text-white/60 text-sm uppercase tracking-wider font-semibold">The Roast</span>
        <span className="text-2xl">🔥</span>
      </div>

      {/* Roast text card */}
      <div className="glass-card p-6 mb-4 relative overflow-hidden">
        {/* Decorative flames */}
        <div className="absolute -top-2 -left-2 text-3xl opacity-20 animate-wiggle">🔥</div>
        <div className="absolute -top-2 -right-2 text-3xl opacity-20 animate-wiggle-delayed">🔥</div>

        <div className="text-lg leading-relaxed text-white/90 relative z-10">
          <span className="text-2xl mr-2">&ldquo;</span>
          {roastText}
          {isStreaming && <span className="animate-pulse text-[#f97316]">|</span>}
          <span className="text-2xl ml-2">&rdquo;</span>
        </div>

        {/* Reaction emoji */}
        {!isStreaming && roastText && (
          <div className="mt-4 flex justify-center gap-3 text-2xl">
            <span className="animate-bounce-slow" style={{ animationDelay: '0ms' }}>😂</span>
            <span className="animate-bounce-slow" style={{ animationDelay: '200ms' }}>💀</span>
            <span className="animate-bounce-slow" style={{ animationDelay: '400ms' }}>🔥</span>
          </div>
        )}
      </div>

      {/* Portfolio stats */}
      {portfolioStats && (
        <div className="glass-card p-4 mb-4">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>Victim&apos;s Portfolio</span>
          </h3>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/50 flex items-center gap-2">
                <span>👛</span> Wallet
              </span>
              <span className="text-white/80">
                {portfolioStats.ensName ? (
                  <>
                    <span className="text-[#f97316]">{portfolioStats.ensName}</span>
                    {' '}
                    <span className="text-white/40">
                      ({portfolioStats.wallet.slice(0, 6)}...{portfolioStats.wallet.slice(-4)})
                    </span>
                  </>
                ) : (
                  <>
                    {portfolioStats.wallet.slice(0, 6)}...{portfolioStats.wallet.slice(-4)}
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 flex items-center gap-2">
                <span>💵</span> Total Value
              </span>
              <span className="text-[#f97316] font-semibold">
                ${portfolioStats.totalValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 flex items-center gap-2">
                <span>🪙</span> Tokens
              </span>
              <span className="text-white/80">{portfolioStats.tokenCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Share button */}
      {!isStreaming && roastText && <ShareButton roastText={roastText} />}
    </div>
  );
}
