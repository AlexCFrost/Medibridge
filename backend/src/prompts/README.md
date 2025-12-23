# MediBridge Prompt System Documentation

## Overview

This directory contains the core prompt engineering and safety configuration for the MediBridge AI system. The design prioritizes patient safety, regulatory compliance, and responsible AI behavior.

## Files

### `system-prompt.ts`
The main system prompt that defines AI behavior, constraints, and output requirements. This is the primary instruction set sent to the AI model.

**Key Components:**
- Core mission statement
- 5 strict safety rules (non-diagnostic, no medical advice, neutral tone, etc.)
- Required JSON output structure
- Response guidelines and examples
- Edge case handling

### `safety-rules.ts`
Comprehensive documentation of prohibited actions, language constraints, and validation rules.

**Key Components:**
- Prohibited actions list (10 critical restrictions)
- Required disclaimers
- Forbidden vs. preferred language patterns
- Content validation rules
- Regulatory compliance notes
- Ethical principles

### `output-schema.ts`
TypeScript type definitions for the structured AI response format.

**Key Components:**
- `AIReportInterpretation` interface (main response type)
- `TestInterpretation` interface (individual test results)
- `ReportMetadata` interface (report header info)
- Type guards and validation helpers
- Example response for testing

## Design Principles

### 1. **Safety First**
Every aspect of the prompt is designed to prevent harm:
- No diagnostic language
- No disease naming
- No medical advice
- Neutral, non-alarming tone

### 2. **Transparency**
Users must understand the system's limitations:
- Clear disclaimers required
- Explicit non-diagnostic framing
- Direction to healthcare providers

### 3. **Structured Output**
Enforced JSON schema ensures:
- Consistent response format
- Parseable, validatable data
- Clear separation of facts from context

### 4. **Educational Focus**
The AI empowers patients to:
- Understand medical terminology
- Ask informed questions
- Have better provider conversations

## Usage

### In AI Service Layer
```typescript
import SYSTEM_PROMPT from './prompts/system-prompt';
import { AIReportInterpretation } from './prompts/output-schema';

// Send to AI model
const response = await aiModel.generate({
  systemPrompt: SYSTEM_PROMPT,
  userMessage: reportText,
});

// Validate response structure
const parsed: AIReportInterpretation = JSON.parse(response);
```

### In Validation Layer
```typescript
import { SAFETY_RULES } from './prompts/safety-rules';
import { isValidInterpretation } from './prompts/output-schema';

// Validate output format
if (!isValidInterpretation(response)) {
  throw new Error('Invalid AI response structure');
}

// Check for safety violations
const violations = checkSafetyRules(response, SAFETY_RULES);
```

## Safety Rule Enforcement

The system uses a **defense-in-depth** approach:

1. **System Prompt** - Primary instruction to AI model
2. **Output Schema** - Structured format enforcement
3. **Validation Layer** - Post-generation content checks
4. **Response Filtering** - Final safety gate before user

## Prohibited Language Examples

❌ **Never Use:**
- "You have diabetes"
- "This indicates kidney disease"
- "This is dangerously high"
- "Nothing to worry about"
- "You should see a doctor immediately"

✅ **Always Use:**
- "This test measures blood glucose levels"
- "This value is above the reference range"
- "Your healthcare provider can explain"
- "Discuss with your doctor"

## Compliance Notes

### HIPAA
- No patient data storage
- Ephemeral processing only
- No PHI retention

### FDA
- Not a medical device
- Educational tool only
- No clinical decision-making

### Medical Ethics
- Non-maleficence (do no harm)
- Transparency about limitations
- Professional deference to providers

## Maintenance Guidelines

### When Updating Prompts:
1. **Document Changes**: Update this README with rationale
2. **Safety Review**: Ensure new language doesn't violate safety rules
3. **Test Cases**: Add examples to validation suite
4. **Version Control**: Tag prompt versions for auditing

### Testing New Prompts:
1. Test with edge cases (missing data, unclear values)
2. Verify JSON output validity
3. Check for prohibited language
4. Validate disclaimer presence
5. Review with medical/legal advisors

## Future Enhancements

- [ ] Multi-language support (translated prompts)
- [ ] Test-type specific prompts (blood, imaging, etc.)
- [ ] Advanced validation with NLP-based safety checks
- [ ] Prompt versioning and A/B testing framework
- [ ] Automated compliance checking

## Questions or Concerns?

This prompt system is designed to be reviewed by:
- Medical professionals
- Legal/compliance teams
- AI ethics experts
- Patient advocacy groups

Safety is paramount. When in doubt, err on the side of caution.
