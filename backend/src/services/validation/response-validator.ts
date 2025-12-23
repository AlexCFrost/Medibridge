/**
 * Response Validator
 * 
 * Validates AI responses for structure, safety, and compliance.
 * Implements multiple validation layers before returning data to clients.
 */

import { isValidInterpretation, AIReportInterpretation } from '../../prompts/output-schema';
import { scanAIResponse, hasCriticalViolations, ContentViolation, groupViolationsByType } from './content-filter';
import { sanitizeAIResponse, replaceUnsafeFields } from './sanitizer';

export interface ValidationResult {
  isValid: boolean;
  isSafe: boolean;
  violations: ContentViolation[];
  errors: string[];
  warnings: string[];
  sanitized?: any;
  modifications?: string[];
}

/**
 * Validate response structure
 */
function validateStructure(response: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check if valid JSON structure
  if (!response || typeof response !== 'object') {
    errors.push('Response is not a valid object');
    return { isValid: false, errors };
  }
  
  // Check required fields
  if (!response.reportMetadata) {
    errors.push('Missing reportMetadata field');
  }
  
  if (!Array.isArray(response.interpretations)) {
    errors.push('Missing or invalid interpretations array');
  } else if (response.interpretations.length === 0) {
    errors.push('Interpretations array is empty');
  }
  
  if (!response.disclaimer || typeof response.disclaimer !== 'string' || response.disclaimer.length === 0) {
    errors.push('Missing or invalid disclaimer');
  }
  
  if (!response.nextSteps || typeof response.nextSteps !== 'string' || response.nextSteps.length === 0) {
    errors.push('Missing or invalid nextSteps');
  }
  
  // Validate each interpretation
  if (Array.isArray(response.interpretations)) {
    response.interpretations.forEach((interp: any, index: number) => {
      if (!interp.testName) {
        errors.push(`Interpretation ${index}: missing testName`);
      }
      if (!interp.value) {
        errors.push(`Interpretation ${index}: missing value`);
      }
      if (!interp.status) {
        errors.push(`Interpretation ${index}: missing status`);
      }
      if (!interp.explanation) {
        errors.push(`Interpretation ${index}: missing explanation`);
      }
      if (!Array.isArray(interp.terminology)) {
        errors.push(`Interpretation ${index}: missing or invalid terminology array`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required disclaimer content
 */
function validateDisclaimer(disclaimer: string): string[] {
  const warnings: string[] = [];
  
  const requiredPhrases = [
    'educational purposes',
    'not constitute medical advice',
    'healthcare provider',
  ];
  
  requiredPhrases.forEach(phrase => {
    if (!disclaimer.toLowerCase().includes(phrase.toLowerCase())) {
      warnings.push(`Disclaimer missing required phrase: "${phrase}"`);
    }
  });
  
  return warnings;
}

/**
 * Validate next steps content
 */
function validateNextSteps(nextSteps: string): string[] {
  const warnings: string[] = [];
  
  const requiredElements = [
    /healthcare provider|doctor|physician/i,
    /discuss|consult|talk/i,
  ];
  
  requiredElements.forEach((pattern, index) => {
    if (!pattern.test(nextSteps)) {
      warnings.push(`Next steps missing required element: pattern ${index + 1}`);
    }
  });
  
  return warnings;
}

/**
 * Main validation function - validates and sanitizes AI response
 */
export function validateAIResponse(response: any, options: {
  strictMode?: boolean;
  autoSanitize?: boolean;
} = {}): ValidationResult {
  const { strictMode = true, autoSanitize = true } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Step 1: Validate structure
  const structureValidation = validateStructure(response);
  errors.push(...structureValidation.errors);
  
  if (!structureValidation.isValid && strictMode) {
    return {
      isValid: false,
      isSafe: false,
      violations: [],
      errors,
      warnings,
    };
  }
  
  // Step 2: Validate disclaimer and next steps
  if (response.disclaimer) {
    warnings.push(...validateDisclaimer(response.disclaimer));
  }
  
  if (response.nextSteps) {
    warnings.push(...validateNextSteps(response.nextSteps));
  }
  
  // Step 3: Scan for safety violations
  const violations = scanAIResponse(response);
  const hasCritical = hasCriticalViolations(violations);
  
  // Log violations for monitoring
  if (violations.length > 0) {
    const grouped = groupViolationsByType(violations);
    Object.entries(grouped).forEach(([type, viols]) => {
      warnings.push(`Found ${viols.length} ${type} violation(s)`);
    });
  }
  
  // Step 4: Sanitize if violations found and auto-sanitize enabled
  let sanitized = response;
  let modifications: string[] = [];
  
  if (violations.length > 0 && autoSanitize) {
    if (hasCritical) {
      // For critical violations, replace entire fields with safe defaults
      sanitized = replaceUnsafeFields(response, violations);
      modifications.push('Replaced fields with critical violations');
    } else {
      // For non-critical violations, attempt text-level sanitization
      const sanitizeResult = sanitizeAIResponse(response);
      sanitized = sanitizeResult.sanitized;
      modifications = sanitizeResult.modifications;
    }
    
    // Re-scan sanitized response to verify safety
    const remainingViolations = scanAIResponse(sanitized);
    if (hasCriticalViolations(remainingViolations)) {
      errors.push('Sanitization failed to remove all critical violations');
    }
  }
  
  // Determine final validation status
  const isValid = structureValidation.isValid && (strictMode ? violations.length === 0 : !hasCritical);
  const isSafe = !hasCritical || (autoSanitize && modifications.length > 0);
  
  return {
    isValid,
    isSafe,
    violations,
    errors,
    warnings,
    sanitized: autoSanitize ? sanitized : undefined,
    modifications: autoSanitize ? modifications : undefined,
  };
}

/**
 * Validate and prepare response for client
 * This is the main entry point for the validation pipeline
 */
export function validateForClient(response: any): {
  success: boolean;
  data?: any;
  error?: string;
  validationReport?: ValidationResult;
} {
  const validation = validateAIResponse(response, {
    strictMode: false,
    autoSanitize: true,
  });
  
  if (!validation.isSafe) {
    return {
      success: false,
      error: 'Response failed safety validation',
      validationReport: validation,
    };
  }
  
  if (!validation.isValid) {
    return {
      success: false,
      error: 'Response structure validation failed',
      validationReport: validation,
    };
  }
  
  return {
    success: true,
    data: validation.sanitized || response,
    validationReport: validation,
  };
}
