# MediBridge

Bridging medical reports and patient understanding

## Overview

MediBridge is a privacy-first AI application that translates complex medical reports into clear, patient-friendly explanations. It is designed to reduce anxiety, improve medical literacy, and help patients prepare meaningful questions for their next doctor appointment—without providing diagnoses or medical advice.

The system focuses on clarity, safety, and trust, ensuring that medical decisions remain strictly between patients and qualified healthcare professionals.

## Features

- **Plain Language Explanations**: Converts medical jargon into easy-to-understand terms
- **Interactive Glossary**: Hover over medical terms to see instant definitions
- **Visual Range Indicators**: See where your test results fall within reference ranges
- **Structured Interpretation**: Organized breakdown of test results with context
- **Safety-First Design**: Built-in validation layers and mandatory disclaimers
- **No Diagnosis**: Strictly educational, always directs users to healthcare providers

## Architecture

MediBridge consists of two main components:

### Backend (Node.js + Express + TypeScript)
- REST API endpoint for report analysis
- Structured AI prompt system with safety rules
- Multi-layer validation (structure, content, safety)
- Response sanitization and content filtering

### Frontend (Next.js + React + TypeScript)
- Clean, accessible user interface
- Interactive tooltips for medical terminology
- Visual data representation with Recharts
- Responsive design for mobile and desktop

## Tech Stack

**Backend:**
- Node.js
- Express.js
- TypeScript
- Zod (schema validation)

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Recharts (data visualization)

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
pnpm dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Paste your medical report text into the input field
3. Click "Simplify Report" to generate an explanation
4. Review the structured interpretation with:
   - Visual summary chart
   - Individual test explanations
   - Interactive medical terminology
   - Reference range visualizations
5. Always consult with your healthcare provider about results

## Project Structure

```
medibridge/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Express server setup
│   │   ├── prompts/
│   │   │   ├── output-schema.ts     # AI response structure
│   │   │   ├── system-prompt.ts     # AI instructions
│   │   │   └── safety-rules.ts      # Safety guidelines
│   │   ├── routes/
│   │   │   ├── report.ts            # Report analysis endpoint
│   │   │   └── health.ts            # Health check endpoint
│   │   └── services/
│   │       └── validation/          # Validation layer
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ReportDisplay.tsx    # Main report view
│   │   │   ├── Tooltip.tsx          # Glossary tooltips
│   │   │   ├── RangeIndicator.tsx   # Range visualization
│   │   │   └── TestSummaryChart.tsx # Chart component
│   │   ├── utils/
│   │   │   ├── numericExtraction.ts # Value parsing
│   │   │   └── chartDataPreparation.ts # Data transformation
│   │   ├── page.tsx                 # Home page
│   │   └── layout.tsx               # App layout
│   └── package.json
└── README.md
```

## API Endpoints

### POST /api/analyze-report

Analyzes medical report text and returns structured interpretation.

**Request Body:**
```json
{
  "reportText": "Your medical report text here..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "reportMetadata": {
      "patientName": "John Doe",
      "reportDate": "2025-12-15",
      "reportType": "Complete Metabolic Panel",
      "labName": "Quest Diagnostics"
    },
    "interpretations": [...],
    "disclaimer": "...",
    "nextSteps": "..."
  },
  "meta": {
    "promptVersion": "1.0.0",
    "validated": true,
    "safetyChecks": {...}
  }
}
```

## Safety & Privacy

- **No Medical Advice**: All outputs include mandatory disclaimers
- **No Diagnosis**: System never makes diagnostic statements
- **Validation Layers**: Multi-stage content and safety validation
- **Privacy-First**: No data storage or external API calls in demo mode
- **Healthcare Provider Direction**: Always guides users to consult professionals

## Development

### Running Tests

Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
pnpm test
```

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
pnpm build
pnpm start
```

## Contributing

This is a demonstration project. For production use, additional considerations include:
- Integration with real AI services (OpenAI, Anthropic, etc.)
- User authentication and authorization
- Data encryption and secure storage
- HIPAA compliance measures
- Rate limiting and abuse prevention
- Comprehensive error handling
- Monitoring and logging

## License

MIT License - See LICENSE file for details

## Disclaimer

MediBridge is an educational tool and demonstration project. It is NOT a medical device and does NOT provide medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical interpretation of laboratory results and health concerns.
