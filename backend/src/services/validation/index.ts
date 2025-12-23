/**
 * Validation Service
 * 
 * Provides defense-in-depth safety validation for AI responses.
 * This layer ensures that even if the AI model produces unsafe content,
 * it will be detected, sanitized, or blocked before reaching clients.
 */

export {
  detectViolations,
  scanAIResponse,
  hasCriticalViolations,
  groupViolationsByType,
  type ContentViolation,
} from './content-filter';

export {
  sanitizeText,
  sanitizeAIResponse,
  replaceUnsafeFields,
} from './sanitizer';

export {
  validateAIResponse,
  validateForClient,
  type ValidationResult,
} from './response-validator';
