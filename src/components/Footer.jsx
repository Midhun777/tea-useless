import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-[#2C221E] bg-[#F3EEE3] py-8 mt-auto font-mono-spec text-xs text-[#57534E]">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <div className="font-editorial text-lg font-bold text-[#1C1917]">
            TEA VISION
          </div>
          <p className="text-xs text-[#9E5E26] italic font-medium">
            Because somebody had to count them.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-[11px]">
          <span>PLATE IV SPECIMEN ARCHIVE</span>
          <span>•</span>
          <span>OPENCV 5.0 ENGINE</span>
          <span>•</span>
          <span>&copy; {new Date().getFullYear()} TEA VISION LABS</span>
        </div>
      </div>
    </footer>
  );
}
