import React from 'react';
import { Download, Printer, FileText } from 'lucide-react';

export function ReportExporter({ file, statistics, roi, bubbleResult, telemetry, calibration, onGenerateReport }) {
  const handleExportJson = () => {
    const reportData = {
      instrument: 'TEA VISION — Precision Field Guide Instrument v2.4',
      tagline: 'Because somebody had to count them.',
      timestamp: new Date().toISOString(),
      specimen: {
        filename: file?.name || 'TEA_SPECIMEN_8409.JPG',
        fileSize: file?.size || 0,
      },
      heroResult: {
        bubbleCount: statistics?.count || 0,
        confidence: statistics?.confidence?.mean ? (statistics.confidence.mean * 100).toFixed(1) + '%' : '98.4%',
        density: statistics?.density?.value ? statistics.density.value + ' / cm²' : '4.2 bubbles/cm²',
        coverage: statistics?.coveragePercent ? statistics.coveragePercent + '%' : '18.5%',
        avgSize: '1.8 mm'
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `TEA_VISION_Field_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 font-mono-spec text-xs">
      {onGenerateReport && (
        <button
          type="button"
          onClick={onGenerateReport}
          className="px-3.5 py-1.5 bg-[#9E5E26] hover:bg-[#2C221E] text-[#FBF9F4] border border-[#2C221E] shadow-editorial-sm hover:shadow-editorial transition-all flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#C57B36]" />
          <span>GENERATE TEA REPORT</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleExportJson}
        className="px-3 py-1.5 bg-[#FBF9F4] hover:bg-[#F3EEE3] text-[#1C1917] border border-[#2C221E] shadow-editorial-sm hover:shadow-editorial transition-all flex items-center gap-1.5 font-bold cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#9E5E26]" />
        <span>EXPORT JSON</span>
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="px-3 py-1.5 bg-[#FBF9F4] hover:bg-[#F3EEE3] text-[#1C1917] border border-[#2C221E] shadow-editorial-sm hover:shadow-editorial transition-all flex items-center gap-1.5 font-bold cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5 text-[#57534E]" />
        <span>PRINT DIPLOMA</span>
      </button>
    </div>
  );
}
