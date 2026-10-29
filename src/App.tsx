import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar, { MobileMenuButton } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CreateWizard from './components/CreateWizard';
import TemplatesView from './components/TemplatesView';
import { GraduationCap, Plus, CheckCircle2, AlertCircle, Info, X, Sun, Moon, Languages } from 'lucide-react';

function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#102A43] text-white border-[#35BFA3]/40'
              : toast.type === 'error'
              ? 'bg-red-900 text-white border-red-500'
              : 'bg-[#102A43] text-white border-[#00B8D9]/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-[#35BFA3] flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-red-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-[#00B8D9] flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

function AppShell() {
  const { view, setView, resetWizard, theme, toggleTheme, language, setLanguage, t } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 bg-white/90 dark:bg-[#101B2B]/90 backdrop-blur-md border-b border-[#E4F0F4] dark:border-[#1B2C42] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#102A43] dark:bg-[#00B8D9] flex items-center justify-center text-white lg:hidden">
                <GraduationCap size={18} />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#102A43] dark:text-white lg:hidden">
                {t('appName')}
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="text-gray-400 dark:text-gray-500">{t('workspaceBreadcrumb')}</span>
              <span className="font-bold text-[#102A43] dark:text-white capitalize">
                {view === 'dashboard' ? t('navDashboard') : view === 'create' ? t('navNewBatch') : t('navTemplates')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#162338] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1E304C] transition-all"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Languages size={14} className="text-[#00B8D9]" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#162338] text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-[#1E304C] transition-all"
              title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {view !== 'create' && (
              <button
                type="button"
                onClick={() => {
                  resetWizard();
                  setView('create');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
                style={{ background: '#00B8D9' }}
              >
                <Plus size={14} />
                <span>{t('newBatchBtn')}</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Views Container */}
        <div className="flex-1 pb-16">
          {view === 'dashboard' && <Dashboard />}
          {view === 'create' && <CreateWizard />}
          {view === 'templates' && <TemplatesView />}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
