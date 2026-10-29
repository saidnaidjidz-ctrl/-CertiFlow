import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileImage,
  FileText,
  AlertCircle,
  RotateCcw,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Check,
  Layers,
  ArrowRight
} from 'lucide-react';
import type {
  TemplateConfig,
  PageSize,
  Orientation,
  TextAlign,
  FontFamily,
  TextStyle,
  NamePosition
} from '../types';
import { useApp } from '../context/AppContext';
import PositionEditor from './PositionEditor';
import { TEMPLATE_PRESETS, getPresetDataUrl, getPresetById } from '../services/templatePresets';

const DEFAULT_POSITION: NamePosition = {
  x: 12,
  y: 50,
  width: 76,
};

const SAMPLE_NAMES_TEST = [
  'Dr. Alexander Vance-Wright',
  'Sophia Elena Martinez',
  'Christopher Bartholomew-Montgomery',
  'فاطمة الزهراء المنصوري',
  'Maximilian Von Habsburg',
];

const PRESET_COLOR_SWATCHES = [
  '#102A43', // Deep Navy
  '#00B8D9', // Cyan
  '#D97706', // Gold / Amber
  '#0F172A', // Slate Black
  '#35BFA3', // Teal
  '#8B5CF6', // Royal Purple
  '#BE185D', // Crimson
];

interface Props {
  initial?: TemplateConfig;
  onSave?: (t: TemplateConfig) => void;
}

export default function TemplateStep({ initial, onSave }: Props) {
  const { setCurrentTemplate, currentTemplate, setWizardStep, saveTemplate } = useApp();

  const [template, setTemplate] = useState<TemplateConfig>(() => {
    if (initial) return initial;
    if (currentTemplate) return currentTemplate;
    // Default to the classic-excellence preset
    const preset = getPresetById('classic-excellence');
    return {
      id: crypto.randomUUID(),
      name: 'Academic Excellence Certificate',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pageSize: 'A4',
      orientation: 'landscape',
      presetId: preset.id,
      templateFileType: 'preset',
      templateImageData: getPresetDataUrl(preset.id),
      templateFileName: 'classic-excellence.svg',
      namePosition: { ...preset.defaultPosition },
      textStyle: {
        fontFamily: preset.defaultFont,
        fontSize: preset.defaultFontSize,
        color: preset.defaultColor,
        align: 'center',
        autoShrink: true,
        maxFontSize: 60,
        minFontSize: 18,
      },
    };
  });

  const [templateName, setTemplateName] = useState(template.name);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [sampleName, setSampleName] = useState(SAMPLE_NAMES_TEST[0]);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state to app context whenever template changes
  useEffect(() => {
    setCurrentTemplate(template);
  }, [template, setCurrentTemplate]);

  function update<K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) {
    setTemplate(prev => ({ ...prev, [key]: value }));
  }

  function updateStyle<K extends keyof TextStyle>(key: K, value: TextStyle[K]) {
    setTemplate(prev => ({
      ...prev,
      textStyle: { ...prev.textStyle, [key]: value },
    }));
  }

  function updatePosition(pos: NamePosition) {
    setTemplate(prev => ({ ...prev, namePosition: pos }));
  }

  function applyPreset(presetId: string) {
    const preset = getPresetById(presetId);
    setTemplate(prev => ({
      ...prev,
      name: `${preset.name} Certificate`,
      orientation: preset.orientation,
      presetId: preset.id,
      templateFileType: 'preset',
      templateImageData: getPresetDataUrl(preset.id),
      templateFileName: `${preset.id}.svg`,
      namePosition: { ...preset.defaultPosition },
      textStyle: {
        ...prev.textStyle,
        fontFamily: preset.defaultFont,
        fontSize: preset.defaultFontSize,
        color: preset.defaultColor,
      },
    }));
    setTemplateName(`${preset.name} Certificate`);
  }

  async function handleFile(file: File) {
    setError('');
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a valid PNG, JPG, or PDF file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      const fileType = file.type === 'application/pdf' ? 'pdf' : 'image';
      setTemplate(prev => ({
        ...prev,
        presetId: undefined,
        templateImageData: dataUrl,
        templateFileName: file.name,
        templateFileType: fileType,
      }));
      setActiveTab('upload');
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleCenterHorizontally() {
    updatePosition({
      ...template.namePosition,
      x: Math.max(0, (100 - template.namePosition.width) / 2),
    });
  }

  function handleCenterVertically() {
    updatePosition({
      ...template.namePosition,
      y: 50,
    });
  }

  function handleResetPosition() {
    updatePosition({ ...DEFAULT_POSITION });
  }

  function handleNext() {
    const finalTpl: TemplateConfig = {
      ...template,
      name: templateName.trim() || 'Custom Certificate Template',
      updatedAt: Date.now(),
    };
    saveTemplate(finalTpl);
    setCurrentTemplate(finalTpl);

    if (onSave) {
      onSave(finalTpl);
    } else {
      setWizardStep('names');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Controls & Settings (5 cols) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Template Source: Presets vs Upload */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-[#00B8D9]" />
              Certificate Backdrop
            </label>
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'presets' ? 'bg-white text-[#102A43] shadow-sm' : 'text-gray-500'
                }`}
              >
                Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'upload' ? 'bg-white text-[#102A43] shadow-sm' : 'text-gray-500'
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {activeTab === 'presets' ? (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_PRESETS.map(p => {
                  const isSelected = template.presetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-[#00B8D9] bg-cyan-50/60 ring-2 ring-[#00B8D9]/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="h-16 rounded-lg overflow-hidden bg-gray-50 mb-2 border border-gray-100 flex items-center justify-center p-1">
                        <div
                          className="w-full h-full pointer-events-none transform scale-90"
                          dangerouslySetInnerHTML={{ __html: p.svg }}
                        />
                      </div>
                      <div className="text-xs font-bold text-[#102A43] truncate">{p.name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{p.orientation} • {p.defaultFont}</div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00B8D9] text-white flex items-center justify-center text-[10px]">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragOver ? 'drag-over' : 'border-gray-200 hover:border-[#00B8D9]'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {template.templateFileName && template.templateFileType !== 'preset' ? (
                  <div className="flex items-center justify-center gap-3">
                    {template.templateFileType === 'pdf' ? (
                      <FileText size={26} className="text-[#00B8D9]" />
                    ) : (
                      <FileImage size={26} className="text-[#00B8D9]" />
                    )}
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-[#102A43] truncate max-w-[200px]">
                        {template.templateFileName}
                      </div>
                      <div className="text-[11px] text-gray-400 capitalize">{template.templateFileType} format</div>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        applyPreset('classic-excellence');
                        setActiveTab('presets');
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 ml-2"
                      title="Remove custom template"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={26} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-xs font-semibold text-[#102A43]">Drop custom PNG, JPG, or PDF here</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">High-resolution recommended (Max 20 MB)</p>
                  </>
                )}
              </div>
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-xs">
                  <AlertCircle size={13} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Template Metadata & Layout Options */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-1.5">
              Template Batch Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm text-[#102A43] font-medium focus:outline-none focus:border-[#00B8D9] transition-colors"
              placeholder="e.g. Stanford AI Summit 2026 Diploma"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Orientation</label>
              <select
                value={template.orientation}
                onChange={e => update('orientation', e.target.value as Orientation)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#00B8D9]"
              >
                <option value="landscape">Landscape (Standard)</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Page Size</label>
              <select
                value={template.pageSize}
                onChange={e => update('pageSize', e.target.value as PageSize)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#00B8D9]"
              >
                <option value="A4">A4 (297 × 210 mm)</option>
                <option value="Letter">US Letter</option>
                <option value="custom">Custom Dimensions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Typography Controls */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} className="text-[#00B8D9]" />
              Name Typography & Styling
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Font Family</label>
              <select
                value={template.textStyle.fontFamily}
                onChange={e => updateStyle('fontFamily', e.target.value as FontFamily)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#00B8D9]"
              >
                <option value="Cinzel">Cinzel (Formal Classic)</option>
                <option value="Playfair">Playfair Display (Serif)</option>
                <option value="Inter">Plus Jakarta / Inter (Modern)</option>
                <option value="Amiri">Amiri (خط عربي كلاسيكي / Traditional Arabic)</option>
                <option value="Cairo">Cairo (خط عربي حديث / Modern Arabic)</option>
                <option value="SpaceMono">Space Mono (Tech / Code)</option>
                <option value="Helvetica">Helvetica / Arial</option>
                <option value="Times-Roman">Times New Roman</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-600">Font Size (pt)</label>
                <span className="text-xs font-bold text-[#00B8D9]">{template.textStyle.fontSize} pt</span>
              </div>
              <input
                type="range"
                min={18}
                max={90}
                value={template.textStyle.fontSize}
                onChange={e => updateStyle('fontSize', Number(e.target.value))}
                className="w-full accent-[#00B8D9] cursor-pointer"
              />
            </div>
          </div>

          {/* Color Picker with Swatches */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Text Color</label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {PRESET_COLOR_SWATCHES.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateStyle('color', color)}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      template.textStyle.color.toLowerCase() === color.toLowerCase()
                        ? 'ring-2 ring-[#00B8D9] scale-110'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ background: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={template.textStyle.color}
                onChange={e => updateStyle('color', e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer ml-auto"
                title="Choose custom color"
              />
              <input
                type="text"
                value={template.textStyle.color}
                onChange={e => updateStyle('color', e.target.value)}
                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs font-mono text-center uppercase"
              />
            </div>
          </div>

          {/* Alignment Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Alignment</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { align: 'left', icon: <AlignLeft size={14} />, label: 'Left' },
                { align: 'center', icon: <AlignCenter size={14} />, label: 'Center' },
                { align: 'right', icon: <AlignRight size={14} />, label: 'Right' },
              ].map(({ align, icon, label }) => {
                const isSelected = template.textStyle.align === align;
                return (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateStyle('align', align as TextAlign)}
                    className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'bg-[#00B8D9] text-white border-[#00B8D9] shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-shrink constraint */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#102A43] block">Auto-shrink Long Names</span>
              <span className="text-[11px] text-gray-400">Scale down oversized names to prevent text overflow</span>
            </div>
            <input
              type="checkbox"
              checked={template.textStyle.autoShrink}
              onChange={e => updateStyle('autoShrink', e.target.checked)}
              className="w-4 h-4 accent-[#00B8D9] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Position Precision Coordinates & Center Helper */}
        <div className="saas-card rounded-2xl p-5 border border-sky-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              Exact Box Coordinates (%)
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCenterHorizontally}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-600 transition-colors"
                title="Center horizontally on page"
              >
                Center H
              </button>
              <button
                type="button"
                onClick={handleCenterVertically}
                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[11px] font-semibold text-gray-600 transition-colors"
                title="Center vertically on page"
              >
                Center V
              </button>
              <button
                type="button"
                onClick={handleResetPosition}
                className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                title="Reset position"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-gray-400 block mb-0.5">X Offset</span>
              <input
                type="number"
                min={0}
                max={90}
                value={Math.round(template.namePosition.x)}
                onChange={e => updatePosition({ ...template.namePosition, x: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono text-center font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block mb-0.5">Y Offset</span>
              <input
                type="number"
                min={0}
                max={90}
                value={Math.round(template.namePosition.y)}
                onChange={e => updatePosition({ ...template.namePosition, y: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono text-center font-bold"
              />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block mb-0.5">Width</span>
              <input
                type="number"
                min={10}
                max={100}
                value={Math.round(template.namePosition.width)}
                onChange={e => updatePosition({ ...template.namePosition, width: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono text-center font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Live Interactive Studio Canvas (7 cols) */}
      <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
        <div className="saas-card rounded-2xl p-5 border border-sky-100 flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-[#102A43] flex items-center gap-2">
                <Sparkles size={16} className="text-[#00B8D9]" />
                Live Certificate Studio
              </h3>
              <p className="text-xs text-gray-500">
                Drag the name placeholder directly on the certificate to position it perfectly.
              </p>
            </div>

            {/* Test Sample Name Switcher */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Test with:</span>
              <select
                value={sampleName}
                onChange={e => setSampleName(e.target.value)}
                className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#00B8D9]"
              >
                {SAMPLE_NAMES_TEST.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Large Live Interactive Canvas */}
          <div className="flex-1 flex items-center justify-center p-2 min-h-[460px]">
            <PositionEditor
              template={template}
              onPositionChange={updatePosition}
              sampleName={sampleName}
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/20 hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00B8D9 0%, #009BB8 100%)' }}
          >
            <span>Save & Continue to Participants</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
