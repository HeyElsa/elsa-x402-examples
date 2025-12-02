#!/usr/bin/env node
/**
 * Test: Get Portfolio Overview Endpoint
 * Cost: $0.01
 * Note: This is a heavy endpoint that makes multiple backend calls
 */

import { createX402Client, printHeader, printResult, runTest, getTestWallet } from '../lib/client.js';

printHeader('POST /api/get_portfolio', '$0.01');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);
  console.log('⏳ This endpoint may take longer (multiple backend calls)...');

  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_portfolio', {
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
