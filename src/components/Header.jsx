import React from 'react';
import { RefreshCw, Sparkles, Binary } from 'lucide-react';

export function Header({ openCVStatus = 'READY', onReset }) {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F4]/95 backdrop-blur-sm border-b-2 border-[#2C221E] shadow-editorial-sm py-3 px-4 sm:px-8 transition-all">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding & Tagline */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onReset}
        >
          {/* Editorial Stamp Logo Icon */}
          <div className="w-10 h-10 bg-[#F3EEE3] border-2 border-[#2C221E] flex items-center justify-center shadow-editorial-sm group-hover:bg-[#9E5E26] group-hover:text-[#FBF9F4] transition-colors">
            <span className="font-editorial text-xl font-extrabold text-[#1C1917] group-hover:text-[#FBF9F4]">
              τ
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl font-bold tracking-tight text-[#1C1917]">
                TEA VISION
              </h1>
              <span className="font-mono-spec text-[9px] bg-[#2C221E] text-[#FBF9F4] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                v2.4 INSTRUMENT
              </span>
            </div>
            <p className="font-mono-spec text-xs text-[#9E5E26] italic font-medium">
              Because somebody had to count them.
            </p>
          </div>
        </div>

        {/* Right Status & Quick Action Controls */}
        <div className="flex items-center gap-4">
          {/* OpenCV Laboratory Engine Status Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#F3EEE3] border border-[#2C221E] px-3 py-1 text-xs font-mono-spec">
            <span className={`w-2 h-2 rounded-full ${openCVStatus === 'READY' ? 'bg-[#5F7A62] animate-pulse' : 'bg-[#DC2626]'}`}></span>
            <span className="text-[#57534E]">OPENCV ENGINE:</span>
            <span className="font-bold text-[#1C1917]">{openCVStatus}</span>
          </div>

          {/* New Specimen Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="bg-[#FBF9F4] border-2 border-[#2C221E] hover:bg-[#F3EEE3] px-3 py-1.5 font-mono-spec text-xs font-bold text-[#1C1917] shadow-editorial-sm hover:shadow-editorial transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#9E5E26]" />
              <span>NEW SPECIMEN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
