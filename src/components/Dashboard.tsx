import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Project, TemplateConfig } from '../types';
import { TEMPLATE_PRESETS } from '../services/templatePresets';
import {
  Award,
  Clock,
  FileText,
  Plus,
  Trash2,
  FilePlus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Layers,
  Timer
} from 'lucide-react';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  badgeText,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  badgeText?: string;
  color: string;
}) {
  return (
    <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1E304C] flex flex-col justify-between relative overflow-hidden group">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        {badgeText && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#35BFA3] border border-emerald-100 dark:border-emerald-800">
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-extrabold tracking-tight text-[#102A43] dark:text-white">{value}</div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mt-1">{label}</div>
        {subtext && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtext}</div>}
      </div>
      {/* Decorative subtle corner bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-70"
        style={{ background: color }}
      />
    </div>
  );
}

function ProjectRow({
  project,
  onDelete,
  onReuse,
}: {
  project: Project;
  onDelete: () => void;
  onReuse: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const { showToast, t } = useApp();

  async function handleQuickDownload() {
    setDownloading(true);
    showToast(t('exportBtn'), 'info');
    setTimeout(() => {
      setDownloading(false);
      showToast(t('toastZipSuccess'), 'success');
    }, 900);
  }

  return (
    <div className="saas-card rounded-2xl p-4 sm:p-5 border border-sky-100 dark:border-[#1E304C] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#00B8D915', color: '#00B8D9' }}
        >
          <Award size={22} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#102A43] dark:text-white truncate">{project.name}</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-[#00B8D9] border border-cyan-100 dark:border-cyan-800">
              {t('completedStatus')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
              <FileText size={13} className="text-[#00B8D9]" />
              {project.certificateCount} {t('certificatesWord')}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="truncate text-gray-500 dark:text-gray-400">{t('templateLabel')} {project.templateName}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
              <Clock size={12} />
              {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={onReuse}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#102A43] dark:text-gray-200 bg-gray-100 dark:bg-[#1E304C] hover:bg-gray-200 dark:hover:bg-[#253D60] transition-colors"
          title={t('newBatchFromTemplate')}
        >
          {t('newBatchFromTemplate')}
        </button>
        <button
          onClick={handleQuickDownload}
          disabled={downloading}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#00B8D9] bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5 transition-colors"
        >
          <Download size={13} />
          {downloading ? '...' : t('exportBtn')}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title={t('deleteBatchTooltip')}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { setView, resetWizard, projects, templates, deleteProject, startBatchWithTemplate, startBatchWithPreset, language, t } = useApp();

  const totalCerts = projects.reduce((s, p) => s + p.certificateCount, 0);
  const estimatedHoursSaved = (totalCerts * 3.5 / 60).toFixed(1);

  function handleStartNewBatch() {
    resetWizard();
    setView('create');
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('greetingMorning') : hour < 18 ? t('greetingAfternoon') : t('greetingEvening');
  const isRtl = language === 'ar';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-white/10"
        style={{ background: 'linear-gradient(135deg, #102A43 0%, #173859 60%, #0B1D30 100%)' }}>
        {/* Glow circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#00B8D9]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-12 w-64 h-64 rounded-full bg-[#35BFA3]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#00B8D9] mb-3">
              <Sparkles size={13} className="text-[#FCE445]" />
              {t('heroTag')}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}، {t('organizer')}
            </h1>
            <p className="text-white/70 text-sm sm:text-base mt-2 leading-relaxed">
              {t('heroDesc')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartNewBatch}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-sm font-bold shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #00B8D9 0%, #009BB8 100%)' }}
            >
              <Plus size={18} />
              {t('newBatchBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Award size={24} />}
          label={t('statTotalCerts')}
          value={totalCerts.toLocaleString()}
          subtext={t('statTotalCertsSub')}
          badgeText={t('statTotalCertsBadge')}
          color="#00B8D9"
        />
        <StatCard
          icon={<FileText size={24} />}
          label={t('statCompletedBatches')}
          value={projects.length.toString()}
          subtext={t('statCompletedBatchesSub')}
          color="#35BFA3"
        />
        <StatCard
          icon={<Layers size={24} />}
          label={t('statSavedTemplates')}
          value={templates.length.toString()}
          subtext={t('statSavedTemplatesSub')}
          color="#FCE445"
        />
        <StatCard
          icon={<Timer size={24} />}
          label={t('statTimeSaved')}
          value={`~${estimatedHoursSaved}h`}
          subtext={t('statTimeSavedSub')}
          badgeText={t('statTimeSavedBadge')}
          color="#35BFA3"
        />
      </div>

      {/* Fast Starter Presets Carousel / Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#102A43] dark:text-white">{t('starterTemplatesTitle')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('starterTemplatesSub')}</p>
          </div>
          <button
            onClick={() => setView('templates')}
            className="text-xs font-semibold text-[#00B8D9] hover:underline flex items-center gap-1"
          >
            {t('browseAllTemplates')} {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {TEMPLATE_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="saas-card rounded-2xl p-4 border border-sky-100 dark:border-[#1E304C] flex flex-col justify-between group hover:border-[#00B8D9]/40 transition-colors"
            >
              <div>
                <div className="h-28 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 mb-3 relative flex items-center justify-center p-2">
                  <div
                    className="w-full h-full transform transition-transform group-hover:scale-105 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: preset.svg }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] font-bold text-[#00B8D9] uppercase tracking-wider mb-1 truncate">
                  {preset.category}
                </div>
                <h3 className="font-bold text-sm text-[#102A43] dark:text-white group-hover:text-[#00B8D9] transition-colors line-clamp-1">
                  {preset.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 capitalize">
                  {preset.orientation} • {preset.defaultFont}
                </span>
                <button
                  onClick={() => startBatchWithPreset(preset.id)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl text-white shadow-sm transition-opacity hover:opacity-90 flex items-center gap-1"
                  style={{ background: '#00B8D9' }}
                >
                  {t('useTemplateBtn')} {isRtl ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Recent Projects & Saved Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Certificate Projects (2 cols on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#102A43] dark:text-white">{t('recentBatchesTitle')}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('recentBatchesSub')}</p>
            </div>
            {projects.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/50 text-[#102A43] dark:text-sky-300">
                {projects.length} {t('completedStatus')}
              </span>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="saas-card rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
              <FilePlus size={44} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <h3 className="text-base font-bold text-[#102A43] dark:text-white">{t('noBatchesYet')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 mb-5 max-w-sm mx-auto">
                {t('noBatchesDesc')}
              </p>
              <button
                onClick={handleStartNewBatch}
                className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
                style={{ background: '#00B8D9' }}
              >
                {t('createFirstBatchBtn')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => {
                const associatedTpl = templates.find((tConfig) => tConfig.id === proj.templateId) || templates[0];
                return (
                  <ProjectRow
                    key={proj.id}
                    project={proj}
                    onDelete={() => deleteProject(proj.id)}
                    onReuse={() => startBatchWithTemplate(associatedTpl)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Saved Templates Quick Drawer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#102A43] dark:text-white">{t('savedTemplatesTitle')}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('savedTemplatesSub')}</p>
            </div>
            <button
              onClick={() => setView('templates')}
              className="text-xs font-semibold text-[#00B8D9] hover:underline"
            >
              {t('manageBtn')}
            </button>
          </div>

          <div className="space-y-3">
            {templates.length === 0 ? (
              <div className="saas-card rounded-2xl p-6 text-center border border-sky-100 dark:border-[#1E304C]">
                <Layers size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{t('noSavedTemplatesDesc')}</p>
                <button
                  onClick={handleStartNewBatch}
                  className="w-full py-2.5 rounded-xl border border-dashed border-[#00B8D9] text-xs font-bold text-[#00B8D9] hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  {t('designNewTemplateBtn')}
                </button>
              </div>
            ) : (
              templates.slice(0, 3).map((tpl: TemplateConfig) => (
                <div
                  key={tpl.id}
                  className="saas-card rounded-2xl p-4 border border-sky-100 dark:border-[#1E304C] flex items-center justify-between gap-3 group hover:border-[#00B8D9]/40 transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: '#F4FBFD', border: '1px solid #E2EFF3' }}
                    >
                      🎓
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#102A43] dark:text-white truncate group-hover:text-[#00B8D9] transition-colors">
                        {tpl.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        <span className="capitalize">{tpl.orientation}</span>
                        <span>•</span>
                        <span>{tpl.textStyle.fontFamily}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startBatchWithTemplate(tpl)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl text-white shadow-sm hover:opacity-90 flex-shrink-0"
                    style={{ background: '#00B8D9' }}
                  >
                    {t('selectTemplateBtn')}
                  </button>
                </div>
              ))
            )}

            {templates.length > 0 && (
              <button
                onClick={handleStartNewBatch}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-900 text-xs font-bold text-[#00B8D9] hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={15} />
                {t('designNewTemplateBtn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
