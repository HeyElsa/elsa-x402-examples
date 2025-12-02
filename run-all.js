#!/usr/bin/env node
/**
 * Run All X402 Endpoint Tests
 * Executes each endpoint test sequentially and provides a summary
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define all endpoints to test with their costs
const endpoints = [
  { name: 'health', script: 'health.js', cost: 'FREE' },
  { name: 'search-token', script: 'search-token.js', cost: '$0.001' },
  { name: 'token-price', script: 'token-price.js', cost: '$0.002' },
  { name: 'balances', script: 'balances.js', cost: '$0.005' },
  { name: 'portfolio', script: 'portfolio.js', cost: '$0.01' },
  { name: 'transaction-history', script: 'transaction-history.js', cost: '$0.003' },
  { name: 'analyze-wallet', script: 'analyze-wallet.js', cost: '$0.02' },
  { name: 'yield-suggestions', script: 'yield-suggestions.js', cost: '$0.02' },
  { name: 'pnl-report', script: 'pnl-report.js', cost: '$0.015' },
  { name: 'limit-orders', script: 'limit-orders.js', cost: '$0.002' },
  { name: 'stake-balances', script: 'stake-balances.js', cost: '$0.005' },
  { name: 'gas-prices', script: 'gas-prices.js', cost: '$0.001' },
  { name: 'swap-quote', script: 'swap-quote.js', cost: '$0.01' },
  { name: 'execute-swap', script: 'execute-swap.js', cost: '$0.10' },
  { name: 'create-limit-order', script: 'create-limit-order.js', cost: '$0.05' },
];

// Parse command line arguments
const args = process.argv.slice(2);
const skipPaid = args.includes('--free-only');
const skipConfirm = args.includes('--yes') || args.includes('-y');
const specificEndpoint = args.find(arg => !arg.startsWith('--') && arg !== '-y');

console.log('');
console.log('='.repeat(60));
console.log('🧪 Elsa X402 API - Complete Endpoint Test Suite');
console.log('='.repeat(60));
console.log('');

if (skipPaid) {
  console.log('⚠️  Running FREE endpoints only (--free-only flag)');
  console.log('');
}

if (specificEndpoint) {
  console.log(`📍 Running specific endpoint: ${specificEndpoint}`);
  console.log('');
}

// Calculate total cost
const endpointsToRun = endpoints
  .filter(e => !skipPaid || e.cost === 'FREE')
  .filter(e => !specificEndpoint || e.name === specificEndpoint);

const totalCost = endpointsToRun.reduce((sum, e) => {
  if (e.cost === 'FREE') return sum;
  return sum + parseFloat(e.cost.replace('$', ''));
}, 0);

console.log(`💰 Estimated total cost: $${totalCost.toFixed(3)}`);
console.log('');

/**
 * Prompt user for confirmation
 */
async function confirmCost() {
  if (skipConfirm || totalCost === 0) {
    return true;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`⚠️  This will cost ~$${totalCost.toFixed(3)} in X402 payments. Continue? [y/N] `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Run a single test script
function runTest(endpoint) {
  return new Promise((resolve) => {
    const scriptPath = join(__dirname, 'endpoints', endpoint.script);
    const startTime = Date.now();

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`▶️  Running: ${endpoint.name} (${endpoint.cost})`);
    console.log(`${'─'.repeat(60)}`);

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: process.env
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      resolve({
        name: endpoint.name,
        cost: endpoint.cost,
        success: code === 0,
        duration
      });
    });

    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.error(`Error running ${endpoint.name}:`, error.message);
      resolve({
        name: endpoint.name,
        cost: endpoint.cost,
        success: false,
        duration,
        error: error.message
      });
    });
  });
}

// Run all tests sequentially
async function runAllTests() {
  const results = [];

  // Validate endpoint if specific one requested
  if (specificEndpoint && endpointsToRun.length === 0) {
    console.error(`❌ Endpoint not found: ${specificEndpoint}`);
    console.log('\nAvailable endpoints:');
    endpoints.forEach(e => console.log(`   - ${e.name}`));
    process.exit(1);
  }

  // Confirm cost with user
  const confirmed = await confirmCost();
  if (!confirmed) {
    console.log('\n❌ Aborted by user');
    console.log('   Use --free-only to run only free endpoints');
    console.log('   Use --yes or -y to skip confirmation');
    process.exit(0);
  }

  for (const endpoint of endpointsToRun) {
    const result = await runTest(endpoint);
    results.push(result);
  }

  // Print summary
  console.log('\n');
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  const actualCost = successful
    .filter(r => r.cost !== 'FREE')
    .reduce((sum, r) => sum + parseFloat(r.cost.replace('$', '')), 0);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log(`⏱️  Total time: ${(totalTime / 1000).toFixed(1)}s`);
  console.log(`💰 Actual cost: $${actualCost.toFixed(3)}`);
  console.log('');

  if (successful.length > 0) {
    console.log('✅ Passed:');
    successful.forEach(r => {
      console.log(`   - ${r.name} (${r.cost}) - ${(r.duration / 1000).toFixed(1)}s`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed:');
    failed.forEach(r => {
      console.log(`   - ${r.name} (${r.cost}) - ${r.error || 'unknown error'}`);
    });
  }

  console.log('');

  // Exit with appropriate code
  process.exit(failed.length > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
