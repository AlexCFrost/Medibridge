export interface NumericValue {
  value: number;
  unit: string;
  originalString: string;
}

export interface ReferenceRange {
  min: number | null;
  max: number | null;
  unit: string;
  type: 'range' | 'less_than' | 'greater_than' | 'exact' | 'unknown';
  originalString: string;
}

export interface VisualizationData {
  testName: string;
  numericValue: NumericValue | null;
  referenceRange: ReferenceRange | null;
  normalizedPosition: number | null;
  isOutOfRange: boolean;
  rangeType: 'within' | 'above' | 'below' | 'unknown';
}

export function extractNumericValue(valueString: string): NumericValue | null {
  if (!valueString || typeof valueString !== 'string') return null;

  const patterns = [
    /^([<>≤≥]?\s*[\d.,]+)\s*([a-zA-Z/%]+(?:\/[a-zA-Z]+)?)$/,
    /^([\d.,]+)\s*([a-zA-Z/%]+(?:\/[a-zA-Z]+)?)$/,
    /^([<>≤≥]?\s*[\d.,]+)$/,
  ];

  for (const pattern of patterns) {
    const match = valueString.trim().match(pattern);
    if (match) {
      const numericPart = match[1].replace(/[<>≤≥,\s]/g, '');
      const value = parseFloat(numericPart);
      
      if (!isNaN(value)) {
        return {
          value,
          unit: match[2]?.trim() || '',
          originalString: valueString.trim(),
        };
      }
    }
  }

  return null;
}

export function parseReferenceRange(rangeString: string | null): ReferenceRange | null {
  if (!rangeString || typeof rangeString !== 'string') {
    return null;
  }

  const trimmed = rangeString.trim();

  const unitMatch = trimmed.match(/([a-zA-Z/%]+(?:\/[a-zA-Z]+)?)$/);
  const unit = unitMatch ? unitMatch[1] : '';
  const numericPart = unit ? trimmed.replace(unit, '').trim() : trimmed;

  const rangePatterns = [
    { pattern: /^([\d.,]+)\s*[-–—to]+\s*([\d.,]+)$/, type: 'range' as const },
    { pattern: /^<\s*([\d.,]+)$/, type: 'less_than' as const },
    { pattern: /^>\s*([\d.,]+)$/, type: 'greater_than' as const },
    { pattern: /^≤\s*([\d.,]+)$/, type: 'less_than' as const },
    { pattern: /^≥\s*([\d.,]+)$/, type: 'greater_than' as const },
    { pattern: /^([\d.,]+)$/, type: 'exact' as const },
  ];

  for (const { pattern, type } of rangePatterns) {
    const match = numericPart.match(pattern);
    if (match) {
      if (type === 'range') {
        const min = parseFloat(match[1].replace(/,/g, ''));
        const max = parseFloat(match[2].replace(/,/g, ''));
        
        if (!isNaN(min) && !isNaN(max)) {
          return {
            min,
            max,
            unit,
            type,
            originalString: trimmed,
          };
        }
      } else if (type === 'less_than') {
        const max = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(max)) {
          return {
            min: null,
            max,
            unit,
            type,
            originalString: trimmed,
          };
        }
      } else if (type === 'greater_than') {
        const min = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(min)) {
          return {
            min,
            max: null,
            unit,
            type,
            originalString: trimmed,
          };
        }
      } else if (type === 'exact') {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(value)) {
          return {
            min: value,
            max: value,
            unit,
            type,
            originalString: trimmed,
          };
        }
      }
    }
  }

  return {
    min: null,
    max: null,
    unit: '',
    type: 'unknown',
    originalString: trimmed,
  };
}

export function calculateNormalizedPosition(
  value: NumericValue,
  range: ReferenceRange
): number | null {
  if (!value || !range) return null;

  if (range.type === 'range' && range.min !== null && range.max !== null) {
    const rangeSpan = range.max - range.min;
    if (rangeSpan === 0) return 0.5;
    
    const position = (value.value - range.min) / rangeSpan;
    return Math.max(0, Math.min(1, position));
  }

  if (range.type === 'less_than' && range.max !== null) {
    if (value.value <= range.max) {
      return value.value / range.max;
    }
    return 1 + ((value.value - range.max) / range.max) * 0.5;
  }

  if (range.type === 'greater_than' && range.min !== null) {
    if (value.value >= range.min) {
      const excessRatio = (value.value - range.min) / range.min;
      return 0.5 + Math.min(0.5, excessRatio * 0.25);
    }
    return (value.value / range.min) * 0.5;
  }

  return null;
}

export function determineRangeType(
  value: NumericValue | null,
  range: ReferenceRange | null
): 'within' | 'above' | 'below' | 'unknown' {
  if (!value || !range) return 'unknown';

  if (range.type === 'range' && range.min !== null && range.max !== null) {
    if (value.value < range.min) return 'below';
    if (value.value > range.max) return 'above';
    return 'within';
  }

  if (range.type === 'less_than' && range.max !== null) {
    return value.value <= range.max ? 'within' : 'above';
  }

  if (range.type === 'greater_than' && range.min !== null) {
    return value.value >= range.min ? 'within' : 'below';
  }

  return 'unknown';
}

export function prepareVisualizationData(
  testName: string,
  valueString: string,
  rangeString: string | null,
  status: 'within_range' | 'above_range' | 'below_range' | 'unknown'
): VisualizationData {
  const numericValue = extractNumericValue(valueString);
  const referenceRange = parseReferenceRange(rangeString);
  
  const normalizedPosition = numericValue && referenceRange
    ? calculateNormalizedPosition(numericValue, referenceRange)
    : null;

  const rangeType = determineRangeType(numericValue, referenceRange);

  return {
    testName,
    numericValue,
    referenceRange,
    normalizedPosition,
    isOutOfRange: status !== 'within_range' && status !== 'unknown',
    rangeType,
  };
}

export function extractAllVisualizationData(
  interpretations: Array<{
    testName: string;
    value: string;
    referenceRange: string | null;
    status: 'within_range' | 'above_range' | 'below_range' | 'unknown';
  }>
): VisualizationData[] {
  return interpretations.map(test =>
    prepareVisualizationData(test.testName, test.value, test.referenceRange, test.status)
  );
}
