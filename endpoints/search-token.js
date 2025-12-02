#!/usr/bin/env node
/**
 * Test: Search Token Endpoint
 * Cost: $0.001
 */

import { createX402Client, printHeader, printResult, runTest } from '../lib/client.js';

printHeader('POST /api/search_token', '$0.001');

runTest(async (client) => {
  const startTime = Date.now();

  try {
    const response = await client.post('/api/search_token', {
      symbol_or_address: 'USDC',
      limit: 5
    });
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
