/**
 * BSCScan API Service for transaction verification
 * Verifies that TX hash is real and matches claimed investment
 */

const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';

// Direct RPC URLs for mainnet and testnet (more reliable than BSCScan API)
const RPC_URLS = {
  mainnet: 'https://bsc-dataseed.binance.org/',
  testnet: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
};

// BSCScan API URLs (V2 compatible)
const BSCSCAN_API_URLS = {
  mainnet: 'https://api.bscscan.com/api',
  testnet: 'https://api-testnet.bscscan.com/api'
};

// Known USDT/USDC contract addresses on BSC
const STABLECOIN_CONTRACTS = {
  mainnet: {
    usdt: '0x55d398326f99059ff775485246999027b3197955', // BSC-USD (USDT)
    usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'  // USD Coin (USDC)
  },
  testnet: {
    usdt: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd', // Test USDT on BSC Testnet
    usdc: '0x64544969ed7ebf5f083679233325356ebe738930'  // Test USDC on BSC Testnet
  }
};

function getRpcUrl(network = 'mainnet') {
  return RPC_URLS[network] || RPC_URLS.mainnet;
}

function getApiUrl(network = 'mainnet') {
  return BSCSCAN_API_URLS[network] || BSCSCAN_API_URLS.mainnet;
}

/**
 * Make JSON-RPC call to BSC node
 */
async function rpcCall(method, params, network = 'mainnet') {
  const rpcUrl = getRpcUrl(network);
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });
  return response.json();
}

/**
 * Get transaction details from BSC RPC
 */
async function getTransaction(txHash, network = 'mainnet') {
  try {
    const data = await rpcCall('eth_getTransactionByHash', [txHash], network);

    if (data.result && data.result.hash) {
      return {
        success: true,
        tx: data.result
      };
    }

    return { success: false, error: 'Transaction not found' };
  } catch (error) {
    console.error('RPC getTransaction error:', error);
    return { success: false, error: 'RPC error' };
  }
}

/**
 * Get transaction receipt (for confirmation status)
 */
async function getTransactionReceipt(txHash, network = 'mainnet') {
  try {
    const data = await rpcCall('eth_getTransactionReceipt', [txHash], network);

    if (data.result && data.result.transactionHash) {
      return {
        success: true,
        receipt: data.result,
        confirmed: data.result.status === '0x1'
      };
    }

    return { success: false, error: 'Receipt not found' };
  } catch (error) {
    console.error('RPC getTransactionReceipt error:', error);
    return { success: false, error: 'RPC error' };
  }
}

/**
 * Get BEP-20 token transfers for a transaction
 */
async function getTokenTransfers(txHash, network = 'mainnet') {
  try {
    const apiUrl = getApiUrl(network);

    // First get the block number from the transaction
    const txResult = await getTransaction(txHash, network);
    if (!txResult.success) {
      return txResult;
    }

    const blockNumber = parseInt(txResult.tx.blockNumber, 16);

    // Get token transfers in this transaction
    const url = `${apiUrl}?module=account&action=tokentx&startblock=${blockNumber}&endblock=${blockNumber}&sort=asc&apikey=${BSCSCAN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === '1' && data.result) {
      // Filter transfers from this specific transaction
      const transfers = data.result.filter(t => t.hash.toLowerCase() === txHash.toLowerCase());
      return {
        success: true,
        transfers
      };
    }

    return { success: false, error: 'No token transfers found' };
  } catch (error) {
    console.error('BSCScan getTokenTransfers error:', error);
    return { success: false, error: 'BSCScan API error' };
  }
}

/**
 * Verify a USDT/USDC transfer transaction
 * @param {string} txHash - Transaction hash
 * @param {string} expectedRecipient - Expected recipient wallet address
 * @param {number} expectedAmount - Expected amount in USD (with 18 decimals for USDT on BSC)
 * @param {number} tolerance - Amount tolerance percentage (default 1%)
 * @param {string} network - 'mainnet' or 'testnet'
 */
async function verifyStablecoinTransfer(txHash, expectedRecipient, expectedAmount, tolerance = 1, network = 'mainnet') {
  try {
    // Validate TX hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return {
        success: false,
        verified: false,
        error: 'Invalid TX hash format'
      };
    }

    // Check if transaction exists and is confirmed
    const receiptResult = await getTransactionReceipt(txHash, network);
    if (!receiptResult.success) {
      return {
        success: true,
        verified: false,
        status: 'not_found',
        error: `Transaction not found on BSC ${network}`
      };
    }

    if (!receiptResult.confirmed) {
      return {
        success: true,
        verified: false,
        status: 'failed',
        error: 'Transaction failed or pending'
      };
    }

    // For testnet: simplified verification - just check TX exists and succeeded
    if (network === 'testnet') {
      return {
        success: true,
        verified: true,
        status: 'verified_testnet',
        details: {
          note: 'Testnet verification - TX exists and confirmed',
          txHash: txHash
        }
      };
    }

    // Get token transfers
    const transfersResult = await getTokenTransfers(txHash, network);
    if (!transfersResult.success) {
      return {
        success: true,
        verified: false,
        status: 'no_transfers',
        error: 'No token transfers found in transaction'
      };
    }

    const normalizedRecipient = expectedRecipient.toLowerCase();
    const networkContracts = STABLECOIN_CONTRACTS[network] || STABLECOIN_CONTRACTS.mainnet;

    // Find a matching USDT/USDC transfer to our wallet
    for (const transfer of transfersResult.transfers) {
      const contractAddress = transfer.contractAddress.toLowerCase();
      const isStablecoin = Object.values(networkContracts).includes(contractAddress);

      if (!isStablecoin) continue;

      const recipient = transfer.to.toLowerCase();
      if (recipient !== normalizedRecipient) continue;

      // Calculate amount (USDT on BSC has 18 decimals)
      const decimals = parseInt(transfer.tokenDecimal) || 18;
      const transferAmount = parseFloat(transfer.value) / Math.pow(10, decimals);

      // Check if amount is within tolerance
      const minAmount = expectedAmount * (1 - tolerance / 100);
      const maxAmount = expectedAmount * (1 + tolerance / 100);

      if (transferAmount >= minAmount && transferAmount <= maxAmount) {
        return {
          success: true,
          verified: true,
          status: 'verified',
          details: {
            from: transfer.from,
            to: transfer.to,
            amount: transferAmount,
            token: transfer.tokenSymbol,
            blockNumber: parseInt(transfer.blockNumber),
            timestamp: new Date(parseInt(transfer.timeStamp) * 1000).toISOString(),
            confirmations: transfer.confirmations
          }
        };
      } else {
        return {
          success: true,
          verified: false,
          status: 'amount_mismatch',
          error: `Amount mismatch: expected ~$${expectedAmount}, found $${transferAmount.toFixed(2)}`,
          details: {
            expectedAmount,
            actualAmount: transferAmount,
            token: transfer.tokenSymbol
          }
        };
      }
    }

    return {
      success: true,
      verified: false,
      status: 'recipient_mismatch',
      error: 'No transfer to expected wallet found'
    };

  } catch (error) {
    console.error('verifyStablecoinTransfer error:', error);
    return {
      success: false,
      verified: false,
      error: 'Verification error: ' + error.message
    };
  }
}

/**
 * Quick check if TX exists (without full verification)
 */
async function txExists(txHash) {
  const result = await getTransaction(txHash);
  return result.success;
}

module.exports = {
  getTransaction,
  getTransactionReceipt,
  getTokenTransfers,
  verifyStablecoinTransfer,
  txExists,
  STABLECOIN_CONTRACTS
};
