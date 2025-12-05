'use client';

import { useState, useCallback } from 'react';
import { useAccount, useSignTypedData, useSwitchChain } from 'wagmi';
import { useCompletion } from '@ai-sdk/react';
import { base, polygon } from 'wagmi/chains';
import type { Hex } from 'viem';

import {
  getPaymentRequirements,
  fetchPortfolioWithPayment,
} from '@/lib/x402/client';
import { buildPaymentTypedData, encodePaymentHeader } from '@/lib/x402/eip712';
import { NETWORK_CONFIG, type NetworkName } from '@/lib/x402/constants';
import { resolveToAddress, isEnsName } from '@/lib/ens/resolve';
import type { Intensity } from '@/lib/grok/prompts';
import type { LoadingStep } from '@/components/loading-state';

interface PortfolioStats {
  wallet: string;
  ensName: string | null;
  totalValue: number;
  tokenCount: number;
  balances: Array<{ asset: string; balance_usd: number }>;
}

export function useRoast() {
  const [step, setStep] = useState<LoadingStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);

  const { address, isConnected, chain } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { switchChainAsync } = useSwitchChain();

  const {
    completion: roastText,
    complete,
    isLoading: isStreaming,
    setCompletion,
  } = useCompletion({
    api: '/api/roast',
  });

  const startRoast = useCallback(
    async (targetWallet: string, intensity: Intensity) => {
      try {
        setError(null);
        setPortfolioStats(null);
        setCompletion('');

        // Step 1: Check wallet connection
        if (!isConnected || !address) {
          throw new Error('Please connect your wallet first');
        }

        // Step 1.5: Resolve ENS name if needed
        let resolvedAddress = targetWallet;
        let ensName: string | null = null;

        if (isEnsName(targetWallet)) {
          setStep('resolving');
          const resolution = await resolveToAddress(targetWallet);
          if (resolution.error || !resolution.address) {
            throw new Error(resolution.error || 'Failed to resolve ENS name');
          }
          resolvedAddress = resolution.address;
          ensName = resolution.ensName;
        }

        setStep('connecting');

        // Step 2: Get payment requirements from X402 server
        const paymentReq = await getPaymentRequirements(resolvedAddress);
        const paymentOption = paymentReq.accepts[0];

        if (!paymentOption) {
          throw new Error('No payment options available');
        }

        const networkName = paymentOption.network as NetworkName;
        const networkConfig = NETWORK_CONFIG[networkName];

        // Step 3: Switch chain if needed
        const targetChainId = networkConfig?.chainId || 8453;
        if (chain?.id !== targetChainId) {
          const targetChain = networkName === 'polygon' ? polygon : base;
          await switchChainAsync({ chainId: targetChain.id });
        }

        setStep('signing');

        // Step 4: Build and sign EIP-712 typed data
        const typedData = buildPaymentTypedData(
          {
            maxAmountRequired: paymentOption.maxAmountRequired,
            payTo: paymentOption.payTo,
            scheme: paymentOption.scheme,
            network: networkName,
            maxTimeoutSeconds: paymentOption.maxTimeoutSeconds,
            asset: paymentOption.asset,
            extra: paymentOption.extra,
          },
          address
        );

        const signature = await signTypedDataAsync({
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.message,
        });

        // Step 5: Encode payment header
        const paymentHeader = encodePaymentHeader(
          paymentReq.x402Version,
          paymentOption.scheme,
          paymentOption.network,
          signature as Hex,
          typedData.authorization
        );

        setStep('fetching');

        // Step 6: Fetch portfolio with payment
        const portfolioResponse = await fetchPortfolioWithPayment(
          resolvedAddress,
          paymentHeader
        );

        const portfolioData = portfolioResponse.portfolio || {};
        const totalValue = parseFloat(
          String(portfolioData.totalValueUSD || portfolioData.total_value_usd || 0)
        );
        const balances = portfolioData.balances || [];

        const stats: PortfolioStats = {
          wallet: resolvedAddress,
          ensName,
          totalValue,
          tokenCount: balances.length,
          balances: balances.map((b) => ({
            asset: b.asset,
            balance_usd: b.balance_usd,
          })),
        };

        setPortfolioStats(stats);
        setStep('generating');

        // Step 7: Stream roast from Grok
        await complete('', {
          body: {
            portfolio: {
              totalValueUSD: stats.totalValue,
              tokenCount: stats.tokenCount,
              balances: stats.balances,
            },
            intensity,
            walletAddress: resolvedAddress,
            ensName,
          },
        });

        setStep('complete');
      } catch (err) {
        setStep('error');
        const errorMessage =
          err instanceof Error ? err.message : 'Something went wrong';
        setError(errorMessage);
        console.error('Roast error:', err);
      }
    },
    [
      isConnected,
      address,
      chain,
      signTypedDataAsync,
      switchChainAsync,
      complete,
      setCompletion,
    ]
  );

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setPortfolioStats(null);
    setCompletion('');
  }, [setCompletion]);

  return {
    step,
    error,
    portfolioStats,
    roastText,
    isStreaming,
    startRoast,
    reset,
    isLoading: ['resolving', 'connecting', 'signing', 'fetching', 'generating'].includes(step),
  };
}
