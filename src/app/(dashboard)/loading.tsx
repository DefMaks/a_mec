import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto py-2">
      {/* Header Skeleton with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-[#E2E8F0] rounded-md" />
          <div className="h-7 w-64 bg-[#CBD5E1] rounded-lg" />
          <div className="h-3.5 w-80 bg-[#E2E8F0] rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-[#E2E8F0] rounded-xl" />
          <div className="h-9 w-32 bg-[#0F2C59]/20 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-[#E2E8F0] rounded-md" />
              <div className="w-8 h-8 rounded-xl bg-[#F1F5F9]" />
            </div>
            <div className="h-8 w-20 bg-[#CBD5E1] rounded-lg" />
            <div className="h-3 w-32 bg-[#F1F5F9] rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-[#CBD5E1] rounded-md" />
            <div className="h-3.5 w-64 bg-[#E2E8F0] rounded-md" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
            <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
            <span>Chargement de la page...</span>
          </div>
        </div>

        {/* Table/List Skeleton Rows */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-14 bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E2E8F0]" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-40 bg-[#CBD5E1] rounded-md" />
                  <div className="h-2.5 w-24 bg-[#E2E8F0] rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-[#E2E8F0] rounded-full hidden sm:block" />
                <div className="h-8 w-16 bg-[#E2E8F0] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
