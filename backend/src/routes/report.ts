import { Router, Request, Response } from 'express';

const router = Router();

router.post('/analyze-report', (req: Request, res: Response) => {
  // Mock response - AI integration not yet implemented
  res.status(200).json({
    status: 'mock',
    message: 'This is a placeholder response. AI model integration is not yet connected.',
    data: {
      reportId: 'mock-' + Date.now(),
      analysis: {
        summary: 'Sample medical report analysis (mocked)',
        keyFindings: [
          'Finding 1: This is placeholder data',
          'Finding 2: AI model not yet integrated',
          'Finding 3: Returns static mock response'
        ],
        recommendations: [
          'Recommendation 1: Placeholder recommendation',
          'Recommendation 2: No real analysis performed yet'
        ],
        riskLevel: 'low',
        confidence: 0.0
      },
      processed: true,
      processedAt: new Date().toISOString()
    },
    warning: 'AI functionality not implemented - this is mock data only'
  });
});

export default router;
