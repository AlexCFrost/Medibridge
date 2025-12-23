/**
 * MediBridge Prompts Module
 * 
 * Central export point for all prompt-related configurations and utilities.
 */

export { SYSTEM_PROMPT } from './system-prompt';
export { SAFETY_RULES } from './safety-rules';
export type { ValidationResult } from './safety-rules';
export type {
  AIReportInterpretation,
  TestInterpretation,
  TestStatus,
  ReportMetadata,
  TerminologyDefinition,
} from './output-schema';
export { EXAMPLE_RESPONSE, isValidInterpretation, isValidTestStatus } from './output-schema';
