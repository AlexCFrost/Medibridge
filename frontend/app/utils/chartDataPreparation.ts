import { VisualizationData } from './numericExtraction';

export interface ChartDataPoint {
  testName: string;
  value: number;
  min: number | null;
  max: number | null;
  unit: string;
  normalizedPosition: number;
  status: 'within' | 'above' | 'below' | 'unknown';
}

export interface BarChartData {
  label: string;
  percentage: number;
  color: string;
  isOutOfRange: boolean;
}

export interface RangeVisualization {
  testName: string;
  currentValue: number;
  rangeMin: number;
  rangeMax: number;
  unit: string;
  valuePercentage: number;
  minLabel: string;
  maxLabel: string;
  valueLabel: string;
}

export function prepareChartDataPoints(visualData: VisualizationData[]): ChartDataPoint[] {
  return visualData
    .filter(data => data.numericValue !== null && data.normalizedPosition !== null)
    .map(data => ({
      testName: data.testName,
      value: data.numericValue!.value,
      min: data.referenceRange?.min || null,
      max: data.referenceRange?.max || null,
      unit: data.numericValue!.unit,
      normalizedPosition: data.normalizedPosition!,
      status: data.rangeType,
    }));
}

export function prepareBarChartData(visualData: VisualizationData[]): BarChartData[] {
  return visualData
    .filter(data => data.normalizedPosition !== null)
    .map(data => {
      const percentage = Math.min(100, Math.max(0, data.normalizedPosition! * 100));
      
      let color = '#10b981';
      if (data.rangeType === 'above') color = '#f59e0b';
      if (data.rangeType === 'below') color = '#f59e0b';
      if (data.rangeType === 'unknown') color = '#6b7280';

      return {
        label: data.testName,
        percentage,
        color,
        isOutOfRange: data.isOutOfRange,
      };
    });
}

export function prepareRangeVisualizations(visualData: VisualizationData[]): RangeVisualization[] {
  return visualData
    .filter(data => 
      data.numericValue !== null && 
      data.referenceRange !== null &&
      data.referenceRange.type === 'range' &&
      data.referenceRange.min !== null &&
      data.referenceRange.max !== null
    )
    .map(data => {
      const value = data.numericValue!.value;
      const min = data.referenceRange!.min!;
      const max = data.referenceRange!.max!;
      const unit = data.numericValue!.unit;

      const totalRange = max - min;
      const valuePosition = ((value - min) / totalRange) * 100;
      const clampedPosition = Math.max(0, Math.min(100, valuePosition));

      return {
        testName: data.testName,
        currentValue: value,
        rangeMin: min,
        rangeMax: max,
        unit,
        valuePercentage: clampedPosition,
        minLabel: `${min} ${unit}`,
        maxLabel: `${max} ${unit}`,
        valueLabel: `${value} ${unit}`,
      };
    });
}

export function calculateStatistics(visualData: VisualizationData[]) {
  const total = visualData.length;
  const validTests = visualData.filter(d => d.numericValue !== null).length;
  const testsWithRanges = visualData.filter(d => d.referenceRange !== null).length;
  
  const withinRange = visualData.filter(d => d.rangeType === 'within').length;
  const aboveRange = visualData.filter(d => d.rangeType === 'above').length;
  const belowRange = visualData.filter(d => d.rangeType === 'below').length;
  
  const normalPercentage = total > 0 ? (withinRange / total) * 100 : 0;
  const abnormalPercentage = total > 0 ? ((aboveRange + belowRange) / total) * 100 : 0;

  return {
    total,
    validTests,
    testsWithRanges,
    withinRange,
    aboveRange,
    belowRange,
    normalPercentage,
    abnormalPercentage,
  };
}

export function groupTestsByCategory(visualData: VisualizationData[]): Record<string, VisualizationData[]> {
  const categories: Record<string, VisualizationData[]> = {
    normal: [],
    elevated: [],
    low: [],
    noRange: [],
  };

  visualData.forEach(data => {
    if (data.rangeType === 'within') {
      categories.normal.push(data);
    } else if (data.rangeType === 'above') {
      categories.elevated.push(data);
    } else if (data.rangeType === 'below') {
      categories.low.push(data);
    } else {
      categories.noRange.push(data);
    }
  });

  return categories;
}

export function formatValueWithUnit(value: number, unit: string): string {
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatRangeString(min: number | null, max: number | null, unit: string): string {
  if (min !== null && max !== null) {
    return `${formatValueWithUnit(min, '')} - ${formatValueWithUnit(max, unit)}`;
  }
  if (max !== null) {
    return `< ${formatValueWithUnit(max, unit)}`;
  }
  if (min !== null) {
    return `> ${formatValueWithUnit(min, unit)}`;
  }
  return 'No range available';
}
