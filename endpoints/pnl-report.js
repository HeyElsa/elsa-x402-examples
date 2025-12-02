#!/usr/bin/env node
/**
 * Test: Get P&L Report Endpoint
 * Cost: $0.015
 */

import { createX402Client, printHeader, printResult, runTest, getTestWallet } from '../lib/client.js';

printHeader('POST /api/get_pnl_report', '$0.015');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_pnl_report', {
      wallet_address: testWallet,
      time_period: '30_days'
    });
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
