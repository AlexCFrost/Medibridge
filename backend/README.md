# MediBridge Backend

REST API for medical report interpretation with AI-powered analysis

## Overview

The backend service provides a REST API endpoint that accepts medical report text and returns structured, patient-friendly interpretations. It includes a robust validation layer ensuring all responses are safe, structured, and educational.

## Features

- **Structured AI Prompts**: Consistent output schema for interpretations
- **Multi-Layer Validation**: Structure, content, and safety checks
- **Response Sanitization**: Removes prohibited content patterns
- **Content Filtering**: Prevents diagnostic or prescriptive language
- **Safety Rules**: Enforces mandatory disclaimers and healthcare provider direction
- **CORS Support**: Configured for frontend integration

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe development
- **Zod**: Schema validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

Configure environment variables:
```
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Build & Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts                    # Express server setup
├── prompts/
│   ├── output-schema.ts        # AI response TypeScript interface
│   ├── system-prompt.ts        # AI system instructions
│   └── safety-rules.ts         # Safety guidelines and rules
├── routes/
│   ├── report.ts               # POST /analyze-report endpoint
│   ├── health.ts               # GET /health endpoint
│   └── validation.ts           # Validation middleware
└── services/
    └── validation/
        ├── index.ts            # Main validation orchestrator
        ├── content-filter.ts   # Content safety checks
        ├── response-validator.ts # Schema validation
        └── sanitizer.ts        # Response sanitization
```

## API Endpoints

### POST /api/analyze-report

Analyzes medical report text and returns structured interpretation.

**Request:**
```json
{
  "reportText": "Complete Blood Count\nHemoglobin: 14.5 g/dL\n..."
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": {
    "reportMetadata": {
      "patientName": "John Doe",
      "reportDate": "2025-12-15",
      "reportType": "Complete Blood Count",
      "labName": "Quest Diagnostics"
    },
    "interpretations": [
      {
        "testName": "Hemoglobin",
        "value": "14.5 g/dL",
        "referenceRange": "13.5-17.5 g/dL",
        "status": "within_range",
        "explanation": "This test measures...",
        "terminology": [...],
        "context": "..."
      }
    ],
    "disclaimer": "This interpretation is for educational purposes only...",
    "nextSteps": "Schedule a consultation with your healthcare provider..."
  },
  "meta": {
    "promptVersion": "1.0.0",
    "validated": true,
    "safetyChecks": {
      "structureValidation": true,
      "contentSafety": true,
      "violations": 0,
      "sanitized": false
    }
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "details": {
    "validationReport": {...},
    "errors": [...],
    "warnings": [...]
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-24T10:00:00.000Z"
}
```

## Validation System

### Three-Layer Defense

1. **Structure Validation** (`response-validator.ts`)
   - Validates against TypeScript schema
   - Ensures all required fields present
   - Checks data types and formats

2. **Content Safety** (`content-filter.ts`)
   - Scans for prohibited patterns
   - Detects diagnostic language
   - Identifies prescriptive statements
   - Flags medical advice

3. **Sanitization** (`sanitizer.ts`)
   - Removes unsafe content
   - Adds mandatory disclaimers
   - Ensures healthcare provider direction

### Safety Rules

Defined in `safety-rules.ts`:
- Never provide diagnosis
- Never recommend treatments
- Never suggest medication changes
- Always include disclaimers
- Always direct to healthcare providers
- Focus on education, not evaluation

## Output Schema

All AI responses must conform to `AIReportInterpretation` interface:

```typescript
interface AIReportInterpretation {
  reportMetadata: ReportMetadata;
  interpretations: TestInterpretation[];
  disclaimer: string;
  nextSteps: string;
}
```

See `output-schema.ts` for complete type definitions.

## Development

### Adding New Validation Rules

1. Add pattern to `content-filter.ts`
2. Update safety rules in `safety-rules.ts`
3. Test with various inputs

### Modifying Output Schema

1. Update interface in `output-schema.ts`
2. Update validation in `response-validator.ts`
3. Update example response
4. Update frontend types

## Testing

```bash
npm test
```

## Error Handling

- 400: Bad Request (validation failures)
- 500: Internal Server Error (unexpected errors)

Development mode includes detailed error information.

## Security Considerations

For production deployment:
- Add rate limiting
- Implement authentication
- Add request logging
- Use environment-based secrets
- Enable HTTPS only
- Add input sanitization
- Implement CORS properly
- Add monitoring and alerts

## Contributing

Follow TypeScript best practices and maintain the defense-in-depth validation approach.
