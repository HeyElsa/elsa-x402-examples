'use client';

import { WHALE_WALLETS } from '@/lib/x402/constants';

interface WhaleButtonsProps {
  onSelect: (address: string) => void;
  disabled?: boolean;
}

const whaleEmojis = ['🐋', '🦈', '🐳', '🦑'];

export function WhaleButtons({ onSelect, disabled }: WhaleButtonsProps) {
  const whales = Object.values(WHALE_WALLETS);

  return (
    <div className="mt-5 pt-4 border-t border-white/5">
      <p className="text-white/40 text-xs mb-3 text-center flex items-center justify-center gap-2">
        <span>🎯</span>
        <span>Or roast a famous wallet:</span>
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {whales.map((whale, index) => (
          <button
            key={whale.address}
            type="button"
            onClick={() => onSelect(whale.address)}
            disabled={disabled}
            className="example-btn disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 hover:scale-105 transition-transform"
          >
            <span>{whaleEmojis[index % whaleEmojis.length]}</span>
            <span>{whale.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
