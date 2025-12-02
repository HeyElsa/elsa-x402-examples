#!/usr/bin/env node
/**
 * Test: Execute Swap Endpoint (DRY RUN)
 * Cost: $0.10
 * Note: Uses dry_run=true to avoid actual swap execution
 */

import { printHeader, printResult, runTest, getTestWallet, TOKENS } from '../lib/client.js';

printHeader('POST /api/execute_swap (DRY RUN)', '$0.10');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);
  console.log(`💱 Swap: 0.01 USDC -> WETH`);
  console.log(`⚠️  DRY RUN MODE - No actual swap will be executed`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/execute_swap', {
      from_chain: 'base',
      from_token: TOKENS.USDC,
      from_amount: '0.01',
      to_chain: 'base',
      to_token: TOKENS.WETH,
      wallet_address: testWallet,
      slippage: 2.0,
      dry_run: true
    });
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
