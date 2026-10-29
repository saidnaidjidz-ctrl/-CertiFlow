import type { AppView } from '../types';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { view, setView, resetWizard, projects, templates, language, t } = useApp();

  const isRtl = language === 'ar';

  const navItems = [
    { label: t('navDashboard'), view: 'dashboard' as AppView, icon: <LayoutDashboard size={18} /> },
    { label: t('navNewBatch'), view: 'create' as AppView, badge: t('wizardBadge'), icon: <Sparkles size={18} /> },
    { label: t('navTemplates'), view: 'templates' as AppView, icon: <Layers size={18} /> },
  ];

  function navigate(v: AppView) {
    if (v === 'create' && view !== 'create') {
      resetWizard();
    }
    setView(v);
    onClose();
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0B1D30]/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 ${isRtl ? 'right-0' : 'left-0'} h-full w-64 z-40 flex flex-col
          transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${mobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
        `}
        style={{ background: '#102A43' }}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner relative group"
              style={{ background: 'linear-gradient(135deg, #00B8D9 0%, #35BFA3 100%)' }}>
              <GraduationCap size={22} className="text-white drop-shadow-sm" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#FCE445] border-2 border-[#102A43]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-extrabold text-lg tracking-tight">{t('appName')}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 text-[#00B8D9]">{t('proBadge')}</span>
              </div>
              <div className="text-[11px] text-white/50 tracking-wide font-medium">{t('appTagline')}</div>
            </div>
          </div>
          <button
            className="lg:hidden text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/5"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">{t('workspace')}</div>
              <div className="text-xs font-semibold text-white truncate">{t('workspaceTitle')}</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#35BFA3]" title={t('onlineSynced')} />
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => navigate(item.view)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 text-start group relative
                  ${isActive
                    ? 'text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
                style={isActive ? { background: '#00B8D9' } : {}}
              >
                <span className={`${isActive ? 'text-white' : 'text-white/60 group-hover:text-[#00B8D9]'} transition-colors`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  isRtl ? <ChevronLeft size={14} className="text-white/90" /> : <ChevronRight size={14} className="text-white/90" />
                )}
              </button>
            );
          })}

          {/* Quick Stats Section */}
          <div className="pt-6 px-2">
            <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">
              {language === 'ar' ? 'إحصاءات سريعة' : 'Quick Stats'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/[0.03]">
                <span className="text-white/60">{language === 'ar' ? 'الدفعات المحفوظة' : 'Saved Batches'}</span>
                <span className="font-semibold text-white font-mono">{projects.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/[0.03]">
                <span className="text-white/60">{language === 'ar' ? 'القوالب النشطة' : 'Active Templates'}</span>
                <span className="font-semibold text-white font-mono">{templates.length}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer: Local Privacy Guarantee */}
        <div className="p-4 border-t border-white/10 bg-[#0B1D30]/60">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded bg-[#35BFA3]/15 text-[#35BFA3] mt-0.5 flex-shrink-0">
              <ShieldCheck size={14} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90">
                {language === 'ar' ? 'معالجة محلية آمنة 100%' : '100% Client-Side Engine'}
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                {language === 'ar'
                  ? 'يتم توليد الشهادات وتجهيز البيانات داخل متصفحك دون رفعها لخوادم خارجية.'
                  : 'Participant data & PDFs are processed safely in your browser.'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
      style={{ background: '#102A43' }}
      aria-label="Open navigation menu"
    >
      <Menu size={20} />
    </button>
  );
}
