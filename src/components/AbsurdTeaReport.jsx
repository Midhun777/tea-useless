import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, CheckCircle, ShieldAlert, Award, Coffee, Eye } from 'lucide-react';

export function AbsurdTeaReport({ result, previewUrl, file, onClose }) {
  const [copied, setCopied] = useState(false);

  const bubbleCount = result?.count || 0;
  const rawCount = result?.telemetry?.totalRawDetections || bubbleCount;
  const deduplicatedCount = result?.telemetry?.deduplicatedCount || bubbleCount;
  const surfaceStatus = result?.surfaceDetected ? 'CONFIRMED LIQUID MATRIX' : 'AMBIGUOUS FOAM';
  const modelName = result?.telemetry?.model || 'Moondream 3.1-9B-A2B';
  const isDemoFallback = result?.telemetry?.isDemoFallback;

  // Absurd density metrics
  let densityCategory = 'LOW / CALM';
  let surfaceActivity = 'SERENE';
  let scientificImportance = 'QUESTIONABLE';
  let recommendedAction = 'Drink the tea immediately before temperature dissipation.';

  if (bubbleCount > 40) {
    densityCategory = 'HIGH DENSE FOAM';
    surfaceActivity = 'HYPERACTIVE MICRO-TURBULENCE';
    scientificImportance = 'CRITICAL TO ACADEMIC PROGRESS';
    recommendedAction = 'Observe with reverence. Take another photograph. Then drink the tea.';
  } else if (bubbleCount > 15) {
    densityCategory = 'MODERATE EFFERVESCENCE';
    surfaceActivity = 'BALANCED SURFACE TENSION';
    scientificImportance = 'MODERATELY ABSURD';
    recommendedAction = 'Sip methodically while contemplating fluid mechanics.';
  }

  const sampleId = `TEA-SPECIMEN-#${Math.floor(100 + Math.random() * 900)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `[TEA VISION LABORATORY REPORT]\nSpecimen ID: ${sampleId}\nBubble Population: ${bubbleCount}\nSurface Matrix: ${surfaceStatus}\nModel: ${modelName}\nScientific Importance: ${scientificImportance}\nAction: ${recommendedAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#FBF9F4] border-4 border-[#2C221E] max-w-2xl w-full p-6 sm:p-8 shadow-editorial-lg relative my-8"
      >
        {/* Editorial Watermark Header */}
        <div className="flex items-center justify-between border-b-2 border-[#2C221E] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#9E5E26] text-[#FBF9F4] border border-[#2C221E]">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-editorial text-2xl font-black text-[#1C1917] tracking-tight uppercase">
                OFFICIAL TEA BUBBLE REPORT
              </h2>
              <p className="font-mono-spec text-xs text-[#9E5E26] font-bold">
                DEPARTMENT OF ABSURD COMPUTER VISION & LIQUID TOPOLOGY
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono-spec font-bold px-3 py-1.5 border border-[#2C221E] bg-[#F3EEE3] hover:bg-[#E6DDD0] cursor-pointer"
          >
            [CLOSE]
          </button>
        </div>

        {/* Certificate Seal Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-[#F3EEE3] p-4 border-2 border-[#2C221E]">
          <div className="sm:col-span-2 space-y-1">
            <span className="font-mono-spec text-[10px] uppercase font-bold text-[#8C827A]">
              SAMPLE REGISTRATION ID
            </span>
            <div className="font-mono-spec text-lg font-black text-[#1C1917]">
              {sampleId}
            </div>
            <p className="font-mono-spec text-xs text-[#57534E]">
              Analyzed via {modelName} grounded spatial vision pipeline.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-[#2C221E]/30 pt-2 sm:pt-0 sm:pl-4">
            <Award className="w-8 h-8 text-[#9E5E26] mb-1" />
            <span className="font-mono-spec text-[10px] font-bold text-[#1C1917] uppercase text-center">
              CERTIFIED BUBBLE POPULATION
            </span>
          </div>
        </div>

        {/* Specimen Preview Thumbnail + Key Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          {previewUrl && (
            <div className="md:col-span-5 relative border-2 border-[#2C221E] bg-[#1C1917] flex items-center justify-center overflow-hidden aspect-square">
              <img
                src={previewUrl}
                alt="Analyzed Tea Specimen"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-[#1C1917]/90 text-[#FBF9F4] font-mono-spec text-[10px] p-1.5 text-center border border-[#FBF9F4]/30">
                SURFACE VISUAL SPECIMEN
              </div>
            </div>
          )}

          <div className={`space-y-3 font-mono-spec text-xs ${previewUrl ? 'md:col-span-7' : 'md:col-span-12'}`}>
            <div className="flex justify-between border-b border-[#2C221E]/20 pb-1.5">
              <span className="text-[#57534E]">GROUNDED BUBBLE COUNT:</span>
              <span className="font-bold text-[#9E5E26] text-sm">{bubbleCount} BUBBLES</span>
            </div>

            <div className="flex justify-between border-b border-[#2C221E]/20 pb-1.5">
              <span className="text-[#57534E]">RAW DETECTION CANDIDATES:</span>
              <span className="font-bold text-[#1C1917]">{rawCount}</span>
            </div>

            <div className="flex justify-between border-b border-[#2C221E]/20 pb-1.5">
              <span className="text-[#57534E]">DEDUPLICATED SPATIAL NODES:</span>
              <span className="font-bold text-[#1C1917]">{deduplicatedCount}</span>
            </div>

            <div className="flex justify-between border-b border-[#2C221E]/20 pb-1.5">
              <span className="text-[#57534E]">SURFACE CLASSIFICATION:</span>
              <span className="font-bold text-[#1C1917]">{surfaceActivity}</span>
            </div>

            <div className="flex justify-between border-b border-[#2C221E]/20 pb-1.5">
              <span className="text-[#57534E]">DENSITY CATEGORY:</span>
              <span className="font-bold text-[#9E5E26]">{densityCategory}</span>
            </div>

            <div className="flex justify-between border-b border-[#2C221E]/20 pb-1.5">
              <span className="text-[#57534E]">VISION ENGINE:</span>
              <span className="font-bold text-[#1C1917]">
                {isDemoFallback ? 'Moondream (Offline Demo)' : 'Moondream Cloud AI'}
              </span>
            </div>
          </div>
        </div>

        {/* Absurd Scientific Assessment Box */}
        <div className="bg-[#2C221E] text-[#FBF9F4] p-4 mb-6 border-2 border-[#2C221E] space-y-2">
          <div className="flex items-center gap-2 font-mono-spec text-xs font-bold text-[#C57B36] uppercase">
            <Eye className="w-4 h-4 text-[#00F0FF]" />
            <span>PRIMARY SCIENTIFIC EVALUATION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono-spec text-xs">
            <div>
              <span className="text-[#8C827A] block text-[10px]">SCIENTIFIC IMPORTANCE:</span>
              <span className="font-bold text-[#FBF9F4]">{scientificImportance}</span>
            </div>
            <div>
              <span className="text-[#8C827A] block text-[10px]">RECOMMENDED PROTOCOL:</span>
              <span className="font-bold text-[#C57B36]">{recommendedAction}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-[#2C221E]">
          <button
            onClick={handleCopySummary}
            className="bg-[#F3EEE3] hover:bg-[#E6DDD0] text-[#1C1917] font-mono-spec text-xs font-bold px-4 py-2.5 border border-[#2C221E] shadow-editorial-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileText className="w-4 h-4 text-[#9E5E26]" />
            <span>{copied ? 'SUMMARY COPIED!' : 'COPY REPORT TEXT'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#2C221E] hover:bg-[#9E5E26] text-[#FBF9F4] font-mono-spec text-xs font-bold px-5 py-2.5 border border-[#2C221E] shadow-editorial-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4 text-[#C57B36]" />
            <span>PRINT DIPLOMA</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
