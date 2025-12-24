'use client';

import { useMemo } from 'react';
import Tooltip from './Tooltip';
import RangeIndicator from './RangeIndicator';
import TestSummaryChart from './TestSummaryChart';
import { extractAllVisualizationData, VisualizationData } from '../utils/numericExtraction';
import { 
  calculateStatistics, 
  groupTestsByCategory,
  prepareChartDataPoints,
  prepareBarChartData,
  prepareRangeVisualizations
} from '../utils/chartDataPreparation';

interface TerminologyDefinition {
  term: string;
  definition: string;
}

interface TestInterpretation {
  testName: string;
  value: string;
  referenceRange: string | null;
  status: 'within_range' | 'above_range' | 'below_range' | 'unknown';
  explanation: string;
  terminology: TerminologyDefinition[];
  context: string;
}

interface ReportMetadata {
  patientName: string | null;
  reportDate: string | null;
  reportType: string;
  labName: string | null;
}

interface AIReportInterpretation {
  reportMetadata: ReportMetadata;
  interpretations: TestInterpretation[];
  disclaimer: string;
  nextSteps: string;
}

interface ReportDisplayProps {
  report: AIReportInterpretation;
}

const sectionTitles: Record<string, string> = {
  reportMetadata: 'Report Information',
  interpretations: 'Your Test Results Explained',
  disclaimer: 'Important Notice',
  nextSteps: 'What to Do Next',
};

const statusColors = {
  within_range: 'bg-green-50 text-green-800 border-green-200',
  above_range: 'bg-amber-50 text-amber-800 border-amber-200',
  below_range: 'bg-amber-50 text-amber-800 border-amber-200',
  unknown: 'bg-gray-50 text-gray-800 border-gray-200',
};

const statusLabels = {
  within_range: 'Within Normal Range',
  above_range: 'Above Normal Range',
  below_range: 'Below Normal Range',
  unknown: 'Status Unknown',
};

function highlightTerms(text: string, terminology: TerminologyDefinition[]) {
  if (!terminology.length) return text;

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  const termMap = new Map(terminology.map(t => [t.term.toLowerCase(), t.definition]));
  const sortedTerms = [...termMap.keys()].sort((a, b) => b.length - a.length);

  const regex = new RegExp(`\\b(${sortedTerms.join('|')})\\b`, 'gi');
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedTerm = match[0];
    const definition = termMap.get(matchedTerm.toLowerCase());

    if (definition) {
      parts.push(
        <Tooltip key={match.index} content={definition}>
          {matchedTerm}
        </Tooltip>
      );
    } else {
      parts.push(matchedTerm);
    }

    lastIndex = match.index + matchedTerm.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  const visualizationData = useMemo(() => {
    return extractAllVisualizationData(report.interpretations);
  }, [report.interpretations]);

  const chartData = useMemo(() => {
    return prepareChartDataPoints(visualizationData);
  }, [visualizationData]);

  const barChartData = useMemo(() => {
    return prepareBarChartData(visualizationData);
  }, [visualizationData]);

  const rangeVisualizations = useMemo(() => {
    return prepareRangeVisualizations(visualizationData);
  }, [visualizationData]);

  const statistics = useMemo(() => {
    return calculateStatistics(visualizationData);
  }, [visualizationData]);

  const categorizedTests = useMemo(() => {
    return groupTestsByCategory(visualizationData);
  }, [visualizationData]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {sectionTitles.reportMetadata}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.reportMetadata.patientName && (
            <div>
              <div className="text-sm font-medium text-gray-500">Patient Name</div>
              <div className="text-base text-gray-900">{report.reportMetadata.patientName}</div>
            </div>
          )}
          {report.reportMetadata.reportDate && (
            <div>
              <div className="text-sm font-medium text-gray-500">Report Date</div>
              <div className="text-base text-gray-900">{new Date(report.reportMetadata.reportDate).toLocaleDateString()}</div>
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-gray-500">Test Type</div>
            <div className="text-base text-gray-900">{report.reportMetadata.reportType}</div>
          </div>
          {report.reportMetadata.labName && (
            <div>
              <div className="text-sm font-medium text-gray-500">Laboratory</div>
              <div className="text-base text-gray-900">{report.reportMetadata.labName}</div>
            </div>
          )}
        </div>
      </div>

      {statistics.testsWithRanges > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Visual Summary
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            This chart shows where your test results fall within their reference ranges. 
            Values are shown as a percentage of the normal range, not as medical assessments.
          </p>
          <TestSummaryChart 
            data={chartData.map(d => ({
              name: d.testName,
              value: d.normalizedPosition * 100,
              status: d.status,
            }))}
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{statistics.withinRange}</div>
              <div className="text-sm text-gray-600">Within Range</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-700">{statistics.aboveRange + statistics.belowRange}</div>
              <div className="text-sm text-gray-600">Outside Range</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {sectionTitles.interpretations}
        </h2>
        <div className="space-y-6">
          {report.interpretations.map((test, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{test.testName}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[test.status]}`}>
                  {statusLabels[test.status]}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-lg font-medium text-gray-900">Your Result: {test.value}</span>
                  {test.referenceRange && (
                    <span className="text-sm text-gray-600">Normal Range: {test.referenceRange}</span>
                  )}
                </div>
              </div>

              {visualizationData[index]?.numericValue && 
               visualizationData[index]?.referenceRange?.type === 'range' && 
               visualizationData[index]?.referenceRange?.min !== null && 
               visualizationData[index]?.referenceRange?.max !== null && (
                <div className="mb-6">
                  <RangeIndicator
                    testName={test.testName}
                    currentValue={visualizationData[index].numericValue!.value}
                    rangeMin={visualizationData[index].referenceRange!.min!}
                    rangeMax={visualizationData[index].referenceRange!.max!}
                    unit={visualizationData[index].numericValue!.unit}
                    status={visualizationData[index].rangeType}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">What This Test Measures</h4>
                  <p className="text-gray-700 leading-relaxed">{highlightTerms(test.explanation, test.terminology)}</p>
                </div>

                {test.terminology.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Medical Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {test.terminology.map((term, termIndex) => (
                        <Tooltip key={termIndex} content={term.definition}>
                          <span className="inline-block px-3 py-1 bg-blue-50 rounded-full text-sm font-medium">
                            {term.term}
                          </span>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">What This Means</h4>
                  <p className="text-gray-700 leading-relaxed">{highlightTerms(test.context, test.terminology)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-amber-900 mb-3">
          {sectionTitles.disclaimer}
        </h2>
        <p className="text-amber-800 leading-relaxed">{report.disclaimer}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-3">
          {sectionTitles.nextSteps}
        </h2>
        <p className="text-blue-800 leading-relaxed">{report.nextSteps}</p>
      </div>
    </div>
  );
}
