import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  ArrowRight,
  PauseCircle,
  PlayCircle,
  Edit2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { StatusBadge } from '../components/shared/StatusBadge';
import { reconService } from '../services/reconService';
import { School } from '../types';

interface SchoolManagementPageProps {
  onSelectSchool: (schoolId: string) => void;
}

export const SchoolManagementPage: React.FC<SchoolManagementPageProps> = ({ onSelectSchool }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSchoolForDrawer, setSelectedSchoolForDrawer] = useState<School | null>(null);

  useEffect(() => {
    reconService.getSchools().then(setSchools);
  }, []);

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Management"
        subtitle="148 registered schools and institutions mapped to TAP settlement channels"
        badge={
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {schools.length} Active Institutions
          </span>
        }
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add School</span>
          </button>
        }
      />

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between text-xs">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search school name, code, vendor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          />
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Showing {filtered.length} of 148 schools</span>
      </div>

      {/* School Table matching Screen 11 */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-3">School Code</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3">Internal School ID</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Last Reconciliation</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(school => (
                <tr
                  key={school.id}
                  onClick={() => onSelectSchool(school.id)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-bold text-[#14213D] group-hover:text-blue-600">
                    {school.name}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">{school.code}</td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{school.vendorName}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">{school.internalSchoolId}</td>
                  <td className="py-3.5 px-3 text-slate-600">{school.schedule}</td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">{school.lastReconciliation}</td>
                  <td className="py-3.5 px-3 text-center">
                    <StatusBadge status={school.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSchoolForDrawer(school);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* School Detail Drawer / Modal */}
      {selectedSchoolForDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/30 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg h-full max-h-[90vh] rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-y-auto space-y-4 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#14213D]">{selectedSchoolForDrawer.name}</h3>
              <button onClick={() => setSelectedSchoolForDrawer(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">System & Merchant Mapping</span>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Internal School ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSchoolForDrawer.internalSchoolId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Merchant ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSchoolForDrawer.merchantId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Total Enrolled Students:</span>
                  <span className="font-bold text-slate-800">{selectedSchoolForDrawer.totalStudents}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Contact Details</span>
                <div className="text-slate-700">Email: {selectedSchoolForDrawer.contactEmail}</div>
                <div className="text-slate-700">Phone: {selectedSchoolForDrawer.contactPhone}</div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  onSelectSchool(selectedSchoolForDrawer.id);
                  setSelectedSchoolForDrawer(null);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-center"
              >
                Inspect Reconciliation →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
