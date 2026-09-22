import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Download,
  Eye,
  Filter,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { reconService } from '../services/reconService';
import { Artifact } from '../types';

interface ArtifactCenterPageProps {
  onSelectRun: (runId: string) => void;
}

export const ArtifactCenterPage: React.FC<ArtifactCenterPageProps> = ({ onSelectRun }) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    reconService.getArtifacts().then(setArtifacts);
  }, []);

  const filtered = artifacts.filter(a =>
    a.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    a.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artifact & Financial Evidence Repository"
        subtitle="Cryptographically verified file statements and JSON API payload archives"
        badge={
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            MinIO S3 Evidence Store
          </span>
        }
      />

      {/* Filter Bar matching Screen 12 */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search school or file name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Showing {filtered.length} files</span>
      </div>

      {/* Artifacts Table matching Screen 12 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">School</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">File</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Rows</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">SHA-256 Checksum</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(art => (
                <tr
                  key={art.id}
                  onClick={() => setSelectedArtifact(art)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 text-slate-600">{art.date}</td>
                  <td className="py-3.5 px-3 font-bold text-[#14213D]">{art.schoolName}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {art.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-600 group-hover:underline">
                    {art.fileName}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{art.fileType}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-800">{art.rows.toLocaleString()}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                    ৳{art.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                    {art.sha256}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={art.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedArtifact(art);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Artifact Drawer with In-UI Row Preview */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-xl h-full max-h-[92vh] rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#14213D] font-mono">{selectedArtifact.fileName}</h3>
                <span className="text-[11px] text-slate-400">{selectedArtifact.schoolName} • {selectedArtifact.date}</span>
              </div>
              <button onClick={() => setSelectedArtifact(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-800">{selectedArtifact.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Downloaded At:</span>
                <span className="font-mono text-slate-800">{selectedArtifact.downloadedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Rows:</span>
                <span className="font-bold text-slate-800">{selectedArtifact.rows}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Reconciled Amount:</span>
                <span className="font-bold text-emerald-700">৳{selectedArtifact.amount.toLocaleString()}</span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-0.5">SHA-256 Immutable Hash:</span>
                <span className="font-mono text-[10px] text-slate-600 break-all bg-white p-1 rounded border block">
                  {selectedArtifact.sha256}
                </span>
              </div>
            </div>

            {/* In-UI Spreadsheet / CSV Preview */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Sample File Row Preview (Top 4 Rows)</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-bold text-slate-600">
                    <tr>
                      <th className="p-2">Row</th>
                      <th className="p-2">Student ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2">Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedArtifact.previewData ? (
                      selectedArtifact.previewData.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-mono">{row.Row}</td>
                          <td className="p-2 font-mono">{row.StudentID}</td>
                          <td className="p-2">{row.StudentName}</td>
                          <td className="p-2 text-right font-mono font-bold">৳{row.Amount}</td>
                          <td className="p-2 font-mono text-blue-600">{row.Ref}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400">
                          Binary stream preview indexed in SQL staging.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => alert(`Downloaded ${selectedArtifact.fileName} directly from MinIO evidence store.`)}
                className="flex-1 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Original File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
