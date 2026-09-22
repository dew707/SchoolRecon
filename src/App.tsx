import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { OperationsDashboardPage } from './pages/OperationsDashboardPage';
import { ReconRunsPage } from './pages/ReconRunsPage';
import { LiveRunMonitorPage } from './pages/LiveRunMonitorPage';
import { SchoolReconDetailPage } from './pages/SchoolReconDetailPage';
import { ExceptionCenterPage } from './pages/ExceptionCenterPage';
import { ExceptionInvestigationPage } from './pages/ExceptionInvestigationPage';
import { TransactionMatchingPage } from './pages/TransactionMatchingPage';
import { VendorManagementPage } from './pages/VendorManagementPage';
import { VendorConfigPage } from './pages/VendorConfigPage';
import { SchoolManagementPage } from './pages/SchoolManagementPage';
import { ArtifactCenterPage } from './pages/ArtifactCenterPage';
import { AiAgentCenterPage } from './pages/AiAgentCenterPage';
import { ScheduleManagementPage } from './pages/ScheduleManagementPage';
import { SystemMonitoringPage } from './pages/SystemMonitoringPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Deep entity navigation context
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('SCH-001');
  const [selectedExceptionId, setSelectedExceptionId] = useState<string>('EX-009821');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('VEND-01');

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const handleNavigate = (tab: NavTab, entityId?: string) => {
    if (tab === 'school-detail' && entityId) setSelectedSchoolId(entityId);
    if (tab === 'exception-investigation' && entityId) setSelectedExceptionId(entityId);
    if (tab === 'vendor-config' && entityId) setSelectedVendorId(entityId);

    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#14213D] flex flex-col md:flex-row antialiased">
      {/* Desktop & Tablet Sidebar */}
      <div className={`${isMobileMenuOpen ? 'block fixed inset-0 z-40' : 'hidden md:block'}`}>
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => handleNavigate(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={() => setIsAuthenticated(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigate={tab => handleNavigate(tab)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <OperationsDashboardPage
              onSelectSchool={id => handleNavigate('school-detail', id)}
              onNavigateRuns={() => handleNavigate('runs')}
              onNavigateExceptions={() => handleNavigate('exceptions')}
            />
          )}

          {currentTab === 'runs' && (
            <ReconRunsPage
              onSelectRun={id => handleNavigate('live-run', id)}
              onOpenLiveMonitor={id => handleNavigate('live-run', id)}
            />
          )}

          {currentTab === 'live-run' && (
            <LiveRunMonitorPage
              onSelectSchool={id => handleNavigate('school-detail', id)}
            />
          )}

          {currentTab === 'school-detail' && (
            <SchoolReconDetailPage
              schoolId={selectedSchoolId}
              onNavigateException={exId => handleNavigate('exception-investigation', exId)}
              onNavigateArtifacts={() => handleNavigate('artifacts')}
            />
          )}

          {currentTab === 'exceptions' && (
            <ExceptionCenterPage
              onSelectException={id => handleNavigate('exception-investigation', id)}
              onOpenMatching={id => handleNavigate('matching', id)}
            />
          )}

          {currentTab === 'exception-investigation' && (
            <ExceptionInvestigationPage
              exceptionId={selectedExceptionId}
              onBack={() => handleNavigate('exceptions')}
              onOpenMatching={() => handleNavigate('matching')}
              onNavigateArtifacts={() => handleNavigate('artifacts')}
            />
          )}

          {currentTab === 'matching' && (
            <TransactionMatchingPage
              onBack={() => handleNavigate('exception-investigation')}
              onComplete={() => handleNavigate('exceptions')}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorManagementPage
              onConfigureVendor={id => handleNavigate('vendor-config', id)}
              onViewSchools={vendorName => handleNavigate('schools')}
            />
          )}

          {currentTab === 'vendor-config' && (
            <VendorConfigPage
              vendorId={selectedVendorId}
              onBack={() => handleNavigate('vendors')}
            />
          )}

          {currentTab === 'schools' && (
            <SchoolManagementPage
              onSelectSchool={id => handleNavigate('school-detail', id)}
            />
          )}

          {currentTab === 'artifacts' && (
            <ArtifactCenterPage
              onSelectRun={runId => handleNavigate('runs', runId)}
            />
          )}

          {currentTab === 'ai-agent' && (
            <AiAgentCenterPage
              onNavigateException={exId => handleNavigate('exception-investigation', exId)}
            />
          )}

          {currentTab === 'schedules' && <ScheduleManagementPage />}

          {currentTab === 'monitoring' && <SystemMonitoringPage />}

          {currentTab === 'audit' && <AuditTrailPage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab, id) => handleNavigate(tab, id)}
      />
    </div>
  );
};

export default App;
