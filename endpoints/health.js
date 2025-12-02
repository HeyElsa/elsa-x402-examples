#!/usr/bin/env node
/**
 * Test: Health Check Endpoint
 * Cost: FREE
 */

import { createX402Client, printHeader, printResult, runTest } from '../lib/client.js';

printHeader('GET /health', 'FREE');

runTest(async (client) => {
  const startTime = Date.now();

  try {
    const response = await client.get('/health');
    const duration = Date.now() - startTime;
    printResult(true, duration, response.data);
  } catch (error) {
    const duration = Date.now() - startTime;
    printResult(false, duration, null, error.message);
    throw error;
  }
});
