import React, { useRef, useState } from 'react';
import { EmptyStateTeaCup } from './illustrations/EmptyStateTeaCup';
import { SAMPLE_SPECIMENS } from './illustrations/SampleSpecimensData';
import { Upload, Camera, Sparkles, Image as ImageIcon } from 'lucide-react';

export function UploadZone({ onFileSelect, onSampleSelect, isProcessing }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div id="upload-section" className="py-10 px-4 sm:px-8 max-w-4xl mx-auto">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative bg-[#FBF9F4] border-2 border-dashed ${isDragOver ? 'border-[#0284C7] bg-[#0284C7]/5' : 'border-[#2C221E]'} p-8 sm:p-12 shadow-editorial transition-all text-center`}
      >
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/*"
          className="hidden" 
        />

        <input 
          type="file" 
          ref={cameraInputRef}
          onChange={handleInputChange}
          accept="image/*"
          capture="environment"
          className="hidden" 
        />

        {/* Linework Tea Cup Vector Illustration */}
        <EmptyStateTeaCup />

        <div className="space-y-1 mb-6">
          <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
            Give us a tea sample.
          </h2>
          <p className="font-mono-spec text-xs text-[#57534E]">
            Upload or capture a clear top-down image of your tea surface for Moondream AI analysis.
          </p>
        </div>

        {/* Primary Action Buttons: UPLOAD IMAGE | USE CAMERA | TRY DEMO SAMPLE */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#2C221E] hover:bg-[#9E5E26] text-[#FBF9F4] font-mono-spec text-sm font-bold px-6 py-3.5 border-2 border-[#2C221E] shadow-editorial shadow-editorial-hover flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#C57B36]" />
            <span>UPLOAD IMAGE</span>
          </button>

          <button
            disabled={isProcessing}
            onClick={() => cameraInputRef.current?.click()}
            className="bg-[#FBF9F4] hover:bg-[#F3EEE3] text-[#1C1917] font-mono-spec text-sm font-bold px-5 py-3.5 border-2 border-[#2C221E] shadow-editorial shadow-editorial-hover flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4 text-[#9E5E26]" />
            <span>USE CAMERA</span>
          </button>

          <button
            disabled={isProcessing}
            onClick={() => onSampleSelect(SAMPLE_SPECIMENS[0])}
            className="bg-[#F3EEE3] hover:bg-[#E6DDD0] text-[#1C1917] font-mono-spec text-sm font-bold px-5 py-3.5 border-2 border-[#2C221E] shadow-editorial shadow-editorial-hover flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#9E5E26]" />
            <span>TRY DEMO SAMPLE</span>
          </button>
        </div>

        {/* Instant Specimen Selector Chips */}
        <div className="mt-8 pt-6 border-t border-[#2C221E]/30">
          <span className="font-mono-spec text-xs font-bold text-[#57534E] uppercase tracking-wider block mb-3">
            SELECT PRE-LABELED COMPETITION SPECIMENS:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SAMPLE_SPECIMENS.map((spec) => (
              <button
                key={spec.id}
                onClick={() => onSampleSelect(spec)}
                className="bg-[#FBF9F4] hover:bg-[#F3EEE3] border border-[#2C221E] px-3.5 py-2 font-mono-spec text-xs text-[#1C1917] shadow-editorial-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#9E5E26]" />
                <span className="font-bold">{spec.title}</span>
                <span className="text-[10px] text-[#57534E]">({spec.count} bubbles)</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
