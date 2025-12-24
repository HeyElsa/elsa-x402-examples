'use client';

interface ShareButtonProps {
  roastText: string;
}

export function ShareButton({ roastText }: ShareButtonProps) {
  const handleShare = () => {
    const tweetText = `🔥 I just got my wallet roasted for $0.01 via x402!

"${roastText}"

Try it yourself 👉 https://roast.x402.heyelsa.ai

Powered by @HeyElsaAI - zero API keys, just micropayments ⚡`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    );
  };

  return (
    <button
      onClick={handleShare}
      className="
        w-full py-3.5 rounded-xl font-semibold
        bg-gradient-to-r from-[#1da1f2] to-[#0d8bd9]
        text-white transition-all
        hover:shadow-[0_0_20px_rgba(29,161,242,0.4)]
        hover:-translate-y-0.5
        flex items-center justify-center gap-2
      "
    >
      <span className="text-xl">🐦</span>
      <span>Share the burn on X</span>
      <span className="text-xl">🔥</span>
    </button>
  );
}
