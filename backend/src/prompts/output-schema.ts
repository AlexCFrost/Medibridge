/**
 * MediBridge AI Output Schema
 * 
 * Defines the expected structure of AI responses for medical report interpretation.
 * This schema enforces consistency, completeness, and structured data for validation.
 */

/**
 * Status of a test result relative to reference ranges
 */
export type TestStatus = 'within_range' | 'above_range' | 'below_range' | 'unknown';

/**
 * Medical terminology definition
 */
export interface TerminologyDefinition {
  /** The medical term or abbreviation */
  term: string;
  /** Simple, patient-friendly explanation */
  definition: string;
}

/**
 * Individual test parameter interpretation
 */
export interface TestInterpretation {
  /** Name of the test parameter (e.g., "Hemoglobin A1C", "Total Cholesterol") */
  testName: string;
  
  /** Measured value with units (e.g., "6.5%", "200 mg/dL") */
  value: string;
  
  /** Reference range if provided in report (e.g., "4.0-5.6%", "< 200 mg/dL") */
  referenceRange: string | null;
  
  /** Status relative to reference range */
  status: TestStatus;
  
  /** Plain language explanation of what this test measures (NOT what it diagnoses) */
  explanation: string;
  
  /** Medical terms used in this test with simple definitions */
  terminology: TerminologyDefinition[];
  
  /** General context about why this test matters and what it evaluates (WITHOUT diagnosis) */
  context: string;
}

/**
 * Metadata extracted from the report
 */
export interface ReportMetadata {
  /** Patient name if present in report, otherwise null */
  patientName: string | null;
  
  /** Date of the report if present, otherwise null */
  reportDate: string | null;
  
  /** Type/category of the test report (e.g., "Complete Blood Count", "Lipid Panel") */
  reportType: string;
  
  /** Laboratory name if present in report, otherwise null */
  labName: string | null;
}

/**
 * Complete AI response structure
 * 
 * This is the mandatory output format for all medical report interpretations.
 */
export interface AIReportInterpretation {
  /** Extracted metadata from the report */
  reportMetadata: ReportMetadata;
  
  /** Array of individual test interpretations */
  interpretations: TestInterpretation[];
  
  /** Required safety disclaimer (MUST be present in every response) */
  disclaimer: string;
  
  /** Guidance on next steps (MUST direct to healthcare provider) */
  nextSteps: string;
}

/**
 * Example response for validation and testing
 */
export const EXAMPLE_RESPONSE: AIReportInterpretation = {
  reportMetadata: {
    patientName: "John Doe",
    reportDate: "2025-12-15",
    reportType: "Complete Metabolic Panel",
    labName: "Quest Diagnostics"
  },
  interpretations: [
    {
      testName: "Glucose",
      value: "110 mg/dL",
      referenceRange: "70-100 mg/dL",
      status: "above_range",
      explanation: "This test measures the amount of glucose (a type of sugar) in your blood at the time the sample was taken.",
      terminology: [
        {
          term: "Glucose",
          definition: "A simple sugar that your body uses for energy"
        },
        {
          term: "mg/dL",
          definition: "Milligrams per deciliter, a unit of measurement for concentration"
        }
      ],
      context: "Blood glucose levels help healthcare providers understand how your body processes sugar. This value is above the reference range, which means it's higher than typical. Your healthcare provider will interpret this in the context of your overall health, when you last ate, and other factors."
    }
  ],
  disclaimer: "This interpretation is for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Please discuss these results with your healthcare provider for proper medical interpretation and guidance.",
  nextSteps: "Schedule a consultation with your healthcare provider to discuss these results in detail. Bring this report and any questions you have."
};

/**
 * Schema validation helper type guards
 */
export const isValidTestStatus = (status: string): status is TestStatus => {
  return ['within_range', 'above_range', 'below_range', 'unknown'].includes(status);
};

export const isValidInterpretation = (data: any): data is AIReportInterpretation => {
  return (
    data &&
    typeof data === 'object' &&
    data.reportMetadata &&
    Array.isArray(data.interpretations) &&
    typeof data.disclaimer === 'string' &&
    typeof data.nextSteps === 'string' &&
    data.disclaimer.length > 0 &&
    data.nextSteps.length > 0
  );
};

export default AIReportInterpretation;
