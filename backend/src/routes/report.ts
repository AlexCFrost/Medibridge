import { Router, Request, Response } from 'express';
import { EXAMPLE_RESPONSE } from '../prompts/output-schema';
import { validateForClient } from '../services/validation';

const router = Router();

router.post('/analyze-report', (req: Request, res: Response) => {
  try {
    const aiResponse = EXAMPLE_RESPONSE;
    const validation = validateForClient(aiResponse);
    
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: validation.error,
        details: process.env.NODE_ENV === 'development' ? {
          validationReport: validation.validationReport,
          errors: validation.validationReport?.errors,
          warnings: validation.validationReport?.warnings,
        } : undefined,
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: validation.data,
      meta: {
        promptVersion: '1.0.0',
        validated: true,
        safetyChecks: {
          structureValidation: validation.validationReport?.isValid || false,
          contentSafety: validation.validationReport?.isSafe || false,
          violations: validation.validationReport?.violations.length || 0,
          sanitized: (validation.validationReport?.modifications?.length || 0) > 0,
        },
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
