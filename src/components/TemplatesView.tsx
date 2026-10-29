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

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
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
  } = useApp();

  const [editing, setEditing] = useState<TemplateConfig | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  }

  function startRename(t: TemplateConfig) {
    setRenamingId(t.id);
    setRenameValue(t.name);
  }

  function confirmRename(id: string) {
    const tpl = templates.find(t => t.id === id);
    if (tpl && renameValue.trim()) {
      saveTemplate({ ...tpl, name: renameValue.trim() });
      showToast('Template renamed', 'success');
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
            className="p-2 rounded-xl text-gray-500 hover:text-[#102A43] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-xs font-bold text-[#00B8D9] uppercase tracking-wider">Template Designer</div>
            <h1 className="text-xl font-extrabold text-[#102A43]">
              Editing "{editing.name}"
            </h1>
          </div>
        </div>

        <TemplateStep
          initial={editing}
          onSave={_t => {
            setEditing(null);
            showToast('Template saved', 'success');
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
            Design Assets
          </div>
          <h1 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
            Templates Library
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage reusable certificate templates, backdrop images, and typography models
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
          <span>New Custom Template</span>
        </button>
      </div>

      {/* Built-in Presets Catalog */}
      <div className="saas-card rounded-2xl p-6 border border-sky-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#102A43] flex items-center gap-2">
              <Sparkles size={16} className="text-[#FCE445]" />
              Official CertiFlow Presets
            </h2>
            <p className="text-xs text-gray-500">Ready-to-use professional vector templates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATE_PRESETS.map(preset => (
            <div
              key={preset.id}
              className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-[#00B8D9] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 mb-2.5 flex items-center justify-center p-1.5">
                  <div
                    className="w-full h-full transform scale-90 pointer-events-none group-hover:scale-95 transition-transform"
                    dangerouslySetInnerHTML={{ __html: preset.svg }}
                  />
                </div>
                <div className="text-[10px] font-bold text-[#00B8D9] uppercase tracking-wider">
                  {preset.category}
                </div>
                <h3 className="font-bold text-xs text-[#102A43] mt-0.5 truncate">{preset.name}</h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-400 capitalize">
                  {preset.orientation}
                </span>
                <button
                  type="button"
                  onClick={() => startBatchWithPreset(preset.id)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg text-white shadow-sm hover:opacity-90 flex items-center gap-1"
                  style={{ background: '#00B8D9' }}
                >
                  Use <ArrowRight size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Custom & Reusable Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#102A43] flex items-center gap-2">
            <Layers size={16} className="text-[#00B8D9]" />
            Your Saved Templates ({templates.length})
          </h2>
        </div>

        {templates.length === 0 ? (
          <div className="saas-card rounded-2xl border-2 border-dashed border-gray-200 p-14 text-center">
            <Layers size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-bold text-sm text-[#102A43]">No custom templates saved yet</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Create a new certificate template to reuse its styling across multiple batches.
            </p>
            <button
              type="button"
              onClick={() => {
                resetWizard();
                setView('create');
              }}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold"
              style={{ background: '#00B8D9' }}
            >
              Create First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className="saas-card rounded-2xl p-5 border border-sky-100 flex flex-col justify-between group hover:border-[#00B8D9]/50 transition-all"
              >
                <div>
                  {/* Thumbnail / Graphic */}
                  <div className="mb-3.5 rounded-xl overflow-hidden border border-gray-100 h-32 bg-gray-50 flex items-center justify-center p-1">
                    {tpl.templateImageData ? (
                      tpl.templateFileType === 'pdf' ? (
                        <div className="text-center text-gray-400 text-xs">
                          <div className="text-2xl mb-1">📄</div>
                          <span className="font-semibold text-gray-600">PDF Document Template</span>
                        </div>
                      ) : (
                        <img
                          src={tpl.templateImageData}
                          alt={tpl.name}
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : (
                      <div className="text-4xl text-gray-300">🎓</div>
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
                        className="flex-1 border border-[#00B8D9] rounded-lg px-2 py-1 text-xs font-bold text-[#102A43] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => confirmRename(tpl.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-bold text-sm text-[#102A43] truncate group-hover:text-[#00B8D9] transition-colors">
                      {tpl.name}
                    </h3>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock size={11} />
                    <span>{formatDate(tpl.updatedAt)}</span>
                    <span>•</span>
                    <span className="capitalize">{tpl.orientation}</span>
                    <span>•</span>
                    <span>{tpl.textStyle.fontFamily}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startBatchWithTemplate(tpl)}
                    className="flex-1 py-1.5 px-3 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    style={{ background: '#00B8D9' }}
                  >
                    <span>Use in Batch</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditing(tpl)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-[#102A43] transition-colors"
                    title="Edit Template"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => startRename(tpl)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-[#102A43] transition-colors"
                    title="Rename"
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => duplicateTemplate(tpl.id)}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-[#102A43] transition-colors"
                    title="Duplicate Template"
                  >
                    <Copy size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(tpl.id)}
                    className="p-2 rounded-xl border border-gray-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete Template"
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
