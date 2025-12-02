#!/usr/bin/env node
/**
 * Test: Get Stake Balances Endpoint
 * Cost: $0.005
 */

import { createX402Client, printHeader, printResult, runTest, getTestWallet } from '../lib/client.js';

printHeader('POST /api/get_stake_balances', '$0.005');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_stake_balances', {
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
