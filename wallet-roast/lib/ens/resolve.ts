import { createPublicClient, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// Public client for ENS resolution (uses Ethereum mainnet)
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com'),
});

/**
 * Check if a string is an ENS name
 */
export function isEnsName(input: string): boolean {
  return input.endsWith('.eth') || input.endsWith('.xyz') || input.endsWith('.id');
}

/**
 * Check if input is a valid address or ENS name
 */
export function isValidAddressOrEns(input: string): boolean {
  if (!input) return false;
  return isAddress(input) || isEnsName(input);
}

/**
 * Resolve ENS name to address
 * Returns the address if successful, null if not found
 */
export async function resolveEnsName(ensName: string): Promise<string | null> {
  try {
    const normalizedName = normalize(ensName);
    const address = await publicClient.getEnsAddress({
      name: normalizedName,
    });
    return address;
  } catch (error) {
    console.error('ENS resolution error:', error);
    return null;
  }
}

/**
 * Resolve input to address (handles both ENS and raw addresses)
 */
export async function resolveToAddress(input: string): Promise<{
  address: string | null;
  ensName: string | null;
  error: string | null;
}> {
  const trimmedInput = input.trim().toLowerCase();

  // If it's already a valid address, return it
  if (isAddress(trimmedInput)) {
    return {
      address: trimmedInput,
      ensName: null,
      error: null,
    };
  }

  // If it looks like an ENS name, try to resolve it
  if (isEnsName(trimmedInput)) {
    const address = await resolveEnsName(trimmedInput);
    if (address) {
      return {
        address,
        ensName: trimmedInput,
        error: null,
      };
    } else {
      return {
        address: null,
        ensName: trimmedInput,
        error: `Could not resolve "${trimmedInput}" - ENS name not found`,
      };
    }
  }

  return {
    address: null,
    ensName: null,
    error: 'Invalid address or ENS name',
  };
}
