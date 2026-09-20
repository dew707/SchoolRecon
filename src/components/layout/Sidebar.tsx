import React from 'react';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  AlertOctagon,
  Building2,
  FolderArchive,
  Bot,
  CalendarClock,
  Activity,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'runs'
  | 'live-run'
  | 'school-detail'
  | 'exceptions'
  | 'exception-investigation'
  | 'matching'
  | 'vendors'
  | 'vendor-config'
  | 'schools'
  | 'artifacts'
  | 'ai-agent'
  | 'schedules'
  | 'monitoring'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'runs', label: 'Recon Runs', icon: Layers },
    { id: 'schools', label: 'Schools', icon: GraduationCap },
    { id: 'exceptions', label: 'Exceptions', icon: AlertOctagon, badge: '616', badgeColor: 'bg-rose-500' },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { id: 'artifacts', label: 'Files', icon: FolderArchive },
    { id: 'ai-agent', label: 'AI Agent', icon: Bot, badge: 'Live', badgeColor: 'bg-indigo-500' },
    { id: 'schedules', label: 'Schedules', icon: CalendarClock },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'audit', label: 'Audit', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`bg-[#071A36] text-white flex flex-col justify-between transition-all duration-300 select-none z-30 shrink-0 h-screen sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/30 shrink-0">
              SR
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  <span>SchoolRecon</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.2 rounded border border-blue-400/30">
                    PROD
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">Recon Control Center</div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              currentTab === item.id ||
              (item.id === 'runs' && currentTab === 'live-run') ||
              (item.id === 'schools' && currentTab === 'school-detail') ||
              (item.id === 'exceptions' && (currentTab === 'exception-investigation' || currentTab === 'matching')) ||
              (item.id === 'vendors' && currentTab === 'vendor-config');

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as NavTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip for collapsed view */}
                {isCollapsed && item.badge && (
                  <span
                    className={`absolute right-1 top-1 w-2 h-2 rounded-full ${item.badgeColor}`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User / Logout Footer */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          title="Sign out of SchoolRecon"
        >
          <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
