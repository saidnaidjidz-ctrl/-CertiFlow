import { useState } from 'react';
import type { TemplateConfig } from '../types';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Check,
  X,
  Clock,
  ArrowRight,
  Layers,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import TemplateStep from './TemplateStep';
import { TEMPLATE_PRESETS } from '../services/templatePresets';

function formatDate(ts: number, lang: string) {
  return new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar-EG' : undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TemplatesView() {
  const {
    templates,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    startBatchWithTemplate,
    startBatchWithPreset,
    setView,
    resetWizard,
    showToast,
    language,
    t,
  } = useApp();

  const isRtl = language === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  const [editing, setEditing] = useState<TemplateConfig | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function handleDelete(id: string) {
    if (confirm(t('deleteConfirmMsg'))) {
      deleteTemplate(id);
    }
  }

  function startRename(tConfig: TemplateConfig) {
    setRenamingId(tConfig.id);
    setRenameValue(tConfig.name);
  }

  function confirmRename(id: string) {
    const tpl = templates.find(tItem => tItem.id === id);
    if (tpl && renameValue.trim()) {
      saveTemplate({ ...tpl, name: renameValue.trim() });
      showToast(language === 'ar' ? 'تمت إعادة تسمية القالب' : 'Template renamed', 'success');
    }
    setRenamingId(null);
  }

  if (editing) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="p-2 rounded-xl text-gray-500 hover:text-[#102A43] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#162338] transition-colors"
          >
            <BackIcon size={18} />
          </button>
          <div>
            <div className="text-xs font-bold text-[#00B8D9] uppercase tracking-wider">
              {language === 'ar' ? 'استوديو تصميم القوالب' : 'Template Designer'}
            </div>
            <h1 className="text-xl font-extrabold text-[#102A43] dark:text-white">
              {language === 'ar' ? `تعديل "${editing.name}"` : `Editing "${editing.name}"`}
            </h1>
          </div>
        </div>

        <TemplateStep
          initial={editing}
          onSave={_t => {
            setEditing(null);
            showToast(t('toastTemplateSaved'), 'success');
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-[#00B8D9] uppercase tracking-wider">
            {language === 'ar' ? 'أصول التصميم' : 'Design Assets'}
          </div>
          <h1 className="text-2xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            {t('templatesLibraryTitle')}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('templatesLibrarySub')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetWizard();
            setView('create');
          }}
          className="px-5 py-2.5 rounded-2xl text-white text-xs font-bold shadow hover:opacity-90 transition-opacity flex items-center gap-2 self-start sm:self-auto"
          style={{ background: '#00B8D9' }}
        >
          <Plus size={16} />
          <span>{t('createNewTemplateBtn')}</span>
        </button>
      </div>

      {/* Built-in Presets Catalog */}
      <div className="saas-card rounded-2xl p-6 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102A43] dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[#FCE445]" />
              {t('allPresetsTitle')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'قوالب متجهة احترافية جاهزة للاستخدام الفوري' : 'Ready-to-use professional vector templates'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_PRESETS.map(preset => (
            <div
              key={preset.id}
              className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] hover:border-[#00B8D9] dark:hover:border-[#00B8D9] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-24 rounded-lg overflow-hidden bg-gray-50 dark:bg-[#101B2B] border border-gray-100 dark:border-gray-800 mb-2.5 flex items-center justify-center p-1.5">
                  <div
                    className="w-full h-full transform scale-90 pointer-events-none group-hover:scale-95 transition-transform"
                    dangerouslySetInnerHTML={{ __html: preset.svg }}
                  />
                </div>
                <div className="text-[10px] font-bold text-[#00B8D9] uppercase tracking-wider">
                  {preset.category}
                </div>
                <h3 className="font-bold text-xs text-[#102A43] dark:text-white mt-0.5 truncate">{preset.name}</h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 capitalize">
                  {preset.orientation}
                </span>
                <button
                  type="button"
                  onClick={() => startBatchWithPreset(preset.id)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-white shadow-sm hover:opacity-90 flex items-center gap-1"
                  style={{ background: '#00B8D9' }}
                >
                  <span>{t('useTemplateBtn')}</span> <NextIcon size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Custom & Reusable Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#102A43] dark:text-white flex items-center gap-2">
            <Layers size={16} className="text-[#00B8D9]" />
            {t('customSavedTemplatesTitle')} ({templates.length})
          </h2>
        </div>

        {templates.length === 0 ? (
          <div className="saas-card rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101B2B] p-14 text-center">
            <Layers size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="font-bold text-sm text-[#102A43] dark:text-white">{t('noSavedTemplatesTitle')}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4 max-w-sm mx-auto">
              {t('noSavedTemplatesDesc')}
            </p>
            <button
              type="button"
              onClick={() => {
                resetWizard();
                setView('create');
              }}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow hover:opacity-90"
              style={{ background: '#00B8D9' }}
            >
              {t('createNewTemplateBtn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] flex flex-col justify-between group hover:border-[#00B8D9]/50 transition-all"
              >
                <div>
                  {/* Thumbnail / Graphic */}
                  <div className="mb-3.5 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 h-32 bg-gray-50 dark:bg-[#162338] flex items-center justify-center p-1">
                    {tpl.templateImageData ? (
                      tpl.templateFileType === 'pdf' ? (
                        <div className="text-center text-gray-400 text-xs">
                          <div className="text-2xl mb-1">📄</div>
                          <span className="font-semibold text-gray-600 dark:text-gray-300">PDF Document Template</span>
                        </div>
                      ) : (
                        <img
                          src={tpl.templateImageData}
                          alt={tpl.name}
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <div className="text-4xl text-gray-300 dark:text-gray-600">🎓</div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  {renamingId === tpl.id ? (
                    <div className="flex items-center gap-1.5 mb-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmRename(tpl.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        autoFocus
                        className="flex-1 border border-[#00B8D9] bg-white dark:bg-[#162338] text-[#102A43] dark:text-white rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                        dir="auto"
                      />
                      <button
                        type="button"
                        onClick={() => confirmRename(tpl.id)}
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-sm text-[#102A43] dark:text-white truncate group-hover:text-[#00B8D9] transition-colors" dir="auto">
                      {tpl.name}
                    </h3>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                    <Clock size={11} />
                    <span>{formatDate(tpl.updatedAt, language)}</span>
                    <span>•</span>
                    <span className="capitalize">{tpl.orientation}</span>
                    <span>•</span>
                    <span>{tpl.textStyle.fontFamily}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startBatchWithTemplate(tpl)}
                    className="flex-1 py-1.5 px-3 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    style={{ background: '#00B8D9' }}
                  >
                    <span>{language === 'ar' ? 'استخدام في دفعة' : 'Use in Batch'}</span>
                    <NextIcon size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(tpl)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E304C] hover:text-[#102A43] dark:hover:text-white transition-colors"
                    title={t('editTemplateBtn')}
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => startRename(tpl)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E304C] hover:text-[#102A43] dark:hover:text-white transition-colors"
                    title={t('renameTemplateBtn')}
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateTemplate(tpl.id)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1E304C] hover:text-[#102A43] dark:hover:text-white transition-colors"
                    title={t('duplicateTemplateBtn')}
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                    title={t('deleteTemplateBtn')}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
