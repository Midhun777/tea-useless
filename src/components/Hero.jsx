import React from 'react';
import { TeaCupHeroIllustration } from './illustrations/TeaCupHeroIllustration';
import { Compass, Sparkles, ArrowDown } from 'lucide-react';

export function Hero({ onCountClick, onTrySampleClick }) {
  return (
    <section className="relative pt-6 pb-10 px-4 sm:px-8 border-b-2 border-[#2C221E] bg-[#FBF9F4]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-parchment-texture opacity-70 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Editorial Subheader */}
        <div className="flex items-center justify-between border-b border-[#2C221E]/30 pb-3 mb-6">
          <div className="flex items-center gap-2 font-mono-spec text-xs text-[#57534E]">
            <Compass className="w-4 h-4 text-[#9E5E26]" />
            <span className="font-bold uppercase tracking-wider text-[#1C1917]">
              FIELD MANUAL NO. 402 — FLUID MATRIX DIVISION
            </span>
          </div>
          <span className="font-mono-spec text-xs text-[#9E5E26] hidden md:inline">
            SPECIMEN ANALYSIS PROTOCOL 7.2
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Copy & Action Buttons */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-block bg-[#F3EEE3] border border-[#2C221E] px-3 py-1 text-xs font-mono-spec font-bold text-[#9E5E26] shadow-editorial-sm">
              TEA VISION SYSTEM 3.1
            </div>

            <div className="space-y-1">
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1C1917] leading-[1.08] tracking-tight">
                TEA VISION
              </h1>
              <p className="font-editorial italic text-lg sm:text-xl text-[#9E5E26] font-medium">
                “Because somebody had to count them.”
              </p>
            </div>

            <p className="font-mono-spec text-sm sm:text-base text-[#57534E] leading-relaxed">
              An absurdly sophisticated scientific instrument dedicated to analyzing tea bubbles powered by Moondream vision models.
            </p>

            <div className="p-4 bg-[#F3EEE3] border-l-4 border-[#9E5E26] border-y border-r border-[#2C221E] text-xs font-mono-spec text-[#1C1917]">
              <p className="font-bold mb-1">GROUNDED COMPUTER VISION AXIOM:</p>
              <p className="italic text-[#57534E]">
                "Every count is spatially derived from grounded Moondream detections on the tea surface."
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary Action Button: COUNT THE BUBBLES */}
              <button
                onClick={onCountClick}
                className="bg-[#2C221E] hover:bg-[#9E5E26] text-[#FBF9F4] font-mono-spec text-sm font-bold px-6 py-3.5 border-2 border-[#2C221E] shadow-editorial shadow-editorial-hover flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 text-[#C57B36]" />
                <span>COUNT THE BUBBLES</span>
              </button>

              {/* Secondary Action Button: TRY A DEMO SAMPLE */}
              <button
                onClick={onTrySampleClick}
                className="bg-[#FBF9F4] hover:bg-[#F3EEE3] text-[#1C1917] font-mono-spec text-sm font-bold px-5 py-3.5 border-2 border-[#2C221E] shadow-editorial shadow-editorial-hover flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#9E5E26]" />
                <span>TRY A DEMO SAMPLE</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Centerpiece Editorial Illustration */}
          <div className="lg:col-span-7">
            <TeaCupHeroIllustration onAnalyzeClick={onCountClick} />
          </div>
        </div>
      </div>
    </section>
  );
}
