#!/usr/bin/env node
/**
 * Test: Analyze Wallet Endpoint
 * Cost: $0.02
 */

import { createX402Client, printHeader, printResult, runTest, getTestWallet } from '../lib/client.js';

printHeader('POST /api/analyze_wallet', '$0.02');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/analyze_wallet', {
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
