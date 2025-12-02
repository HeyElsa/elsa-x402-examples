#!/usr/bin/env node
/**
 * Test: Get Swap Quote Endpoint
 * Cost: $0.01
 */

import { printHeader, printResult, runTest, getTestWallet, TOKENS } from '../lib/client.js';

printHeader('POST /api/get_swap_quote', '$0.01');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);
  console.log(`💱 Swap: 0.01 USDC -> WETH`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_swap_quote', {
      from_chain: 'base',
      from_token: TOKENS.USDC,
      from_amount: '0.01',
      to_chain: 'base',
      to_token: TOKENS.WETH,
      wallet_address: testWallet,
      slippage: 2.0
    });
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
