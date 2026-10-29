import { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Users,
  Search,
  Download,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import type { Participant } from '../types';
import {
  parseTextNames,
  parseExcelFile,
  extractParticipantsFromExcel,
  SAMPLE_NAMES,
  downloadSampleCsv,
} from '../services/fileParser';
import type { ExcelPreview } from '../services/fileParser';
import { useApp } from '../context/AppContext';

export default function NamesStep() {
  const { participants, setParticipants, setWizardStep, showToast } = useApp();

  const [inputTab, setInputTab] = useState<'paste' | 'excel'>('paste');
  const [textInput, setTextInput] = useState('');
  const [excelPreview, setExcelPreview] = useState<ExcelPreview | null>(null);
  const [excelBuffer, setExcelBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newSingleName, setNewSingleName] = useState('');

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleTextImport() {
    if (!textInput.trim()) return;
    const parsed = parseTextNames(textInput);
    if (parsed.length === 0) return;

    const existingNames = new Set(participants.map(p => p.name.trim().toLowerCase()));
    const enriched = parsed.map(p => ({
      ...p,
      isDuplicate: p.isDuplicate || existingNames.has(p.name.trim().toLowerCase())
    }));

    setParticipants([...participants, ...enriched]);
    setTextInput('');
    showToast(`Added ${parsed.length} participants`, 'success');
  }

  function handleLoadSampleList() {
    const parsed = parseTextNames(SAMPLE_NAMES.join('\n'));
    const existingNames = new Set(participants.map(p => p.name.trim().toLowerCase()));
    const enriched = parsed.map(p => ({
      ...p,
      isDuplicate: p.isDuplicate || existingNames.has(p.name.trim().toLowerCase())
    }));
    setParticipants([...participants, ...enriched]);
    showToast(`Loaded ${parsed.length} sample participants`, 'info');
  }

  async function handleExcelFile(file: File) {
    setError('');
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      setExcelBuffer(buffer);
      const preview = parseExcelFile(buffer, 0);
      setExcelPreview(preview);
      setSelectedColumn(0);
      setSelectedSheet(0);
      showToast(`Loaded "${file.name}" with ${preview.rows.length} rows`, 'info');
    } catch {
      setError('Failed to parse file. Please verify the format or try a CSV.');
    }
  }

  function handleSheetChange(sheetIdx: number) {
    setSelectedSheet(sheetIdx);
    setSelectedColumn(0);
    if (excelBuffer) {
      try {
        const preview = parseExcelFile(excelBuffer, sheetIdx);
        setExcelPreview(preview);
      } catch {
        setError('Failed to switch worksheet.');
      }
    }
  }

  function importFromExcel() {
    if (!excelBuffer || !excelPreview) return;
    const parsed = extractParticipantsFromExcel(excelPreview, excelBuffer, selectedSheet, selectedColumn);
    if (parsed.length === 0) {
      setError('No names found in the selected column.');
      return;
    }

    const existingNames = new Set(participants.map(p => p.name.trim().toLowerCase()));
    const enriched = parsed.map(p => ({
      ...p,
      isDuplicate: p.isDuplicate || existingNames.has(p.name.trim().toLowerCase())
    }));

    setParticipants([...participants, ...enriched]);
    setExcelPreview(null);
    setExcelBuffer(null);
    showToast(`Imported ${parsed.length} participants from Excel`, 'success');
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  }

  function toggleSelect(id: string) {
    setParticipants(participants.map(p => (p.id === id ? { ...p, selected: !p.selected } : p)));
  }

  function removeParticipant(id: string) {
    setParticipants(participants.filter(p => p.id !== id));
  }

  function startEdit(p: Participant) {
    setEditingId(p.id);
    setEditValue(p.name);
  }

  function confirmEdit(id: string) {
    if (!editValue.trim()) return;
    setParticipants(participants.map(p => (p.id === id ? { ...p, name: editValue.trim() } : p)));
    setEditingId(null);
    showToast('Name updated', 'success');
  }

  function selectAll(v: boolean) {
    setParticipants(participants.map(p => ({ ...p, selected: v })));
  }

  function removeDuplicates() {
    const seen = new Set<string>();
    const filtered = participants.filter(p => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const removedCount = participants.length - filtered.length;
    setParticipants(filtered.map(p => ({ ...p, isDuplicate: false })));
    showToast(`Removed ${removedCount} duplicate entries`, 'success');
  }

  function handleAddSingleName() {
    if (!newSingleName.trim()) return;
    const newP: Participant = {
      id: crypto.randomUUID(),
      name: newSingleName.trim(),
      selected: true,
      isDuplicate: participants.some(p => p.name.trim().toLowerCase() === newSingleName.trim().toLowerCase()),
    };
    setParticipants([newP, ...participants]);
    setNewSingleName('');
    showToast(`Added "${newP.name}"`, 'success');
  }

  const selected = participants.filter(p => p.selected);
  const dupes = participants.filter(p => p.isDuplicate);

  // Search filter
  const displayedParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Input Methods (Paste or Excel) - 5 cols */}
      <div className="lg:col-span-5 space-y-5">
        <div className="saas-card rounded-2xl p-5 border border-sky-100">
          {/* Segmented Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-xs font-bold text-[#102A43] uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} className="text-[#00B8D9]" />
              Import Participants
            </h3>
            <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputTab('paste')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputTab === 'paste' ? 'bg-white text-[#102A43] shadow-sm' : 'text-gray-500'
                }`}
              >
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setInputTab('excel')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputTab === 'excel' ? 'bg-white text-[#102A43] shadow-sm' : 'text-gray-500'
                }`}
              >
                Excel / CSV
              </button>
            </div>
          </div>

          {inputTab === 'paste' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600">
                  Enter or paste names (one per line)
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleList}
                  className="text-xs font-bold text-[#00B8D9] hover:underline flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  Load 15 Sample Names
                </button>
              </div>

              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-[#102A43] font-medium resize-none focus:outline-none focus:border-[#00B8D9] transition-colors scrollbar-thin"
                rows={9}
                placeholder={"Dr. Arthur Vance\nSophia Martinez\nLiam O'Connor\nفاطمة الزهراء المنصوري\nChristopher Bartholomew"}
                dir="auto"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {textInput.split('\n').filter(l => l.trim().length > 0).length} names detected
                </span>
                <button
                  type="button"
                  onClick={handleTextImport}
                  disabled={!textInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{ background: '#00B8D9' }}
                >
                  Add Names to List
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver ? 'drag-over' : 'border-gray-200 hover:border-[#00B8D9]'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleExcelFile(e.target.files[0])}
                />
                <FileSpreadsheet size={32} className="mx-auto mb-2 text-[#00B8D9]" />
                <p className="text-xs font-bold text-[#102A43]">Drop Excel spreadsheet or CSV here</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Supports .xlsx, .xls, and .csv files</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Need a template format?</span>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="font-bold text-[#00B8D9] hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  Download Sample CSV
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs p-2.5 rounded-xl bg-red-50">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Excel Preview & Column Mapper */}
              {excelPreview && (
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-[#102A43]">
                    <span>Map Spreadsheet Columns</span>
                    <span className="text-gray-400">{excelPreview.rows.length} total rows</span>
                  </div>

                  {excelPreview.sheetNames.length > 1 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Worksheet</label>
                      <select
                        value={selectedSheet}
                        onChange={e => handleSheetChange(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold"
                      >
                        {excelPreview.sheetNames.map((name, i) => (
                          <option key={i} value={i}>{name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Select Participant Name Column:
                    </label>
                    <select
                      value={selectedColumn}
                      onChange={e => setSelectedColumn(Number(e.target.value))}
                      className="w-full border border-[#00B8D9] rounded-xl px-3 py-2 text-xs font-bold text-[#102A43] bg-cyan-50/50"
                    >
                      {excelPreview.headers.map((h, i) => (
                        <option key={i} value={i}>
                          Column {i + 1}: {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Micro Table Preview */}
                  <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-48 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-[11px] whitespace-nowrap">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {excelPreview.headers.map((h, i) => (
                            <th
                              key={i}
                              className={`px-3 py-1.5 text-left font-bold ${
                                i === selectedColumn ? 'text-[#00B8D9] bg-cyan-50' : 'text-gray-500'
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelPreview.rows.slice(0, 5).map((row, ri) => (
                          <tr key={ri} className="border-b border-gray-100">
                            {excelPreview.headers.map((_, ci) => (
                              <td
                                key={ci}
                                className={`px-3 py-1.5 truncate max-w-[160px] ${
                                  ci === selectedColumn ? 'font-bold text-[#102A43] bg-cyan-50/40' : 'text-gray-500'
                                }`}
                              >
                                {row[ci] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={importFromExcel}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold shadow hover:opacity-90 transition-opacity"
                    style={{ background: '#35BFA3' }}
                  >
                    Confirm & Import Participants
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Add Single Participant Form */}
        <div className="saas-card rounded-2xl p-4 border border-sky-100">
          <label className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2 block">
            Add Individual Participant
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSingleName}
              onChange={e => setNewSingleName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddSingleName(); }}
              placeholder="e.g. Dr. Hina Takahashi"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-[#102A43] focus:outline-none focus:border-[#00B8D9]"
              dir="auto"
            />
            <button
              type="button"
              onClick={handleAddSingleName}
              disabled={!newSingleName.trim()}
              className="px-3 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-40 transition-opacity flex items-center gap-1 flex-shrink-0"
              style={{ background: '#00B8D9' }}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Participant Data Table (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        <div className="saas-card rounded-2xl border border-sky-100 flex-1 flex flex-col overflow-hidden min-h-[500px]">
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#102A43]">Participant Records</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-[#00B8D9] border border-cyan-100">
                {selected.length} / {participants.length} Selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              {dupes.length > 0 && (
                <button
                  type="button"
                  onClick={removeDuplicates}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  Remove {dupes.length} Duplicates
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <button type="button" onClick={() => selectAll(true)} className="hover:text-[#00B8D9]">All</button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={() => selectAll(false)} className="hover:text-[#00B8D9]">None</button>
                {participants.length > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setParticipants([])}
                      className="text-red-400 hover:text-red-600"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search bar */}
          {participants.length > 0 && (
            <div className="px-5 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search participant names..."
                className="bg-transparent border-none text-xs text-[#102A43] placeholder-gray-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Table / List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 divide-y divide-gray-100 max-h-[480px]">
            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center text-[#00B8D9] mb-3">
                  <Upload size={28} />
                </div>
                <h4 className="font-bold text-sm text-[#102A43]">No participants imported</h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1 mb-4">
                  Paste a list of names or upload an Excel spreadsheet on the left to populate the certificates.
                </p>
                <button
                  type="button"
                  onClick={handleLoadSampleList}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow hover:opacity-90 flex items-center gap-1.5"
                  style={{ background: '#00B8D9' }}
                >
                  <Sparkles size={13} />
                  Load Sample List (15 Names)
                </button>
              </div>
            ) : displayedParticipants.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400">
                No participants match "{searchQuery}"
              </div>
            ) : (
              displayedParticipants.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors ${
                    p.selected ? '' : 'opacity-40'
                  } ${p.isDuplicate ? 'bg-amber-50/60' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-[11px] font-mono text-gray-300 w-6 text-right flex-shrink-0">
                    {idx + 1}
                  </span>

                  <input
                    type="checkbox"
                    checked={p.selected}
                    onChange={() => toggleSelect(p.id)}
                    className="w-4 h-4 accent-[#00B8D9] rounded cursor-pointer flex-shrink-0"
                  />

                  {editingId === p.id ? (
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmEdit(p.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1 border border-[#00B8D9] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#102A43] focus:outline-none"
                        dir="auto"
                      />
                      <button
                        type="button"
                        onClick={() => confirmEdit(p.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Save edit"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#102A43] truncate" dir="auto">
                        {p.name}
                      </span>
                      {p.isDuplicate && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex-shrink-0">
                          Duplicate
                        </span>
                      )}
                    </div>
                  )}

                  {editingId !== p.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#00B8D9] hover:bg-cyan-50"
                        title="Edit name"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeParticipant(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                        title="Remove participant"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setWizardStep('template')}
            className="px-5 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={15} />
            <span>Back to Template</span>
          </button>

          <button
            type="button"
            onClick={() => setWizardStep('preview')}
            disabled={selected.length === 0}
            className="px-8 py-3.5 rounded-2xl text-white text-xs font-bold shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 hover:opacity-95 transition-all flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00B8D9 0%, #009BB8 100%)' }}
          >
            <span>Proceed to Preview ({selected.length})</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
