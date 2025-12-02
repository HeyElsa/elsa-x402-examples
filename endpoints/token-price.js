#!/usr/bin/env node
/**
 * Test: Get Token Price Endpoint
 * Cost: $0.002
 */

import { printHeader, printResult, runTest, TOKENS } from '../lib/client.js';

printHeader('POST /api/get_token_price', '$0.002');

runTest(async (client) => {
  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_token_price', {
      token_address: TOKENS.USDC,
      chain: 'base'
    });
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
