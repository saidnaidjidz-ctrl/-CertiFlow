import { useApp } from '../context/AppContext';
import type { WizardStep } from '../types';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import TemplateStep from './TemplateStep';
import NamesStep from './NamesStep';
import PreviewStep from './PreviewStep';
import GenerateStep from './GenerateStep';

const STEP_ORDER: WizardStep[] = ['template', 'names', 'preview', 'generate'];

export default function CreateWizard() {
  const { wizardStep, setWizardStep, currentTemplate, participants, setView, language, t } = useApp();

  const isRtl = language === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const currentIdx = STEP_ORDER.indexOf(wizardStep);

  const steps: { id: WizardStep; label: string; desc: string; number: number }[] = [
    { id: 'template', label: t('step1Label'), desc: t('step1Desc'), number: 1 },
    { id: 'names', label: t('step2Label'), desc: t('step2Desc'), number: 2 },
    { id: 'preview', label: t('step3Label'), desc: t('step3Desc'), number: 3 },
    { id: 'generate', label: t('step4Label'), desc: t('step4Desc'), number: 4 },
  ];

  function canNavigateTo(step: WizardStep): boolean {
    const idx = STEP_ORDER.indexOf(step);
    if (idx <= currentIdx) return true;
    if (step === 'names') return !!currentTemplate;
    if (step === 'preview') return !!currentTemplate && participants.length > 0;
    if (step === 'generate') return !!currentTemplate && participants.filter(p => p.selected).length > 0;
    return false;
  }

  const selectedCount = participants.filter(p => p.selected).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Stepper Header */}
      <div className="saas-card rounded-2xl p-4 sm:p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-[#1B2C42]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="p-2 rounded-xl text-gray-400 hover:text-[#102A43] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#162338] transition-colors"
              title={t('returnToDashboard')}
            >
              <BackIcon size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00B8D9] uppercase tracking-wider">{t('batchWorkflow')}</span>
                <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t('stepCounter', { current: currentIdx + 1, total: 4 })}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
                {currentTemplate ? currentTemplate.name : t('configureBatch')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {participants.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#35BFA3] border border-emerald-100 dark:border-emerald-800/40">
                {t('participantsSelectedPill', { count: selectedCount })}
              </span>
            )}
          </div>
        </div>

        {/* Responsive Step Tracker */}
        <div className="pt-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {steps.map((step, idx) => {
              const isDone = idx < currentIdx;
              const isActive = idx === currentIdx;
              const allowed = canNavigateTo(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => allowed && setWizardStep(step.id)}
                  disabled={!allowed}
                  className={`flex flex-col items-start p-2 sm:p-3 rounded-xl transition-all text-start group ${
                    isActive
                      ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800'
                      : isDone
                      ? 'hover:bg-gray-50 dark:hover:bg-[#162338] cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-[#35BFA3] text-white'
                          : isActive
                          ? 'bg-[#00B8D9] text-white shadow-sm ring-2 ring-[#00B8D9]/20'
                          : 'bg-gray-100 dark:bg-[#162338] text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {isDone ? <Check size={13} /> : step.number}
                    </div>
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive
                          ? 'text-[#102A43] dark:text-white'
                          : isDone
                          ? 'text-gray-700 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <span className="hidden sm:block text-[11px] text-gray-400 dark:text-gray-500 truncate rtl:pr-8 ltr:pl-8">
                    {step.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step View Content */}
      <div className="min-h-[500px]">
        {wizardStep === 'template' && <TemplateStep />}
        {wizardStep === 'names' && <NamesStep />}
        {wizardStep === 'preview' && <PreviewStep />}
        {wizardStep === 'generate' && <GenerateStep />}
      </div>
    </div>
  );
}
