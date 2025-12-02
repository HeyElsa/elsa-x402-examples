# Elsa X402 API Examples

Example scripts for testing Elsa's X402 micropayment-enabled DeFi API.

## Prerequisites

- Node.js 18+
- A wallet with USDC on Base network for paid endpoints
- Private key for the wallet

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
PRIVATE_KEY="0x..."      # Required: 0x + 64 hex characters
TEST_WALLET="0x..."      # Required: wallet address to test with
USE_MAINNET="true"
BASE_RPC_URL="https://mainnet.base.org"
X402_SERVER_URL="https://x402-api.heyelsa.ai"
```

## Usage

### Run All Tests
```bash
npm run test:all
```

This will prompt for confirmation before running paid tests. Use `-y` to skip:
```bash
node run-all.js -y
```

### Run Only Free Endpoints
```bash
node run-all.js --free-only
```

### Run Specific Endpoint
```bash
node run-all.js health
node run-all.js balances
```

### Command Line Flags
- `--free-only` - Only run free endpoints (no cost)
- `--yes` or `-y` - Skip cost confirmation prompt
- `<endpoint>` - Run a specific endpoint by name

### Run Individual Endpoints
```bash
npm run test:health          # FREE
npm run test:search-token    # $0.001
npm run test:token-price     # $0.002
npm run test:balances        # $0.005
npm run test:portfolio       # $0.01
npm run test:transaction-history  # $0.003
npm run test:analyze-wallet  # $0.02
npm run test:yield-suggestions    # $0.02
npm run test:pnl-report      # $0.015
npm run test:limit-orders    # $0.002
npm run test:stake-balances  # $0.005
npm run test:gas-prices      # $0.001
npm run test:swap-quote      # $0.01
npm run test:execute-swap    # $0.10 (dry run)
npm run test:create-limit-order   # $0.05 (dry run)
```

## Endpoints

| Endpoint | Cost | Description |
|----------|------|-------------|
| `/health` | FREE | Server health check |
| `/api/search_token` | $0.001 | Search for tokens |
| `/api/get_token_price` | $0.002 | Get token price |
| `/api/get_balances` | $0.005 | Get wallet balances |
| `/api/get_portfolio` | $0.01 | Get portfolio overview |
| `/api/get_transaction_history` | $0.003 | Get transaction history |
| `/api/analyze_wallet` | $0.02 | Comprehensive wallet analysis |
| `/api/get_yield_suggestions` | $0.02 | Get yield farming suggestions |
| `/api/get_pnl_report` | $0.015 | Get P&L report |
| `/api/get_limit_orders` | $0.002 | Get limit orders |
| `/api/get_stake_balances` | $0.005 | Get staking balances |
| `/api/get_gas_prices` | $0.001 | Get gas prices |
| `/api/get_swap_quote` | $0.01 | Get swap quote |
| `/api/execute_swap` | $0.10 | Execute swap |
| `/api/create_limit_order` | $0.05 | Create limit order |

## How X402 Works

1. Client makes a request to a paid endpoint
2. Server responds with 402 Payment Required
3. `x402-axios` interceptor automatically creates a payment
4. Payment is signed and sent with the retry request
5. Server validates payment and returns data

## Project Structure

```
elsa-x402-examples/
├── package.json
├── README.md
├── run-all.js           # Run all tests
├── .env                 # Environment variables (create this)
├── lib/
│   └── client.js        # Shared X402 client setup
└── endpoints/
    ├── health.js
    ├── search-token.js
    ├── token-price.js
    ├── balances.js
    ├── portfolio.js
    ├── transaction-history.js
    ├── analyze-wallet.js
    ├── yield-suggestions.js
    ├── pnl-report.js
    ├── limit-orders.js
    ├── stake-balances.js
    ├── gas-prices.js
    ├── swap-quote.js
    ├── execute-swap.js
    └── create-limit-order.js
```

## License

MIT
