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
  CheckCircle2,
  Maximize2,
  Sliders
} from 'lucide-react';
import PositionEditor from './PositionEditor';
import type { FontFamily } from '../types';

export default function PreviewStep() {
  const { currentTemplate, setCurrentTemplate, participants, setWizardStep } = useApp();

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
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTemplate, selected.length, handlePrev, handleNext]);

  if (!currentTemplate || selected.length === 0) {
    return (
      <div className="saas-card rounded-2xl p-12 text-center border border-sky-100 max-w-lg mx-auto">
        <AlertTriangle size={36} className="mx-auto mb-3 text-amber-500" />
        <h3 className="font-bold text-base text-[#102A43]">Incomplete Batch Data</h3>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          Please make sure you have chosen a template and added at least one participant.
        </p>
        <button
          onClick={() => setWizardStep('names')}
          className="px-5 py-2.5 rounded-xl text-white text-xs font-bold"
          style={{ background: '#00B8D9' }}
        >
          Go to Participants
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
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              Participant Sample
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-[#00B8D9] font-mono">
              {safeIndex + 1} of {selected.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-[#102A43] transition-colors"
              title="Previous participant (Left Arrow)"
            >
              <ChevronLeft size={16} />
            </button>

            <select
              value={safeIndex}
              onChange={e => setCurrentIndex(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-[#102A43] focus:outline-none focus:border-[#00B8D9] truncate"
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
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-[#102A43] transition-colors"
              title="Next participant (Right Arrow)"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00B8D9] h-full transition-all duration-200"
              style={{ width: `${((safeIndex + 1) / selected.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Typography Quick Controls ── */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-4">
          <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={14} className="text-[#00B8D9]" />
            Typography Controls
          </span>

          {/* Font Family */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Font Style</label>
            <select
              value={currentTemplate.textStyle.fontFamily}
              onChange={e =>
                setCurrentTemplate({
                  ...currentTemplate,
                  textStyle: { ...currentTemplate.textStyle, fontFamily: e.target.value as FontFamily },
                })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#00B8D9]"
            >
              <option value="Cinzel">Cinzel (Formal Classic)</option>
              <option value="Playfair">Playfair Display (Serif)</option>
              <option value="Inter">Plus Jakarta / Inter (Modern)</option>
              <option value="Amiri">Amiri — أميري (Arabic Traditional)</option>
              <option value="Cairo">Cairo — القاهرة (Arabic Modern)</option>
              <option value="SpaceMono">Space Mono (Tech)</option>
              <option value="Helvetica">Helvetica / Arial</option>
              <option value="Times-Roman">Times New Roman</option>
            </select>
          </div>

          {/* Font Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">Font Size</label>
              <span className="text-xs font-bold text-[#00B8D9]">{currentTemplate.textStyle.fontSize} pt</span>
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
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>14 pt</span>
              <span>90 pt</span>
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Text Color</label>
            <div className="flex items-center gap-2">
              {['#102A43','#00B8D9','#D97706','#0F172A','#35BFA3','#8B5CF6','#BE185D','#ffffff'].map(color => (
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
                      : 'border-gray-200 hover:scale-105'
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
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer ml-auto"
                title="Custom color"
              />
            </div>
          </div>
        </div>

        {/* Validation & Quality Checklist */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#35BFA3]" />
              Batch Pre-Flight Validation
            </span>
            <span className="text-[11px] font-bold text-[#35BFA3] bg-emerald-50 px-2 py-0.5 rounded-full">
              Ready
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2 text-gray-700">
              <CheckCircle2 size={15} className="text-[#35BFA3] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#102A43]">Template Configured: </span>
                <span className="text-gray-500">{currentTemplate.name} ({currentTemplate.orientation})</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-700">
              <CheckCircle2 size={15} className="text-[#35BFA3] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#102A43]">Typography & Layout: </span>
                <span className="text-gray-500">{currentTemplate.textStyle.fontFamily} at {currentTemplate.textStyle.fontSize}pt</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-gray-700">
              <CheckCircle2 size={15} className="text-[#35BFA3] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-[#102A43]">Total Participants: </span>
                <span className="text-gray-500">{selected.length} records selected</span>
              </div>
            </div>

            {rtlNames.length > 0 && (
              <div className="flex items-start gap-2 text-gray-700">
                <CheckCircle2 size={15} className="text-[#00B8D9] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-[#102A43]">Arabic RTL Engine: </span>
                  <span className="text-gray-500">{rtlNames.length} names detected & shaped</span>
                </div>
              </div>
            )}
          </div>

          {/* Validation Warnings Notice */}
          {longNames.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 text-xs space-y-1">
              <div className="font-bold text-[#102A43] flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-[#00B8D9]" />
                Auto-Shrink Optimization Active
              </div>
              <p className="text-gray-500 text-[11px] leading-relaxed">
                {longNames.length} participant{longNames.length !== 1 ? 's have' : ' has'} long names (e.g. "{longNames[0].name}").
                They will automatically scale down gracefully to fit inside the certificate bounds.
              </p>
            </div>
          )}

          {duplicateNames.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-600" />
                Notice: {duplicateNames.length} Duplicate Name{duplicateNames.length !== 1 ? 's' : ''}
              </div>
              <p className="text-amber-700 text-[11px] leading-relaxed">
                Duplicates will be saved with distinct numeric suffix tags (e.g. _2.pdf).
              </p>
            </div>
          )}
        </div>

        {/* Generate Primary Hero Button */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-3 bg-gradient-to-b from-white to-cyan-50/30">
          <div className="text-xs text-gray-500 text-center font-medium">
            Everything looks calibrated and ready for PDF rendering.
          </div>
          <button
            type="button"
            onClick={() => setWizardStep('generate')}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-sm shadow-xl hover:shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #35BFA3 0%, #259E85 100%)' }}
          >
            <Zap size={18} className="text-[#FCE445]" />
            <span>Generate {selected.length} Certificates</span>
          </button>
          <div className="text-[11px] text-gray-400 text-center">
            Estimated generation time: &lt; 2 seconds
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Live Full-Fidelity Certificate Preview (8 cols) */}
      <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
        <div className="saas-card rounded-2xl p-5 border border-sky-100 flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[#00B8D9]" />
              <h3 className="font-bold text-sm text-[#102A43]">
                Sample Certificate View
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Maximize2 size={13} className="text-gray-400" />
              <span>Full Scale Simulation</span>
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
            className="px-5 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={15} />
            <span>Back to Participants</span>
          </button>

          <button
            type="button"
            onClick={() => setWizardStep('generate')}
            className="px-8 py-3.5 rounded-2xl text-white text-xs font-bold shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
            style={{ background: '#35BFA3' }}
          >
            <Zap size={15} className="text-[#FCE445]" />
            <span>Proceed to Export ({selected.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
