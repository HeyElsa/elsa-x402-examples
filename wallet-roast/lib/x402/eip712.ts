import { getAddress, toHex, type Address, type Hex } from 'viem';
import { NETWORK_CONFIG, type NetworkName } from './constants';

export interface PaymentRequirements {
  maxAmountRequired: string;
  payTo: string;
  scheme: string;
  network: NetworkName;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: { name?: string; version?: string };
}

export interface PaymentAuthorization {
  from: Address;
  to: Address;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: Hex;
}

export interface PaymentTypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: Address;
  };
  types: {
    TransferWithAuthorization: Array<{ name: string; type: string }>;
  };
  primaryType: 'TransferWithAuthorization';
  message: {
    from: Address;
    to: Address;
    value: bigint;
    validAfter: bigint;
    validBefore: bigint;
    nonce: Hex;
  };
  authorization: PaymentAuthorization;
}

/**
 * Generate a random 32-byte nonce as hex
 */
export function generateNonce(): Hex {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return toHex(randomBytes);
}

/**
 * Build EIP-712 typed data for USDC TransferWithAuthorization
 * This is the exact same logic from the original HTML implementation
 */
export function buildPaymentTypedData(
  requirements: PaymentRequirements,
  userAddress: string
): PaymentTypedData {
  const { maxAmountRequired, payTo, maxTimeoutSeconds, asset, extra, network } = requirements;

  const nonce = generateNonce();
  const now = Math.floor(Date.now() / 1000);
  const validAfter = (now - 600).toString(); // 10 minutes ago
  const validBefore = (now + maxTimeoutSeconds).toString();

  const networkConfig = NETWORK_CONFIG[network];
  const chainId = networkConfig?.chainId || 8453;

  const domain = {
    name: extra?.name || 'USD Coin',
    version: extra?.version || '2',
    chainId,
    verifyingContract: getAddress(asset) as Address,
  };

  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };

  const message = {
    from: getAddress(userAddress) as Address,
    to: getAddress(payTo) as Address,
    value: BigInt(maxAmountRequired),
    validAfter: BigInt(validAfter),
    validBefore: BigInt(validBefore),
    nonce,
  };

  const authorization: PaymentAuthorization = {
    from: getAddress(userAddress) as Address,
    to: getAddress(payTo) as Address,
    value: maxAmountRequired,
    validAfter,
    validBefore,
    nonce,
  };

  return {
    domain,
    types,
    primaryType: 'TransferWithAuthorization' as const,
    message,
    authorization,
  };
}

/**
 * Encode payment header as base64 JSON
 */
export function encodePaymentHeader(
  x402Version: number,
  scheme: string,
  network: string,
  signature: Hex,
  authorization: PaymentAuthorization
): string {
  const paymentPayload = {
    x402Version,
    scheme,
    network,
    payload: {
      signature,
      authorization,
    },
  };

  return btoa(JSON.stringify(paymentPayload));
}
