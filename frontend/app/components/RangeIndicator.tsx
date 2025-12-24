'use client';

interface RangeIndicatorProps {
  testName: string;
  currentValue: number;
  rangeMin: number;
  rangeMax: number;
  unit: string;
  status: 'within' | 'above' | 'below' | 'unknown';
}

export default function RangeIndicator({
  testName,
  currentValue,
  rangeMin,
  rangeMax,
  unit,
  status,
}: RangeIndicatorProps) {
  const totalRange = rangeMax - rangeMin;
  const valuePosition = ((currentValue - rangeMin) / totalRange) * 100;
  const clampedPosition = Math.max(0, Math.min(100, valuePosition));

  const isOutOfRange = status === 'above' || status === 'below';
  const markerColor = isOutOfRange ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Reference Range</span>
        <span className="text-gray-600">
          {rangeMin} - {rangeMax} {unit}
        </span>
      </div>

      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-green-100 border-r-2 border-green-300"
          style={{ width: '100%' }}
        />

        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-1 bg-gray-400"
          style={{ left: '0%', height: '60%' }}
        />
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-1 bg-gray-400"
          style={{ left: '100%', height: '60%' }}
        />

        <div
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
          style={{ left: `${clampedPosition}%` }}
        >
          <div 
            className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: markerColor }}
          />
          <div 
            className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium px-2 py-1 rounded shadow-sm"
            style={{ 
              backgroundColor: markerColor,
              color: 'white'
            }}
          >
            {currentValue} {unit}
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Low</span>
        <span>Normal Range</span>
        <span>High</span>
      </div>
    </div>
  );
}
