import React, { useState } from 'react';
import {
  Database,
  Columns,
  Copy,
  TableProperties,
  Hash,
  Search,
  CheckCircle2,
  Calendar,
  Type,
  ToggleLeft,
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { DetectedColumnType } from '../../types/analytics';

const typeBadgeStyles: Record<DetectedColumnType, { label: string; bg: string; text: string; border: string }> = {
  numeric: {
    label: 'NUMERIC',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  categorical: {
    label: 'CATEGORICAL',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  date: {
    label: 'DATE',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  boolean: {
    label: 'BOOLEAN',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  text: {
    label: 'TEXT',
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-300',
    border: 'border-zinc-500/20',
  },
  empty: {
    label: 'EMPTY',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
};

export const OverviewView: React.FC = () => {
  const { analysisData } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  if (!analysisData || !analysisData.profile) {
    return (
      <div className="p-8 text-center text-[#92969E] font-mono text-xs">
        No dataset profile data available.
      </div>
    );
  }

  const { profile, analytics } = analysisData;
  const totalRows = Number(profile.total_rows) || 0;
  const totalCols = Number(profile.total_columns) || 0;
  const duplicateRows = Number(profile.duplicate_rows) || 0;
  const columnsList = Object.entries(profile.columns || {});

  const filteredColumns = columnsList.filter(([colName, col]) => {
    const matchesSearch = colName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || col?.detected_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const numericCount = analytics?.dataset_summary?.numeric_columns?.length ?? 0;
  const categoricalCount = analytics?.dataset_summary?.categorical_columns?.length ?? 0;
  const dateCount = analytics?.dataset_summary?.date_columns?.length ?? 0;
  const textCount = analytics?.dataset_summary?.text_columns?.length ?? 0;

  const duplicatePercentage = totalRows > 0
    ? ((duplicateRows / totalRows) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-[#92969E] mb-2 font-mono text-xs uppercase tracking-wider">
            <span>Total Records</span>
            <Database className="w-4 h-4 text-silver-light" />
          </div>
          <div className="text-3xl font-space font-bold text-white tracking-tight">
            {totalRows.toLocaleString()}
          </div>
          <div className="text-xs text-[#92969E] mt-2 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dataset rows ingested</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-[#92969E] mb-2 font-mono text-xs uppercase tracking-wider">
            <span>Total Columns</span>
            <Columns className="w-4 h-4 text-silver-light" />
          </div>
          <div className="text-3xl font-space font-bold text-white tracking-tight">
            {totalCols}
          </div>
          <div className="text-xs text-[#92969E] mt-2 font-mono">
            {numericCount} num · {categoricalCount} cat · {dateCount} date
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-[#92969E] mb-2 font-mono text-xs uppercase tracking-wider">
            <span>Duplicate Records</span>
            <Copy className="w-4 h-4 text-silver-light" />
          </div>
          <div className="text-3xl font-space font-bold text-white tracking-tight">
            {duplicateRows.toLocaleString()}
          </div>
          <div className="text-xs text-[#92969E] mt-2 font-mono">
            {duplicatePercentage}% of total rows
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-[#92969E] mb-2 font-mono text-xs uppercase tracking-wider">
            <span>Total Cells</span>
            <TableProperties className="w-4 h-4 text-silver-light" />
          </div>
          <div className="text-3xl font-space font-bold text-white tracking-tight">
            {(totalRows * totalCols).toLocaleString()}
          </div>
          <div className="text-xs text-[#92969E] mt-2 font-mono">
            Matrix structure density
          </div>
        </div>
      </div>

      {/* Column Type Composition Pills */}
      <div className="p-6 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl">
        <h3 className="font-space font-medium text-white text-base mb-4 flex items-center gap-2">
          <span>Column Type Distribution</span>
          <span className="text-xs text-[#92969E] font-mono">({totalCols} total)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#202226]/50 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Hash className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-mono text-[#D9DADD]">Numeric</span>
            </div>
            <span className="font-space font-bold text-white">{numericCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202226]/50 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ToggleLeft className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono text-[#D9DADD]">Categorical</span>
            </div>
            <span className="font-space font-bold text-white">{categoricalCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202226]/50 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-[#D9DADD]">Date / Time</span>
            </div>
            <span className="font-space font-bold text-white">{dateCount}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#202226]/50 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Type className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-[#D9DADD]">Text / Other</span>
            </div>
            <span className="font-space font-bold text-white">{textCount}</span>
          </div>
        </div>
      </div>

      {/* Column Profiling Table */}
      <div className="rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-space font-medium text-lg text-white">Dataset Column Schema &amp; Profiling</h3>
            <p className="text-xs text-[#92969E] font-mono mt-1">
              Automated data type detection, missing value ratio, and cardinality per feature.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#92969E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 rounded-lg bg-[#202226]/60 border border-white/10 text-white placeholder-[#92969E] text-xs font-mono focus:outline-none focus:border-white/30"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#202226]/60 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="numeric">Numeric</option>
              <option value="categorical">Categorical</option>
              <option value="date">Date</option>
              <option value="text">Text</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#202226]/30 text-[#92969E]">
                <th className="py-3 px-6 font-medium">#</th>
                <th className="py-3 px-6 font-medium">COLUMN NAME</th>
                <th className="py-3 px-6 font-medium">DETECTED TYPE</th>
                <th className="py-3 px-6 font-medium">SYSTEM DTYPE</th>
                <th className="py-3 px-6 font-medium">MISSING VALUES</th>
                <th className="py-3 px-6 font-medium">UNIQUE VALUES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredColumns.map(([colName, col], idx) => {
                const badge = typeBadgeStyles[col?.detected_type] || typeBadgeStyles.text;
                const missingVals = Number(col?.missing_values) || 0;
                const missingPct = typeof col?.missing_percentage === 'number'
                  ? col.missing_percentage.toFixed(1)
                  : totalRows > 0
                    ? ((missingVals / totalRows) * 100).toFixed(1)
                    : '0.0';

                const uniqueVals = Number(col?.unique_values) || 0;
                // Safe calculation of unique percentage using actual total rows from backend
                const uniquePct = typeof col?.unique_percentage === 'number'
                  ? col.unique_percentage.toFixed(1)
                  : totalRows > 0
                    ? ((uniqueVals / totalRows) * 100).toFixed(1)
                    : '0.0';

                return (
                  <tr key={colName} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-6 text-[#92969E]">{idx + 1}</td>
                    <td className="py-3 px-6 font-space font-medium text-white">{colName}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-[#D9DADD]">{col?.data_type || 'unknown'}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span className={missingVals > 0 ? 'text-amber-400' : 'text-[#92969E]'}>
                          {missingVals.toLocaleString()} ({missingPct}%)
                        </span>
                        {Number(missingPct) > 0 && (
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-amber-400"
                              style={{ width: `${Math.min(100, Number(missingPct))}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-[#D9DADD]">
                      {uniqueVals.toLocaleString()} ({uniquePct}%)
                    </td>
                  </tr>
                );
              })}
              {filteredColumns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#92969E]">
                    No columns match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
