'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface TestSummaryData {
  name: string;
  value: number;
  status: 'within' | 'above' | 'below' | 'unknown';
}

interface TestSummaryChartProps {
  data: TestSummaryData[];
}

const STATUS_COLORS = {
  within: '#10b981',
  above: '#f59e0b',
  below: '#f59e0b',
  unknown: '#6b7280',
};

export default function TestSummaryChart({ data }: TestSummaryChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    normalizedValue: Math.min(100, Math.max(0, item.value)),
    status: item.status,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Position in Range (%)', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-medium text-gray-900">{data.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Position: {data.normalizedValue.toFixed(1)}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            content={() => (
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.within }} />
                  <span>Within Range</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: STATUS_COLORS.above }} />
                  <span>Outside Range</span>
                </div>
              </div>
            )}
          />
          <Bar dataKey="normalizedValue" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
