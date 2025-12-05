import { MEME_COINS, STABLECOINS } from '@/lib/x402/constants';

export type Intensity = 'mild' | 'spicy' | 'nuclear';

export interface PortfolioData {
  totalValueUSD: number;
  tokenCount: number;
  balances: Array<{
    asset: string;
    balance_usd: number;
  }>;
}

/**
 * Build the system prompt for Grok roast generation
 */
export function buildRoastPrompt(
  portfolio: PortfolioData,
  intensity: Intensity
): string {
  const { totalValueUSD, tokenCount, balances } = portfolio;

  // Analyze portfolio
  const memeCoins = balances.filter((b) =>
    MEME_COINS.includes(b.asset?.toUpperCase())
  );
  const hasStables = balances.some((b) =>
    STABLECOINS.includes(b.asset?.toUpperCase())
  );
  const topHoldings = balances
    .slice(0, 5)
    .map((b) => b.asset)
    .join(', ');
  const topHolding = balances[0];
  const topHoldingPercent = topHolding && totalValueUSD > 0
    ? ((topHolding.balance_usd / totalValueUSD) * 100).toFixed(1)
    : '0';

  const intensityGuide = {
    mild: 'Light teasing, family-friendly. Gentle ribbing about their choices.',
    spicy: 'Pointed jokes with some burns. Call out bad decisions directly.',
    nuclear: 'Absolutely savage, no mercy. Brutal honesty about their degen behavior.',
  };

  return `You are a savage crypto portfolio roast comedian with deep knowledge of DeFi, meme coins, and trader psychology.

PORTFOLIO DATA:
- Total Value: $${totalValueUSD.toFixed(2)}
- Number of Tokens: ${tokenCount}
- Top Holdings: ${topHoldings || 'None'}
- Top Holding Concentration: ${topHoldingPercent}% in ${topHolding?.asset || 'N/A'}
- Has Meme Coins: ${memeCoins.length > 0 ? `Yes (${memeCoins.map((m) => m.asset).join(', ')})` : 'No'}
- Has Stablecoins: ${hasStables ? 'Yes' : 'No'}

INTENSITY: ${intensity.toUpperCase()}
${intensityGuide[intensity]}

RULES:
1. Generate ONE roast that is 2-4 sentences, around 200-280 characters
2. Reference SPECIFIC details from the portfolio data above
3. Be creative, punchy, and funny
4. Do NOT use asterisks, markdown, or formatting - plain text only
5. Do NOT be racist, sexist, or use slurs
6. DO roast their investment decisions, portfolio size, token choices
7. End with a punchline that lands
8. Make it savage but entertaining

Examples of good roasts:
- "$${totalValueUSD.toFixed(0)} portfolio? That's my weekly coffee budget. Even your wallet is crying looking at those numbers."
- "Holding ${topHolding?.asset || 'this'}? That's not conviction, that's copium. You're not diamond hands, you're just too scared to admit the L."
- "${tokenCount} tokens and still broke? Diversification isn't your problem, taste is. Your portfolio looks like a crypto yard sale."`;
}

/**
 * Build user prompt for roast generation
 */
export function buildUserPrompt(walletAddress: string): string {
  return `Roast this wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}. Give me your best shot.`;
}
