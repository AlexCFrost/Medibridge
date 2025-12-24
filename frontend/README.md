# MediBridge Frontend

Patient-friendly medical report interface built with Next.js

## Overview

This is the frontend application for MediBridge, providing an intuitive interface for users to input medical reports and receive clear, structured explanations with interactive visualizations.

## Features

- **Clean Input Interface**: Simple text input with file upload support
- **Interactive Glossary**: Hover tooltips for medical term definitions
- **Visual Range Indicators**: Graphical representation of test results within reference ranges
- **Summary Charts**: Overview visualization of all test results
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessible**: Keyboard navigation, ARIA labels, semantic HTML

## Tech Stack

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Data visualization library

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
```

### Environment Setup

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Configure the API endpoint:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
app/
├── components/
│   ├── ReportDisplay.tsx       # Main report rendering component
│   ├── Tooltip.tsx             # Interactive terminology tooltips
│   ├── RangeIndicator.tsx      # Individual test range visualization
│   ├── TestSummaryChart.tsx    # Summary chart component
│   └── DisclaimerModal.tsx     # Safety disclaimer modal
├── utils/
│   ├── numericExtraction.ts    # Parse numeric values and ranges
│   └── chartDataPreparation.ts # Transform data for visualization
├── page.tsx                    # Home page with input form
├── layout.tsx                  # Root layout
└── globals.css                 # Global styles
```

## Key Components

### ReportDisplay
Main component that renders the complete report with:
- Report metadata (patient, date, lab)
- Visual summary chart
- Individual test interpretations with range indicators
- Interactive medical terminology
- Safety disclaimers

### Tooltip
Accessible tooltip component for medical term definitions with:
- Hover and focus states
- Keyboard navigation
- Non-intrusive design

### RangeIndicator
Visual representation of test value within reference range:
- Color-coded markers (green for normal, amber for outside range)
- Clear min/max labels
- Neutral, educational presentation

### TestSummaryChart
Bar chart showing all test results:
- Normalized position within ranges
- Color-coded by status
- Interactive tooltips

## Data Flow

1. User inputs report text
2. Frontend sends POST request to backend API
3. Backend returns structured JSON interpretation
4. Frontend extracts numeric values and reference ranges
5. Data is transformed for visualization
6. Components render the complete report view

## Utilities

### numericExtraction.ts
- `extractNumericValue()`: Parse values like "110 mg/dL"
- `parseReferenceRange()`: Parse ranges like "70-100 mg/dL"
- `calculateNormalizedPosition()`: Calculate 0-1 position within range
- `determineRangeType()`: Classify as within/above/below

### chartDataPreparation.ts
- `prepareChartDataPoints()`: Create chart-ready data objects
- `calculateStatistics()`: Compute summary statistics
- `groupTestsByCategory()`: Organize tests by status

## Styling

- Tailwind CSS for component styling
- Custom color palette for status indicators
- Responsive breakpoints for mobile/desktop
- Accessible contrast ratios

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org)

