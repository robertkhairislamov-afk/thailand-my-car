/**
 * Anti-fraud middleware for investment protection
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const pool = require('../config/database');

// Secret for integrity hash (should be in env)
const INTEGRITY_SECRET = process.env.INTEGRITY_SECRET || 'thailand-my-car-integrity-2025';

/**
 * Rate limiter for investment submissions
 * Max 5 investment submissions per IP per hour
 */
const investmentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: {
    error: 'Too many investment submissions. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP + wallet address as key
    const wallet = req.body?.walletAddress?.toLowerCase() || '';
    return `${req.ip}-${wallet}`;
  }
});

/**
 * Rate limiter for wallet-specific submissions
 * Max 3 pending investments per wallet
 */
const walletLimiter = async (req, res, next) => {
  try {
    const walletAddress = req.body?.walletAddress?.toLowerCase();
    if (!walletAddress) {
      return next();
    }

    // Check pending investments for this wallet
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM investments
       WHERE wallet_address = $1
       AND status IN ('pending', 'pending_confirmation')`,
      [walletAddress]
    );

    const pendingCount = parseInt(result.rows[0].count);
    if (pendingCount >= 3) {
      return res.status(429).json({
        error: 'You have too many pending investments. Please wait for verification.',
        code: 'WALLET_LIMIT_EXCEEDED',
        pendingCount
      });
    }

    next();
  } catch (error) {
    console.error('Wallet limiter error:', error);
    next(); // Continue on error
  }
};

/**
 * Honeypot validator
 * Bots often fill hidden fields
 */
const honeypotValidator = (req, res, next) => {
  // Check for honeypot fields that should be empty
  const honeypotFields = ['website', 'url', 'phone2', 'email2', '_hp_field'];

  for (const field of honeypotFields) {
    if (req.body[field]) {
      console.log(`Honeypot triggered: ${field} = ${req.body[field]}`);
      // Don't reveal that honeypot was triggered - just reject silently
      return res.status(400).json({
        error: 'Invalid submission',
        code: 'VALIDATION_ERROR'
      });
    }
  }

  next();
};

/**
 * Timing validator
 * Legitimate users take at least 10 seconds to fill form
 */
const timingValidator = (req, res, next) => {
  const formStartTime = req.body._formStartTime;

  if (formStartTime) {
    const startTime = parseInt(formStartTime);
    const now = Date.now();
    const elapsedSeconds = (now - startTime) / 1000;

    // If form was submitted in less than 5 seconds, likely a bot
    if (elapsedSeconds < 5) {
      console.log(`Timing validation failed: ${elapsedSeconds}s`);
      return res.status(400).json({
        error: 'Please take your time to review the form',
        code: 'TIMING_ERROR'
      });
    }

    // Attach timing info for logging (round to integer for DB)
    req.formTiming = { elapsedSeconds: Math.round(elapsedSeconds) };
  }

  next();
};

/**
 * Duplicate TX hash detector
 */
const duplicateTxDetector = async (req, res, next) => {
  try {
    const txHash = req.body?.txHash?.toLowerCase();

    if (!txHash) {
      return next();
    }

    // Check if this TX hash was already used
    const result = await pool.query(
      `SELECT id, wallet_address, status FROM investments WHERE tx_hash = $1`,
      [txHash]
    );

    if (result.rows.length > 0) {
      const existing = result.rows[0];
      console.log(`Duplicate TX detected: ${txHash} for wallet ${existing.wallet_address}`);

      return res.status(400).json({
        error: 'This transaction has already been submitted',
        code: 'DUPLICATE_TX',
        existingStatus: existing.status
      });
    }

    next();
  } catch (error) {
    console.error('Duplicate TX detector error:', error);
    next();
  }
};

/**
 * Generate integrity hash for investment data
 * This hash is stored and can be used to verify data wasn't tampered
 */
function generateIntegrityHash(data) {
  const {
    walletAddress,
    tierId,
    amountUsdt,
    txHash,
    timestamp
  } = data;

  const payload = JSON.stringify({
    w: walletAddress?.toLowerCase(),
    t: tierId,
    a: amountUsdt,
    tx: txHash?.toLowerCase() || '',
    ts: timestamp
  });

  const hash = crypto
    .createHmac('sha256', INTEGRITY_SECRET)
    .update(payload)
    .digest('hex');

  return hash;
}

/**
 * Verify integrity hash
 */
function verifyIntegrityHash(data, hash) {
  const computedHash = generateIntegrityHash(data);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(hash)
  );
}

/**
 * Add integrity hash to request
 */
const addIntegrityHash = (req, res, next) => {
  const timestamp = Date.now();

  const integrityData = {
    walletAddress: req.body.walletAddress,
    tierId: req.body.tierId,
    amountUsdt: req.body.amountUsdt,
    txHash: req.body.txHash,
    timestamp
  };

  req.integrityHash = generateIntegrityHash(integrityData);
  req.integrityTimestamp = timestamp;

  next();
};

/**
 * Log suspicious activity
 */
async function logSuspiciousActivity(type, details, req) {
  try {
    await pool.query(
      `INSERT INTO fraud_logs (type, details, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [type, JSON.stringify(details), req.ip, req.get('user-agent')]
    );
  } catch (error) {
    console.error('Failed to log suspicious activity:', error);
  }
}

/**
 * Combined anti-fraud middleware
 */
const antiFraudMiddleware = [
  honeypotValidator,
  timingValidator,
  investmentRateLimiter,
  walletLimiter,
  duplicateTxDetector,
  addIntegrityHash
];

module.exports = {
  investmentRateLimiter,
  walletLimiter,
  honeypotValidator,
  timingValidator,
  duplicateTxDetector,
  generateIntegrityHash,
  verifyIntegrityHash,
  addIntegrityHash,
  logSuspiciousActivity,
  antiFraudMiddleware
};
