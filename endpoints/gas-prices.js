#!/usr/bin/env node
/**
 * Test: Get Gas Prices Endpoint
 * Cost: $0.001
 */

import { createX402Client, printHeader, printResult, runTest } from '../lib/client.js';

printHeader('POST /api/get_gas_prices', '$0.001');

runTest(async (client) => {
  const startTime = Date.now();

  try {
    const response = await client.post('/api/get_gas_prices', {
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
