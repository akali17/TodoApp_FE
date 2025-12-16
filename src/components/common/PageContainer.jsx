import React from "react";
import Navbar from "./Navbar";

export default function PageContainer({ title, children, headerRight }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <Navbar />

      {/* Header */}
      {title && (
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
            {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
