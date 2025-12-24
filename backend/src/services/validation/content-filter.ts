export interface ContentViolation {
  type: 'diagnostic' | 'treatment' | 'disease_name' | 'alarming' | 'dismissive' | 'medical_advice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  match: string;
  context: string;
  location: string;
}

const FORBIDDEN_PATTERNS = {
  diagnostic: [
    /\b(you have|you are diagnosed with|diagnosis of|suffering from|condition of)\b/gi,
    /\b(this indicates|this means you have|this suggests you have)\b/gi,
    /\b(positive for|negative for|consistent with)\b/gi,
  ],
  
  diseaseNames: [
    /\b(diabetes|diabetic|prediabetes)\b/gi,
    /\b(cancer|carcinoma|tumor|malignancy)\b/gi,
    /\b(kidney disease|renal failure|nephropathy)\b/gi,
    /\b(heart disease|cardiac|cardiovascular disease)\b/gi,
    /\b(liver disease|hepatitis|cirrhosis)\b/gi,
    /\b(infection|bacterial|viral|sepsis)\b/gi,
    /\b(anemia|anemic)\b/gi,
    /\b(hypertension|hypotension)\b/gi,
    /\b(thyroid disorder|hypothyroid|hyperthyroid)\b/gi,
    /\b(syndrome|disease|disorder|condition)\s+(of|affecting)/gi,
  ],
  
  treatment: [
    /\b(you should take|recommend taking|prescribe|medication)\b/gi,
    /\b(treatment|therapy|intervention|procedure)\s+(is|would be)\b/gi,
    /\b(change your diet|exercise more|lose weight|stop smoking)\b/gi,
    /\b(consult immediately|go to ER|seek urgent care)\b/gi,
  ],
  
  alarming: [
    /\b(dangerous|critical|severe|alarming|emergency)\b/gi,
    /\b(life-threatening|serious concern|major problem)\b/gi,
    /\b(urgent|immediately|right away|as soon as possible)\b/gi,
  ],
  
  dismissive: [
    /\b(nothing to worry about|don't worry|perfectly fine|completely normal)\b/gi,
    /\b(ignore this|not important|no concern|no need to)\b/gi,
    /\b(you're healthy|everything is fine|all good)\b/gi,
  ],
  
  medicalAdvice: [
    /\b(you must|you should|you need to)\b/gi,
    /\b(it is recommended that you|I recommend|I suggest)\b/gi,
  ],
};

/**
 * Scan text content for forbidden patterns
 */
export function detectViolations(text: string, location: string = 'response'): ContentViolation[] {
  const violations: ContentViolation[] = [];
  
  // Check diagnostic language
  FORBIDDEN_PATTERNS.diagnostic.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'diagnostic',
        severity: 'critical',
        match: match[0],
        context: extractContext(text, match.index!),
        location,
      });
    }
  });
  
  // Check disease names
  FORBIDDEN_PATTERNS.diseaseNames.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'disease_name',
        severity: 'critical',
        match: match[0],
        context: extractContext(text, match.index!),
        location,
      });
    }
  });
  
  // Check treatment recommendations
  FORBIDDEN_PATTERNS.treatment.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'treatment',
        severity: 'critical',
        match: match[0],
        context: extractContext(text, match.index!),
        location,
      });
    }
  });
  
  // Check alarming language
  FORBIDDEN_PATTERNS.alarming.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'alarming',
        severity: 'high',
        match: match[0],
        context: extractContext(text, match.index!),
        location,
      });
    }
  });
  
  // Check dismissive language
  FORBIDDEN_PATTERNS.dismissive.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'dismissive',
        severity: 'high',
        match: match[0],
        context: extractContext(text, match.index!),
        location,
      });
    }
  });
  
  // Check medical advice
  FORBIDDEN_PATTERNS.medicalAdvice.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      violations.push({
        type: 'medical_advice',
        severity: 'high',
        match: match[0],
        context: extractContext(text, match.index!),
        location,
      });
    }
  });
  
  return violations;
}

/**
 * Extract surrounding context for a match
 */
function extractContext(text: string, index: number, contextLength: number = 50): string {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + contextLength);
  return '...' + text.slice(start, end) + '...';
}

/**
 * Scan structured AI response for violations
 */
export function scanAIResponse(response: any): ContentViolation[] {
  const violations: ContentViolation[] = [];
  
  if (!response || typeof response !== 'object') {
    return violations;
  }
  
  // Check disclaimer
  if (response.disclaimer) {
    violations.push(...detectViolations(response.disclaimer, 'disclaimer'));
  }
  
  // Check next steps
  if (response.nextSteps) {
    violations.push(...detectViolations(response.nextSteps, 'nextSteps'));
  }
  
  // Check interpretations
  if (Array.isArray(response.interpretations)) {
    response.interpretations.forEach((interp: any, index: number) => {
      if (interp.explanation) {
        violations.push(...detectViolations(interp.explanation, `interpretations[${index}].explanation`));
      }
      if (interp.context) {
        violations.push(...detectViolations(interp.context, `interpretations[${index}].context`));
      }
      if (Array.isArray(interp.terminology)) {
        interp.terminology.forEach((term: any, termIndex: number) => {
          if (term.definition) {
            violations.push(...detectViolations(term.definition, `interpretations[${index}].terminology[${termIndex}].definition`));
          }
        });
      }
    });
  }
  
  return violations;
}

/**
 * Check if violations include critical severity
 */
export function hasCriticalViolations(violations: ContentViolation[]): boolean {
  return violations.some(v => v.severity === 'critical');
}

/**
 * Group violations by type
 */
export function groupViolationsByType(violations: ContentViolation[]): Record<string, ContentViolation[]> {
  return violations.reduce((acc, violation) => {
    if (!acc[violation.type]) {
      acc[violation.type] = [];
    }
    acc[violation.type].push(violation);
    return acc;
  }, {} as Record<string, ContentViolation[]>);
}
