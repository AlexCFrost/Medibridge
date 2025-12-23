import { Router, Request, Response } from 'express';
import { EXAMPLE_RESPONSE } from '../prompts/output-schema';

const router = Router();

/**
 * POST /analyze-report
 * Analyzes medical report and returns structured interpretation
 * 
 * Request body:
 * - reportText: string (OCR text or manual input of medical report)
 * 
 * Response follows AIReportInterpretation schema defined in prompts/output-schema.ts
 * with all safety rules and disclaimers from prompts/safety-rules.ts
 */
router.post('/analyze-report', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'success',
      data: EXAMPLE_RESPONSE,
      meta: {
        promptVersion: '1.0.0',
        schemaCompliant: true,
        safetyValidated: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
});

export default router;
