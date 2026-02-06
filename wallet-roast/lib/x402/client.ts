import { X402_API_URL, type NetworkName } from './constants';

export type TokenType = 'usdc' | 'elsa';

export interface X402PaymentResponse {
  x402Version: number;
  error?: string;
  accepts: Array<{
    scheme: string;
    network: NetworkName;
    maxAmountRequired: string;
    resource: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra?: { name?: string; version?: string };
  }>;
}

export interface PortfolioResponse {
  success: boolean;
  wallet_address: string;
  network: string;
  portfolio: {
    totalValueUSD?: number;
    total_value_usd?: number;
    balances: Array<{
      asset: string;
      balance_usd: number;
      chain?: string;
    }>;
  };
  timestamp: string;
}

export interface PnLResponse {
  success: boolean;
  pnl_report: {
    total_pnl_usd?: number;
    net_pnl_usd?: number;
  };
}

/**
 * Get payment requirements from X402 API (expects 402 response)
 * @param walletAddress - The wallet address to query
 * @param tokenType - The token type to use for payment ('usdc' or 'elsa', defaults to 'elsa')
 */
export async function getPaymentRequirements(
  walletAddress: string,
  tokenType: TokenType = 'elsa'
): Promise<X402PaymentResponse> {
  const endpoint = tokenType === 'elsa'
    ? `${X402_API_URL}/api/elsa/get_portfolio`
    : `${X402_API_URL}/api/get_portfolio`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });

  if (response.status === 402) {
    return response.json();
  }

  if (response.ok) {
    throw new Error('Payment not required - unexpected free response');
  }

  const errorText = await response.text();
  throw new Error(`API error ${response.status}: ${errorText}`);
}

/**
 * Fetch portfolio with X-PAYMENT header
 * @param walletAddress - The wallet address to query
 * @param paymentHeader - The payment header
 * @param tokenType - The token type to use for payment ('usdc' or 'elsa', defaults to 'elsa')
 */
export async function fetchPortfolioWithPayment(
  walletAddress: string,
  paymentHeader: string,
  tokenType: TokenType = 'elsa'
): Promise<PortfolioResponse> {
  const endpoint = tokenType === 'elsa'
    ? `${X402_API_URL}/api/elsa/get_portfolio`
    : `${X402_API_URL}/api/get_portfolio`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-PAYMENT': paymentHeader,
    },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    // Handle 402 - payment was rejected or failed
    if (response.status === 402) {
      const reason = errorData?.error || errorData?.message || 'Payment was not accepted';
      throw new Error(`Payment failed: ${reason}`);
    }

    // Handle other errors
    const errorMessage = typeof errorData?.error === 'string'
      ? errorData.error
      : typeof errorData?.message === 'string'
        ? errorData.message
        : `Portfolio fetch failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch PnL report (optional, may require separate payment)
 * @param walletAddress - The wallet address to query
 * @param paymentHeader - The payment header (optional)
 * @param tokenType - The token type to use for payment ('usdc' or 'elsa', defaults to 'elsa')
 */
export async function fetchPnLReport(
  walletAddress: string,
  paymentHeader?: string,
  tokenType: TokenType = 'elsa'
): Promise<PnLResponse | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (paymentHeader) {
      headers['X-PAYMENT'] = paymentHeader;
    }

    const endpoint = tokenType === 'elsa'
      ? `${X402_API_URL}/api/elsa/get_pnl_report`
      : `${X402_API_URL}/api/get_pnl_report`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ wallet_address: walletAddress }),
    });

    if (response.ok) {
      return response.json();
    }

    // PnL is optional, don't fail if it requires payment
    return null;
  } catch {
    // PnL is optional
    return null;
  }
}
