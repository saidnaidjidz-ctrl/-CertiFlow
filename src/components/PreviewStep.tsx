import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Maximize2,
  Sliders
} from 'lucide-react';
import PositionEditor from './PositionEditor';
import type { FontFamily } from '../types';

export default function PreviewStep() {
  const { currentTemplate, setCurrentTemplate, participants, setWizardStep, language, t } = useApp();

  const isRtl = language === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  const selected = participants.filter(p => p.selected);
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeIndex = selected.length > 0 ? Math.min(currentIndex, selected.length - 1) : 0;
  const currentParticipant = selected[safeIndex];

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : Math.max(0, selected.length - 1)));
  }, [selected.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev < selected.length - 1 ? prev + 1 : 0));
  }, [selected.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!currentTemplate || selected.length === 0) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        if (isRtl) handleNext();
        else handlePrev();
      }
      if (e.key === 'ArrowRight') {
        if (isRtl) handlePrev();
        else handleNext();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTemplate, selected.length, handlePrev, handleNext, isRtl]);

  if (!currentTemplate || selected.length === 0) {
    return (
      <div className="saas-card rounded-2xl p-12 text-center border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] max-w-lg mx-auto">
        <AlertTriangle size={36} className="mx-auto mb-3 text-amber-500" />
        <h3 className="font-bold text-base text-[#102A43] dark:text-white">{t('incompleteDataTitle')}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-5">
          {t('incompleteDataDesc')}
        </p>
        <button
          onClick={() => setWizardStep('names')}
          className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
          style={{ background: '#00B8D9' }}
        >
          {t('goToParticipantsBtn')}
        </button>
      </div>
    );
  }

  // Validation checks
  const longNames = selected.filter(p => p.name.length > 28);
  const duplicateNames = selected.filter(p => p.isDuplicate);
  const rtlNames = selected.filter(p => /[\u0600-\u06FF]/.test(p.name));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Inspector & Readiness Checklist (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        {/* Participant Switcher Card */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#102A43] dark:text-white uppercase tracking-wider">
              {t('participantSampleTitle')}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-[#00B8D9] font-mono">
              {t('sampleCounter', { current: safeIndex + 1, total: selected.length })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#162338] text-[#102A43] dark:text-gray-200 transition-colors"
              title={isRtl ? 'المشارك التالي' : 'Previous participant'}
            >
              {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <select
              value={safeIndex}
              onChange={e => setCurrentIndex(Number(e.target.value))}
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] rounded-xl px-3 py-2 text-xs font-bold text-[#102A43] dark:text-white focus:outline-none focus:border-[#00B8D9] truncate"
            >
              {selected.map((p, idx) => (
                <option key={p.id} value={idx}>
                  #{idx + 1}: {p.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#162338] text-[#102A43] dark:text-gray-200 transition-colors"
              title={isRtl ? 'المشارك السابق' : 'Next participant'}
            >
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00B8D9] h-full transition-all duration-200"
              style={{ width: `${((safeIndex + 1) / selected.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Typography Quick Controls ── */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] space-y-4">
          <span className="text-xs font-bold text-[#102A43] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={14} className="text-[#00B8D9]" />
            {t('typographyTitle')}
          </span>

          {/* Font Family */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
              {t('fontFamilyLabel')}
            </label>
            <select
              value={currentTemplate.textStyle.fontFamily}
              onChange={e =>
                setCurrentTemplate({
                  ...currentTemplate,
                  textStyle: { ...currentTemplate.textStyle, fontFamily: e.target.value as FontFamily },
                })
              }
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] rounded-xl px-3 py-2 text-xs font-semibold text-[#102A43] dark:text-white focus:outline-none focus:border-[#00B8D9]"
            >
              <option value="Amiri">Amiri (خط عربي كلاسيكي / Amiri Traditional)</option>
              <option value="Cairo">Cairo (خط عربي حديث / Modern Cairo)</option>
              <option value="Cinzel">Cinzel (Formal Classic)</option>
              <option value="Playfair">Playfair Display (Serif)</option>
              <option value="Inter">Plus Jakarta / Inter (Modern)</option>
              <option value="SpaceMono">Space Mono (Tech)</option>
              <option value="Helvetica">Helvetica / Arial</option>
              <option value="Times-Roman">Times New Roman</option>
            </select>
          </div>

          {/* Font Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {t('fontSizeLabel')}
              </label>
              <span className="text-xs font-bold text-[#00B8D9] font-mono">{currentTemplate.textStyle.fontSize} pt</span>
            </div>
            <input
              type="range"
              min={14}
              max={90}
              value={currentTemplate.textStyle.fontSize}
              onChange={e =>
                setCurrentTemplate({
                  ...currentTemplate,
                  textStyle: { ...currentTemplate.textStyle, fontSize: Number(e.target.value) },
                })
              }
              className="w-full accent-[#00B8D9] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
              <span>14 pt</span>
              <span>90 pt</span>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">
              {t('textColorLabel')}
            </label>
            <div className="flex items-center gap-2">
              {['#102A43', '#00B8D9', '#D97706', '#0F172A', '#35BFA3', '#8B5CF6', '#BE185D', '#ffffff'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      textStyle: { ...currentTemplate.textStyle, color },
                    })
                  }
                  className={`w-6 h-6 rounded-full border-2 transition-transform flex-shrink-0 ${
                    currentTemplate.textStyle.color.toLowerCase() === color.toLowerCase()
                      ? 'ring-2 ring-[#00B8D9] scale-110'
                      : 'border-gray-200 dark:border-gray-700 hover:scale-105'
                  }`}
                  style={{ background: color }}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={currentTemplate.textStyle.color}
                onChange={e =>
                  setCurrentTemplate({
                    ...currentTemplate,
                    textStyle: { ...currentTemplate.textStyle, color: e.target.value },
                  })
                }
                className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer ml-auto"
                title="Custom color"
              />
            </div>
          </div>
        </div>

        {/* Validation & Quality Checklist */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-[#1B2C42]">
            <span className="text-xs font-bold text-[#102A43] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#35BFA3]" />
              {t('validationTitle')}
            </span>
            <span className="text-[11px] font-bold text-[#35BFA3] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              {t('validationReadyBadge')}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <CheckCircle2 size={15} className="text-[#35BFA3] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#102A43] dark:text-white">{t('valTemplateConfigured')} </span>
                <span className="text-gray-500 dark:text-gray-400">{currentTemplate.name} ({currentTemplate.orientation})</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <CheckCircle2 size={15} className="text-[#35BFA3] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#102A43] dark:text-white">{t('valTypography')} </span>
                <span className="text-gray-500 dark:text-gray-400">{currentTemplate.textStyle.fontFamily} at {currentTemplate.textStyle.fontSize}pt</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <CheckCircle2 size={15} className="text-[#35BFA3] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#102A43] dark:text-white">{t('valTotalParticipants')} </span>
                <span className="text-gray-500 dark:text-gray-400">{selected.length}</span>
              </div>
            </div>

            {rtlNames.length > 0 && (
              <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <CheckCircle2 size={15} className="text-[#00B8D9] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-[#102A43] dark:text-white">{t('valArabicEngine')} </span>
                  <span className="text-gray-500 dark:text-gray-400">{t('valArabicEngineDesc')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Validation Warnings Notice */}
          {longNames.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-800 text-xs space-y-1">
              <div className="font-bold text-[#102A43] dark:text-white flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-[#00B8D9]" />
                {t('autoShrinkActiveTitle')}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] leading-relaxed">
                {t('autoShrinkActiveDesc', { count: longNames.length })}
              </p>
            </div>
          )}

          {duplicateNames.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />
                {t('duplicatesNoticeTitle', { count: duplicateNames.length })}
              </div>
              <p className="text-amber-700 dark:text-amber-400 text-[11px] leading-relaxed">
                {t('duplicatesNoticeDesc')}
              </p>
            </div>
          )}
        </div>

        {/* Generate Primary Hero Button */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] space-y-3 bg-gradient-to-b from-white to-cyan-50/30 dark:from-[#101B2B] dark:to-[#162338]">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center font-medium">
            {t('readyForExportTitle')}
          </div>
          <button
            type="button"
            onClick={() => setWizardStep('generate')}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-xl hover:shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #35BFA3 0%, #259E85 100%)' }}
          >
            <Zap size={18} className="text-[#FCE445]" />
            <span>{t('generateBatchBtn', { count: selected.length })}</span>
          </button>
          <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
            {t('estimatedTime')}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Live Full-Fidelity Certificate Preview (8 cols) */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-[#1B2C42]">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[#00B8D9]" />
              <h3 className="font-bold text-sm text-[#102A43] dark:text-white">
                {t('sampleCertViewTitle')}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <Maximize2 size={13} className="text-gray-400" />
              <span>{t('fullScaleSimulation')}</span>
            </div>
          </div>

          {/* Interactive Live Canvas for Sample Preview */}
          <div className="flex-1 flex items-center justify-center p-2 min-h-[480px]">
            <PositionEditor
              template={currentTemplate}
              onPositionChange={pos => {
                if (currentTemplate) {
                  setCurrentTemplate({
                    ...currentTemplate,
                    namePosition: pos,
                  });
                }
              }}
              sampleName={currentParticipant.name}
            />
          </div>
        </div>

        {/* Footer Navigation Back Button */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setWizardStep('names')}
            className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101B2B] text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#162338] transition-colors flex items-center gap-2"
          >
            <BackIcon size={15} />
            <span>{t('backToParticipantsBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => setWizardStep('generate')}
            className="px-8 py-3.5 rounded-2xl text-white text-xs font-bold shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
            style={{ background: '#35BFA3' }}
          >
            <Zap size={15} className="text-[#FCE445]" />
            <span>{t('proceedToExportBtn', { count: selected.length })}</span>
            <NextIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
