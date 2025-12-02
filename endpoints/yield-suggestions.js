#!/usr/bin/env node
/**
 * Test: Get Yield Suggestions Endpoint
 * Cost: $0.02
 */

import { createX402Client, printHeader, printResult, runTest, getTestWallet } from '../lib/client.js';

printHeader('POST /api/get_yield_suggestions', '$0.02');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_yield_suggestions', {
      wallet_address: testWallet
    });
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
