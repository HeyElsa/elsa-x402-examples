import { X402_API_URL, type NetworkName } from './constants';

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
 */
export async function getPaymentRequirements(
  walletAddress: string
): Promise<X402PaymentResponse> {
  const response = await fetch(`${X402_API_URL}/api/get_portfolio`, {
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
 */
export async function fetchPortfolioWithPayment(
  walletAddress: string,
  paymentHeader: string
): Promise<PortfolioResponse> {
  const response = await fetch(`${X402_API_URL}/api/get_portfolio`, {
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
 */
export async function fetchPnLReport(
  walletAddress: string,
  paymentHeader?: string
): Promise<PnLResponse | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (paymentHeader) {
      headers['X-PAYMENT'] = paymentHeader;
    }

    const response = await fetch(`${X402_API_URL}/api/get_pnl_report`, {
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
