import { 
  extractNumericValue, 
  parseReferenceRange, 
  calculateNormalizedPosition,
  determineRangeType,
  prepareVisualizationData,
  extractAllVisualizationData,
  NumericValue,
  ReferenceRange,
  VisualizationData
} from '../numericExtraction';

describe('extractNumericValue', () => {
  it('should extract value with standard unit', () => {
    const result = extractNumericValue('110 mg/dL');
    expect(result).toEqual({
      value: 110,
      unit: 'mg/dL',
      originalString: '110 mg/dL',
    });
  });

  it('should extract value with percentage unit', () => {
    const result = extractNumericValue('6.5%');
    expect(result).toEqual({
      value: 6.5,
      unit: '%',
      originalString: '6.5%',
    });
  });

  it('should extract value without unit', () => {
    const result = extractNumericValue('95');
    expect(result).toEqual({
      value: 95,
      unit: '',
      originalString: '95',
    });
  });

  it('should handle comma separators', () => {
    const result = extractNumericValue('1,250 mg/dL');
    expect(result?.value).toBe(1250);
  });

  it('should return null for non-numeric strings', () => {
    const result = extractNumericValue('negative');
    expect(result).toBeNull();
  });

  it('should return null for empty string', () => {
    const result = extractNumericValue('');
    expect(result).toBeNull();
  });
});

describe('parseReferenceRange', () => {
  it('should parse standard range with unit', () => {
    const result = parseReferenceRange('70-100 mg/dL');
    expect(result).toEqual({
      min: 70,
      max: 100,
      unit: 'mg/dL',
      type: 'range',
      originalString: '70-100 mg/dL',
    });
  });

  it('should parse less than range', () => {
    const result = parseReferenceRange('< 200 mg/dL');
    expect(result).toEqual({
      min: null,
      max: 200,
      unit: 'mg/dL',
      type: 'less_than',
      originalString: '< 200 mg/dL',
    });
  });

  it('should parse greater than range', () => {
    const result = parseReferenceRange('> 50 mg/dL');
    expect(result).toEqual({
      min: 50,
      max: null,
      unit: 'mg/dL',
      type: 'greater_than',
      originalString: '> 50 mg/dL',
    });
  });

  it('should parse range with different separators', () => {
    const result1 = parseReferenceRange('4.0–5.6%');
    expect(result1?.type).toBe('range');
    expect(result1?.min).toBe(4.0);
    expect(result1?.max).toBe(5.6);
  });

  it('should return null for null input', () => {
    const result = parseReferenceRange(null);
    expect(result).toBeNull();
  });

  it('should handle unknown format gracefully', () => {
    const result = parseReferenceRange('normal');
    expect(result?.type).toBe('unknown');
  });
});

describe('calculateNormalizedPosition', () => {
  it('should calculate position within range', () => {
    const value: NumericValue = { value: 85, unit: 'mg/dL', originalString: '85 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const position = calculateNormalizedPosition(value, range);
    expect(position).toBeCloseTo(0.5, 2);
  });

  it('should calculate position at range minimum', () => {
    const value: NumericValue = { value: 70, unit: 'mg/dL', originalString: '70 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const position = calculateNormalizedPosition(value, range);
    expect(position).toBe(0);
  });

  it('should calculate position at range maximum', () => {
    const value: NumericValue = { value: 100, unit: 'mg/dL', originalString: '100 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const position = calculateNormalizedPosition(value, range);
    expect(position).toBe(1);
  });

  it('should handle value above range', () => {
    const value: NumericValue = { value: 120, unit: 'mg/dL', originalString: '120 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const position = calculateNormalizedPosition(value, range);
    expect(position).toBeGreaterThan(1);
  });

  it('should handle less than range type', () => {
    const value: NumericValue = { value: 150, unit: 'mg/dL', originalString: '150 mg/dL' };
    const range: ReferenceRange = { min: null, max: 200, unit: 'mg/dL', type: 'less_than', originalString: '< 200 mg/dL' };
    
    const position = calculateNormalizedPosition(value, range);
    expect(position).toBeLessThanOrEqual(1);
  });
});

describe('determineRangeType', () => {
  it('should determine within range', () => {
    const value: NumericValue = { value: 85, unit: 'mg/dL', originalString: '85 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const type = determineRangeType(value, range);
    expect(type).toBe('within');
  });

  it('should determine above range', () => {
    const value: NumericValue = { value: 110, unit: 'mg/dL', originalString: '110 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const type = determineRangeType(value, range);
    expect(type).toBe('above');
  });

  it('should determine below range', () => {
    const value: NumericValue = { value: 60, unit: 'mg/dL', originalString: '60 mg/dL' };
    const range: ReferenceRange = { min: 70, max: 100, unit: 'mg/dL', type: 'range', originalString: '70-100 mg/dL' };
    
    const type = determineRangeType(value, range);
    expect(type).toBe('below');
  });

  it('should return unknown for null inputs', () => {
    const type = determineRangeType(null, null);
    expect(type).toBe('unknown');
  });
});

describe('prepareVisualizationData', () => {
  it('should prepare complete visualization data', () => {
    const result = prepareVisualizationData(
      'Glucose',
      '110 mg/dL',
      '70-100 mg/dL',
      'above_range'
    );

    expect(result.testName).toBe('Glucose');
    expect(result.numericValue?.value).toBe(110);
    expect(result.referenceRange?.min).toBe(70);
    expect(result.referenceRange?.max).toBe(100);
    expect(result.isOutOfRange).toBe(true);
    expect(result.rangeType).toBe('above');
    expect(result.normalizedPosition).toBeGreaterThan(1);
  });

  it('should handle missing reference range', () => {
    const result = prepareVisualizationData(
      'Hemoglobin',
      '14.5 g/dL',
      null,
      'unknown'
    );

    expect(result.testName).toBe('Hemoglobin');
    expect(result.numericValue?.value).toBe(14.5);
    expect(result.referenceRange).toBeNull();
    expect(result.normalizedPosition).toBeNull();
  });
});

describe('extractAllVisualizationData', () => {
  it('should process multiple test interpretations', () => {
    const interpretations = [
      {
        testName: 'Glucose',
        value: '110 mg/dL',
        referenceRange: '70-100 mg/dL',
        status: 'above_range' as const,
      },
      {
        testName: 'Hemoglobin',
        value: '14.5 g/dL',
        referenceRange: '13.5-17.5 g/dL',
        status: 'within_range' as const,
      },
    ];

    const result = extractAllVisualizationData(interpretations);

    expect(result).toHaveLength(2);
    expect(result[0].testName).toBe('Glucose');
    expect(result[0].isOutOfRange).toBe(true);
    expect(result[1].testName).toBe('Hemoglobin');
    expect(result[1].isOutOfRange).toBe(false);
  });
});
