'use client';

import { Flame, CreditCard, Sparkles, Search, Wallet, PenTool } from 'lucide-react';
import type { TokenType } from '@/lib/x402/client';

export type LoadingStep =
  | 'idle'
  | 'resolving'
  | 'connecting'
  | 'signing'
  | 'fetching'
  | 'generating'
  | 'complete'
  | 'error';

interface LoadingStateProps {
  step: LoadingStep;
  tokenType?: TokenType;
}

const getStepConfig = (tokenType: TokenType = 'elsa'): Record<LoadingStep, { icon: typeof Flame | null; text: string; subtext: string } | null> => ({
  idle: null,
  resolving: {
    icon: Search,
    text: 'Resolving ENS name...',
    subtext: 'Looking up wallet address',
  },
  connecting: {
    icon: Wallet,
    text: 'Connecting to server...',
    subtext: 'Establishing secure connection',
  },
  signing: {
    icon: PenTool,
    text: 'Sign to authorize...',
    subtext: tokenType === 'elsa' ? 'Approve the ELSA token payment' : 'Approve the $0.01 payment',
  },
  fetching: {
    icon: Flame,
    text: 'Fetching wallet data...',
    subtext: 'Analyzing your on-chain activity',
  },
  generating: {
    icon: Sparkles,
    text: 'Generating roast...',
    subtext: 'Grok AI is preparing your roast',
  },
  complete: null,
  error: null,
});

export function LoadingState({ step, tokenType = 'elsa' }: LoadingStateProps) {
  const stepConfig = getStepConfig(tokenType);
  const config = stepConfig[step];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="mt-6 p-4 bg-muted/30 rounded-xl border border-border animate-bounce-in">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          {Icon && <Icon className="h-5 w-5 text-primary animate-pulse" />}
        </div>
        <div>
          <p className="text-foreground font-semibold font-[family-name:var(--font-nunito)]">
            {config.text}
          </p>
          <p className="text-muted-foreground text-sm">
            {config.subtext}
          </p>
        </div>
        <div className="ml-auto flex gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
