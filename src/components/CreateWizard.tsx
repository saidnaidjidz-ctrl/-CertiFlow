import { useApp } from '../context/AppContext';
import type { WizardStep } from '../types';
import { Check, ArrowLeft } from 'lucide-react';
import TemplateStep from './TemplateStep';
import NamesStep from './NamesStep';
import PreviewStep from './PreviewStep';
import GenerateStep from './GenerateStep';

const STEPS: { id: WizardStep; label: string; desc: string; number: number }[] = [
  { id: 'template', label: '1. Template', desc: 'Backdrop & Layout', number: 1 },
  { id: 'names', label: '2. Participants', desc: 'Import & Verify', number: 2 },
  { id: 'preview', label: '3. Preview', desc: 'Inspect & Validate', number: 3 },
  { id: 'generate', label: '4. Export', desc: 'Bulk Generation', number: 4 },
];

const STEP_ORDER: WizardStep[] = ['template', 'names', 'preview', 'generate'];

export default function CreateWizard() {
  const { wizardStep, setWizardStep, currentTemplate, participants, setView } = useApp();

  const currentIdx = STEP_ORDER.indexOf(wizardStep);

  function canNavigateTo(step: WizardStep): boolean {
    const idx = STEP_ORDER.indexOf(step);
    if (idx <= currentIdx) return true;
    if (step === 'names') return !!currentTemplate;
    if (step === 'preview') return !!currentTemplate && participants.length > 0;
    if (step === 'generate') return !!currentTemplate && participants.filter(p => p.selected).length > 0;
    return false;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Stepper Header */}
      <div className="saas-card rounded-2xl p-4 sm:p-5 border border-sky-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="p-2 rounded-xl text-gray-400 hover:text-[#102A43] hover:bg-gray-100 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00B8D9] uppercase tracking-wider">Batch Workflow</span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs font-semibold text-gray-500">
                  Step {currentIdx + 1} of 4
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-[#102A43] tracking-tight">
                {currentTemplate ? currentTemplate.name : 'Configure Certificate Batch'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {participants.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-[#35BFA3] border border-emerald-100">
                {participants.filter(p => p.selected).length} Participants Selected
              </span>
            )}
          </div>
        </div>

        {/* Responsive Step Tracker */}
        <div className="pt-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {STEPS.map((step, idx) => {
              const isDone = idx < currentIdx;
              const isActive = idx === currentIdx;
              const allowed = canNavigateTo(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => allowed && setWizardStep(step.id)}
                  disabled={!allowed}
                  className={`flex flex-col items-start p-2 sm:p-3 rounded-xl transition-all text-left group ${
                    isActive
                      ? 'bg-cyan-50/70 border border-cyan-200'
                      : isDone
                      ? 'hover:bg-gray-50 cursor-pointer'
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
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isDone ? <Check size={13} /> : step.number}
                    </div>
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-[#102A43]' : isDone ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <span className="hidden sm:block text-[11px] text-gray-400 truncate pl-8">
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
