export type TestStatus = 'within_range' | 'above_range' | 'below_range' | 'unknown';

export interface TerminologyDefinition {
  term: string;
  definition: string;
}

export interface TestInterpretation {
  testName: string;
  value: string;
  referenceRange: string | null;
  status: TestStatus;
  explanation: string;
  terminology: TerminologyDefinition[];
  context: string;
}

export interface ReportMetadata {
  patientName: string | null;
  reportDate: string | null;
  reportType: string;
  labName: string | null;
}

export interface AIReportInterpretation {
  reportMetadata: ReportMetadata;
  interpretations: TestInterpretation[];
  disclaimer: string;
  nextSteps: string;
}

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
  nextSteps: "Schedule a consultation with your healthcare provider to discuss these results in detail. Bring this report and any questions."
};

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
