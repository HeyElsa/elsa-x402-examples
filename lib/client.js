/**
 * Shared X402 Client Setup
 * Configures the axios client with X402 payment interceptor
 */

import dotenv from 'dotenv';
dotenv.config();

import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';

// Configuration
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USE_MAINNET = process.env.USE_MAINNET === 'true';
const BASE_MAINNET_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const BASE_TESTNET_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const X402_SERVER_URL = process.env.X402_SERVER_URL || 'https://x402-api.heyelsa.ai';

// Token addresses on Base (canonical addresses)
export const TOKENS = {
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  WETH: '0x4200000000000000000000000000000000000006',
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
};

/**
 * Validate required environment variables
 */
export function validateEnv() {
  if (!PRIVATE_KEY) {
    console.error('❌ ERROR: PRIVATE_KEY environment variable is required');
    console.error('   Create a .env file with:');
    console.error('   PRIVATE_KEY="0x..."');
    console.error('   TEST_WALLET="0x..."');
    console.error('   USE_MAINNET="true"');
    console.error('   BASE_RPC_URL="https://mainnet.base.org"');
    process.exit(1);
  }

  // Validate private key format (0x + 64 hex characters)
  if (!/^0x[a-fA-F0-9]{64}$/.test(PRIVATE_KEY)) {
    console.error('❌ ERROR: PRIVATE_KEY must be a valid hex string (0x + 64 hex characters)');
    process.exit(1);
  }

  if (!process.env.TEST_WALLET) {
    console.error('❌ ERROR: TEST_WALLET environment variable is required');
    console.error('   Add to .env: TEST_WALLET="0x..."');
    process.exit(1);
  }

  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(process.env.TEST_WALLET)) {
    console.error('❌ ERROR: TEST_WALLET must be a valid Ethereum address (0x + 40 hex characters)');
    process.exit(1);
  }

  if (USE_MAINNET && !BASE_MAINNET_RPC_URL) {
    console.error('❌ ERROR: BASE_RPC_URL environment variable is required for mainnet');
    process.exit(1);
  }

  if (!USE_MAINNET && !BASE_TESTNET_RPC_URL) {
    console.error('❌ ERROR: BASE_SEPOLIA_RPC_URL environment variable is required for testnet');
    process.exit(1);
  }
}

/**
 * Create and configure the X402 client
 */
export async function createX402Client() {
  validateEnv();

  // Create account from private key
  const account = privateKeyToAccount(PRIVATE_KEY);

  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain: USE_MAINNET ? base : baseSepolia,
    transport: http(USE_MAINNET ? BASE_MAINNET_RPC_URL : BASE_TESTNET_RPC_URL)
  });

  // Create base axios instance with 90s timeout for heavy endpoints
  const baseAxios = axios.create({
    baseURL: X402_SERVER_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 90000
  });

  // Apply X402 payment interceptor
  const x402Client = withPaymentInterceptor(baseAxios, walletClient);

  return {
    client: x402Client,
    walletAddress: account.address,
    serverUrl: X402_SERVER_URL,
    network: USE_MAINNET ? 'Base Mainnet' : 'Base Sepolia'
  };
}

/**
 * Get the test wallet address from environment
 */
export function getTestWallet() {
  return process.env.TEST_WALLET;
}

/**
 * Print test header
 */
export function printHeader(endpointName, cost) {
  console.log('');
  console.log('='.repeat(50));
  console.log(`📍 Testing: ${endpointName}`);
  console.log(`💰 Cost: ${cost}`);
  console.log('='.repeat(50));
}

/**
 * Print test result
 */
export function printResult(success, duration, data, error) {
  if (success) {
    console.log(`\n✅ SUCCESS in ${duration}ms`);
    console.log('📊 Response:');
    console.log(JSON.stringify(data, null, 2).substring(0, 2000));
    if (JSON.stringify(data).length > 2000) {
      console.log('... (truncated)');
    }
  } else {
    console.log(`\n❌ FAILED in ${duration}ms`);
    console.log(`💥 Error: ${error}`);
  }
}

/**
 * Run a test and handle errors
 */
export async function runTest(testFn) {
  try {
    const { client, walletAddress, serverUrl, network } = await createX402Client();

    console.log('🔧 X402 Client Configuration:');
    console.log(`   Server: ${serverUrl}`);
    console.log(`   Network: ${network}`);
    console.log(`   Wallet: ${walletAddress}`);

    await testFn(client);

    console.log('\n✨ Test completed!');
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n💥 Test failed:', errorMessage);

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error;
      if (axiosError.response) {
        console.error('   Status:', axiosError.response.status);
        try {
          console.error('   Data:', JSON.stringify(axiosError.response.data, null, 2));
        } catch {
          console.error('   Data:', axiosError.response.data);
        }
      }
    }
    process.exit(1);
  }
}

export { X402_SERVER_URL, USE_MAINNET };
