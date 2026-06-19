import crypto from 'crypto';
import { logger } from '../../utils/logger';

interface AuditBlockData {
  blockIndex: number;
  complaintId: string;
  action: string;
  data: any;
  hash: string;
  previousHash: string;
  timestamp: Date;
  nonce: number;
}

/**
 * Create a SHA-256 hash for a block
 */
function calculateHash(block: Omit<AuditBlockData, 'hash'>): string {
  const blockString = JSON.stringify({
    blockIndex: block.blockIndex,
    complaintId: block.complaintId,
    action: block.action,
    data: block.data,
    previousHash: block.previousHash,
    timestamp: block.timestamp.toISOString(),
    nonce: block.nonce,
  });

  return crypto.createHash('sha256').update(blockString).digest('hex');
}

/**
 * Create the genesis block (first block in chain)
 */
export function createGenesisBlock(complaintId: string, data: any): AuditBlockData {
  const block: Omit<AuditBlockData, 'hash'> = {
    blockIndex: 0,
    complaintId,
    action: 'CREATED',
    data,
    previousHash: '0'.repeat(64),
    timestamp: new Date(),
    nonce: 0,
  };

  const hash = calculateHash(block);

  logger.info(`🔗 Genesis block created for complaint ${complaintId}: ${hash.substring(0, 16)}...`);

  return { ...block, hash };
}

/**
 * Create a new block in the chain
 */
export function createBlock(
  complaintId: string,
  action: string,
  data: any,
  previousBlock: AuditBlockData
): AuditBlockData {
  const block: Omit<AuditBlockData, 'hash'> = {
    blockIndex: previousBlock.blockIndex + 1,
    complaintId,
    action,
    data,
    previousHash: previousBlock.hash,
    timestamp: new Date(),
    nonce: Math.floor(Math.random() * 1000000),
  };

  const hash = calculateHash(block);

  logger.info(`🔗 Block #${block.blockIndex} created: ${action} → ${hash.substring(0, 16)}...`);

  return { ...block, hash };
}

/**
 * Verify the integrity of a chain of blocks
 */
export function verifyChain(blocks: AuditBlockData[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (blocks.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Verify genesis block
  if (blocks[0].previousHash !== '0'.repeat(64)) {
    errors.push('Genesis block has invalid previous hash');
  }

  // Verify each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Recalculate hash
    const expectedHash = calculateHash({
      blockIndex: block.blockIndex,
      complaintId: block.complaintId,
      action: block.action,
      data: block.data,
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      nonce: block.nonce,
    });

    if (block.hash !== expectedHash) {
      errors.push(`Block #${i} has been tampered with (hash mismatch)`);
    }

    // Verify chain link (except genesis)
    if (i > 0 && block.previousHash !== blocks[i - 1].hash) {
      errors.push(`Block #${i} has invalid previous hash link`);
    }

    // Verify sequential index
    if (block.blockIndex !== i) {
      errors.push(`Block #${i} has incorrect index (expected ${i}, got ${block.blockIndex})`);
    }
  }

  const isValid = errors.length === 0;
  if (isValid) {
    logger.info(`✅ Chain verified: ${blocks.length} blocks, all valid`);
  } else {
    logger.error(`❌ Chain verification failed: ${errors.length} errors`);
  }

  return { isValid, errors };
}

/**
 * Format audit trail for display
 */
export function formatAuditTrail(blocks: AuditBlockData[]): Array<{
  index: number;
  action: string;
  description: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  verified: boolean;
}> {
  const verification = verifyChain(blocks);

  return blocks.map((block, i) => ({
    index: block.blockIndex,
    action: block.action,
    description: getActionDescription(block.action, block.data),
    hash: block.hash,
    previousHash: block.previousHash,
    timestamp: block.timestamp.toISOString(),
    verified: !verification.errors.some(e => e.includes(`Block #${i}`)),
  }));
}

function getActionDescription(action: string, data: any): string {
  switch (action) {
    case 'CREATED': return `Complaint created: "${data.title || 'New complaint'}"`;
    case 'UPDATED': return `Complaint details updated`;
    case 'STATUS_CHANGED': return `Status changed to: ${data.newStatus || 'Unknown'}`;
    case 'ASSIGNED': return `Assigned to: ${data.department || data.officer || 'Unknown'}`;
    case 'ESCALATED': return `Escalated to higher authority: ${data.reason || ''}`;
    case 'RESOLVED': return `Complaint resolved: ${data.resolution || ''}`;
    case 'CLOSED': return `Complaint closed`;
    case 'COMMENT_ADDED': return `Comment added: "${(data.comment || '').substring(0, 50)}..."`;
    case 'DUPLICATE_LINKED': return `Linked as duplicate of: ${data.originalId || 'Unknown'}`;
    default: return `Action: ${action}`;
  }
}
