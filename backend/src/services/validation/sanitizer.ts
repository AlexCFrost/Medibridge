import { ContentViolation } from './content-filter';

const SANITIZATION_RULES = {
  // Diagnostic language replacements
  diagnostic: [
    { pattern: /\b(you have|you are diagnosed with)\s+(\w+)/gi, replacement: 'This test evaluates $2 levels' },
    { pattern: /\bdiagnosis of\s+(\w+)/gi, replacement: 'evaluation of $1 parameters' },
    { pattern: /\bsuffering from\s+(\w+)/gi, replacement: 'with $1 values' },
    { pattern: /\bthis indicates\s+(\w+)/gi, replacement: 'this measures $1' },
    { pattern: /\bthis means you have\s+(\w+)/gi, replacement: 'this relates to $1' },
    { pattern: /\bpositive for\s+(\w+)/gi, replacement: 'detected $1' },
    { pattern: /\bconsistent with\s+(\w+)/gi, replacement: 'showing $1' },
  ],
  
  // Treatment recommendations
  treatment: [
    { pattern: /\byou should take\s+(\w+)/gi, replacement: 'your provider may discuss $1' },
    { pattern: /\brecommend taking\s+(\w+)/gi, replacement: 'providers may consider $1' },
    { pattern: /\bprescribe\s+(\w+)/gi, replacement: 'discuss $1 with your provider' },
    { pattern: /\btreatment is\s+(\w+)/gi, replacement: 'providers evaluate $1' },
    { pattern: /\bchange your diet/gi, replacement: 'discuss dietary options with your provider' },
    { pattern: /\bexercise more/gi, replacement: 'discuss activity levels with your provider' },
    { pattern: /\bconsult immediately/gi, replacement: 'consult your healthcare provider' },
    { pattern: /\bgo to ER/gi, replacement: 'contact your healthcare provider' },
  ],
  
  // Alarming language
  alarming: [
    { pattern: /\bdangerous/gi, replacement: 'outside typical range' },
    { pattern: /\bcritical/gi, replacement: 'significantly different' },
    { pattern: /\bsevere/gi, replacement: 'notably different' },
    { pattern: /\balarming/gi, replacement: 'noteworthy' },
    { pattern: /\blife-threatening/gi, replacement: 'requires medical evaluation' },
    { pattern: /\bserious concern/gi, replacement: 'worth discussing' },
    { pattern: /\burgent/gi, replacement: 'timely' },
    { pattern: /\bimmediately/gi, replacement: 'soon' },
    { pattern: /\bright away/gi, replacement: 'promptly' },
  ],
  
  // Dismissive language
  dismissive: [
    { pattern: /\bnothing to worry about/gi, replacement: 'worth discussing with your provider' },
    { pattern: /\bdon't worry/gi, replacement: 'discuss with your provider' },
    { pattern: /\bperfectly fine/gi, replacement: 'within expected range' },
    { pattern: /\bcompletely normal/gi, replacement: 'within reference range' },
    { pattern: /\bignore this/gi, replacement: 'discuss with your provider' },
    { pattern: /\bnot important/gi, replacement: 'your provider can explain' },
    { pattern: /\byou're healthy/gi, replacement: 'consult your provider' },
  ],
  
  // Medical advice
  medicalAdvice: [
    { pattern: /\byou must\s+(\w+)/gi, replacement: 'your provider will advise about $1' },
    { pattern: /\byou should\s+(\w+)/gi, replacement: 'your provider may discuss $1' },
    { pattern: /\byou need to\s+(\w+)/gi, replacement: 'providers evaluate the need for $1' },
    { pattern: /\bI recommend/gi, replacement: 'providers may consider' },
    { pattern: /\bI suggest/gi, replacement: 'providers may discuss' },
  ],
};

/**
 * Sanitize text by applying replacement rules
 */
export function sanitizeText(text: string): { sanitized: string; modified: boolean } {
  let sanitized = text;
  let modified = false;
  
  // Apply all sanitization rules
  Object.values(SANITIZATION_RULES).forEach(ruleSet => {
    ruleSet.forEach(rule => {
      const original = sanitized;
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
      if (original !== sanitized) {
        modified = true;
      }
    });
  });
  
  return { sanitized, modified };
}

/**
 * Sanitize structured AI response
 */
export function sanitizeAIResponse(response: any): { sanitized: any; modifications: string[] } {
  const modifications: string[] = [];
  const sanitized = JSON.parse(JSON.stringify(response)); // Deep clone
  
  // Sanitize disclaimer
  if (sanitized.disclaimer) {
    const result = sanitizeText(sanitized.disclaimer);
    if (result.modified) {
      sanitized.disclaimer = result.sanitized;
      modifications.push('disclaimer');
    }
  }
  
  // Sanitize next steps
  if (sanitized.nextSteps) {
    const result = sanitizeText(sanitized.nextSteps);
    if (result.modified) {
      sanitized.nextSteps = result.sanitized;
      modifications.push('nextSteps');
    }
  }
  
  // Sanitize interpretations
  if (Array.isArray(sanitized.interpretations)) {
    sanitized.interpretations.forEach((interp: any, index: number) => {
      // Sanitize explanation
      if (interp.explanation) {
        const result = sanitizeText(interp.explanation);
        if (result.modified) {
          interp.explanation = result.sanitized;
          modifications.push(`interpretations[${index}].explanation`);
        }
      }
      
      // Sanitize context
      if (interp.context) {
        const result = sanitizeText(interp.context);
        if (result.modified) {
          interp.context = result.sanitized;
          modifications.push(`interpretations[${index}].context`);
        }
      }
      
      // Sanitize terminology definitions
      if (Array.isArray(interp.terminology)) {
        interp.terminology.forEach((term: any, termIndex: number) => {
          if (term.definition) {
            const result = sanitizeText(term.definition);
            if (result.modified) {
              term.definition = result.sanitized;
              modifications.push(`interpretations[${index}].terminology[${termIndex}].definition`);
            }
          }
        });
      }
    });
  }
  
  return { sanitized, modifications };
}

/**
 * Replace entire unsafe fields with safe defaults
 */
export function replaceUnsafeFields(response: any, violations: ContentViolation[]): any {
  const sanitized = JSON.parse(JSON.stringify(response));
  const criticalLocations = new Set(
    violations
      .filter(v => v.severity === 'critical')
      .map(v => v.location.split('[')[0]) // Get top-level field
  );
  
  // If critical violations in disclaimer, use safe default
  if (criticalLocations.has('disclaimer')) {
    sanitized.disclaimer = 'This interpretation is for educational purposes only. It does not constitute medical advice, diagnosis, or treatment. Please discuss these results with your healthcare provider for proper medical interpretation and guidance.';
  }
  
  // If critical violations in next steps, use safe default
  if (criticalLocations.has('nextSteps')) {
    sanitized.nextSteps = 'Schedule a consultation with your healthcare provider to discuss these results in detail. Bring this report and any questions you have.';
  }
  
  // If critical violations in interpretations, remove those interpretations
  if (Array.isArray(sanitized.interpretations)) {
    const violationIndices = new Set(
      violations
        .filter(v => v.severity === 'critical' && v.location.startsWith('interpretations'))
        .map(v => {
          const match = v.location.match(/interpretations\[(\d+)\]/);
          return match ? parseInt(match[1]) : -1;
        })
        .filter(i => i >= 0)
    );
    
    if (violationIndices.size > 0) {
      sanitized.interpretations = sanitized.interpretations.filter(
        (_: any, index: number) => !violationIndices.has(index)
      );
    }
  }
  
  return sanitized;
}
