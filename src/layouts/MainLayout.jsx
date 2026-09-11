import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function MainLayout({ children, openCVStatus = 'READY', onReset }) {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1C1917] flex flex-col relative overflow-x-hidden">
      {/* Global Header */}
      <Header openCVStatus={openCVStatus} onReset={onReset} />

      {/* Main Content Workspace */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
