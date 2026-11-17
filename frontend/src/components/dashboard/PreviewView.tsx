import React, { useState } from 'react';
import { Table, Search, Download, Eye, FileSpreadsheet } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';

export const PreviewView: React.FC = () => {
  const { analysisData } = useAnalytics();
  const [columnSearch, setColumnSearch] = useState('');

  if (!analysisData) {
    return (
      <div className="p-8 text-center text-[#92969E] font-mono text-xs">
        No preview records available.
      </div>
    );
  }

  const preview = analysisData.preview || [];
  const profile = analysisData.profile || { columns: {} };
  const allColumns = Object.keys(profile.columns || {});

  const displayedColumns = allColumns.filter((col) =>
    col.toLowerCase().includes(columnSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-[#92969E] uppercase mb-2">
            <Eye className="w-3.5 h-3.5 text-silver-light" />
            <span>Raw Data Sample</span>
          </div>
          <h3 className="font-space font-bold text-2xl text-white">Dataset Records Preview</h3>
          <p className="text-xs text-[#92969E] font-mono mt-1">
            Displaying the first {preview.length} sample records directly ingested from the dataset stream.
          </p>
        </div>

        {/* Column Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#92969E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search columns..."
            value={columnSearch}
            onChange={(e) => setColumnSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg bg-[#202226]/60 border border-white/10 text-white placeholder-[#92969E] text-xs font-mono focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Interactive Table */}
      <div className="rounded-2xl bg-[#16181b]/80 border border-white/10 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#202226]/40 text-[#92969E]">
                <th className="py-3 px-4 font-medium sticky left-0 bg-[#16181b] z-10 border-r border-white/5">
                  ROW
                </th>
                {displayedColumns.map((colName) => (
                  <th key={colName} className="py-3 px-4 font-medium whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white font-space">{colName}</span>
                      <span className="text-[9px] text-[#92969E] uppercase">
                        {profile.columns[colName]?.detected_type || 'unknown'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {preview.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-[#92969E] sticky left-0 bg-[#16181b] font-medium border-r border-white/5">
                    #{rowIdx + 1}
                  </td>
                  {displayedColumns.map((colName) => {
                    const value = row[colName];
                    const isEmpty = value === '' || value === null || value === undefined;
                    return (
                      <td
                        key={colName}
                        className={`py-3 px-4 whitespace-nowrap max-w-[300px] truncate ${
                          isEmpty ? 'text-zinc-600 italic' : 'text-[#D9DADD]'
                        }`}
                      >
                        {isEmpty ? 'null' : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {preview.length === 0 && (
                <tr>
                  <td colSpan={displayedColumns.length + 1} className="py-8 text-center text-[#92969E]">
                    No preview records available.
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
