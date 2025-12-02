#!/usr/bin/env node
/**
 * Test: Create Limit Order Endpoint (DRY RUN)
 * Cost: $0.05
 * Note: Uses dry_run=true to avoid actual order creation
 */

import { createX402Client, printHeader, printResult, runTest, getTestWallet } from '../lib/client.js';

printHeader('POST /api/create_limit_order (DRY RUN)', '$0.05');

runTest(async (client) => {
  const testWallet = getTestWallet();
  console.log(`\n📍 Testing wallet: ${testWallet}`);
  console.log(`📋 Order: 100 USDC -> WETH at limit price 4000`);
  console.log(`⚠️  DRY RUN MODE - No actual order will be created`);

  const startTime = Date.now();

  try {
    const response = await client.post('/api/create_limit_order', {
      from_chain: 'base',
      from_token: 'USDC',
      from_amount: '100',
      to_token: 'WETH',
      limit_price: '4000',
      wallet_address: testWallet,
      valid_for_hours: 168,  // 7 days
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
