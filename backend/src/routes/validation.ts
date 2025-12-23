import { Router, Request, Response } from 'express';
import { validateForClient } from '../services/validation';

const router = Router();

/**
 * POST /validation/check
 * Validates a custom AI response
 */
router.post('/validation/check', (req: Request, res: Response) => {
  try {
    const { response: aiResponse } = req.body;

    if (!aiResponse) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing "response" field in request body',
      });
    }

    const validation = validateForClient(aiResponse);

    res.json({
      status: validation.success ? 'success' : 'failed',
      validated: validation.success,
      report: {
        structureValid: validation.validationReport?.isValid,
        contentSafe: validation.validationReport?.isSafe,
        violations: validation.validationReport?.violations.length || 0,
        criticalViolations: validation.validationReport?.violations.filter(v => v.severity === 'critical').length || 0,
        sanitized: (validation.validationReport?.modifications?.length || 0) > 0,
        modifications: validation.validationReport?.modifications || [],
      },
      violations: validation.validationReport?.violations || [],
      sanitizedData: validation.data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Validation error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
