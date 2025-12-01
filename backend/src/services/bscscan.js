/**
 * BSCScan API Service for transaction verification
 * Verifies that TX hash is real and matches claimed investment
 */

const BSCSCAN_API_URL = 'https://api.bscscan.com/api';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';

// Known USDT/USDC contract addresses on BSC
const STABLECOIN_CONTRACTS = {
  usdt: '0x55d398326f99059ff775485246999027b3197955', // BSC-USD (USDT)
  usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'  // USD Coin (USDC)
};

/**
 * Get transaction details from BSCScan
 */
async function getTransaction(txHash) {
  try {
    const url = `${BSCSCAN_API_URL}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.result && data.result.hash) {
      return {
        success: true,
        tx: data.result
      };
    }

    return { success: false, error: 'Transaction not found' };
  } catch (error) {
    console.error('BSCScan getTransaction error:', error);
    return { success: false, error: 'BSCScan API error' };
  }
}

/**
 * Get transaction receipt (for confirmation status)
 */
async function getTransactionReceipt(txHash) {
  try {
    const url = `${BSCSCAN_API_URL}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.result && data.result.transactionHash) {
      return {
        success: true,
        receipt: data.result,
        confirmed: data.result.status === '0x1'
      };
    }

    return { success: false, error: 'Receipt not found' };
  } catch (error) {
    console.error('BSCScan getTransactionReceipt error:', error);
    return { success: false, error: 'BSCScan API error' };
  }
}

/**
 * Get BEP-20 token transfers for a transaction
 */
async function getTokenTransfers(txHash) {
  try {
    // First get the block number from the transaction
    const txResult = await getTransaction(txHash);
    if (!txResult.success) {
      return txResult;
    }

    const blockNumber = parseInt(txResult.tx.blockNumber, 16);

    // Get token transfers in this transaction
    const url = `${BSCSCAN_API_URL}?module=account&action=tokentx&startblock=${blockNumber}&endblock=${blockNumber}&sort=asc&apikey=${BSCSCAN_API_KEY}`;
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
 */
async function verifyStablecoinTransfer(txHash, expectedRecipient, expectedAmount, tolerance = 1) {
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
    const receiptResult = await getTransactionReceipt(txHash);
    if (!receiptResult.success) {
      return {
        success: true,
        verified: false,
        status: 'not_found',
        error: 'Transaction not found on BSC'
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

    // Get token transfers
    const transfersResult = await getTokenTransfers(txHash);
    if (!transfersResult.success) {
      return {
        success: true,
        verified: false,
        status: 'no_transfers',
        error: 'No token transfers found in transaction'
      };
    }

    const normalizedRecipient = expectedRecipient.toLowerCase();

    // Find a matching USDT/USDC transfer to our wallet
    for (const transfer of transfersResult.transfers) {
      const contractAddress = transfer.contractAddress.toLowerCase();
      const isStablecoin = Object.values(STABLECOIN_CONTRACTS).includes(contractAddress);

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
