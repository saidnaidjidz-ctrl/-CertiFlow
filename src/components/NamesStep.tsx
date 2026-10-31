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
  const { participants, setParticipants, setWizardStep, showToast, language, t } = useApp();
  const isRtl = language === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

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
    showToast(t('toastAddedCount', { count: parsed.length }), 'success');
  }

  function handleLoadSampleList() {
    const parsed = parseTextNames(SAMPLE_NAMES.join('\n'));
    const existingNames = new Set(participants.map(p => p.name.trim().toLowerCase()));
    const enriched = parsed.map(p => ({
      ...p,
      isDuplicate: p.isDuplicate || existingNames.has(p.name.trim().toLowerCase())
    }));
    setParticipants([...participants, ...enriched]);
    showToast(t('toastLoadedSample', { count: parsed.length }), 'info');
  }

  async function handleExcelFile(file: File) {
    setError('');
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError(language === 'ar' ? 'يرجى رفع ملف Excel (.xlsx, .xls) أو CSV صالح.' : 'Please upload a valid Excel (.xlsx, .xls) or CSV file.');
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      setExcelBuffer(buffer);
      const preview = parseExcelFile(buffer, 0);
      setExcelPreview(preview);
      setSelectedColumn(0);
      setSelectedSheet(0);
      showToast(language === 'ar' ? `تم تحميل "${file.name}" مع ${preview.rows.length} صفاً` : `Loaded "${file.name}" with ${preview.rows.length} rows`, 'info');
    } catch {
      setError(language === 'ar' ? 'فشل تحليل الملف. يرجى التحقق من التنسيق أو تجربة CSV.' : 'Failed to parse file. Please verify the format or try a CSV.');
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
        setError(language === 'ar' ? 'فشل تبديل ورقة العمل.' : 'Failed to switch worksheet.');
      }
    }
  }

  function importFromExcel() {
    if (!excelBuffer || !excelPreview) return;
    const parsed = extractParticipantsFromExcel(excelPreview, excelBuffer, selectedSheet, selectedColumn);
    if (parsed.length === 0) {
      setError(language === 'ar' ? 'لم يتم العثور على أي أسماء في العمود المحدد.' : 'No names found in the selected column.');
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
    showToast(language === 'ar' ? `تم استيراد ${parsed.length} مشارك من Excel` : `Imported ${parsed.length} participants from Excel`, 'success');
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
    showToast(t('toastNameUpdated'), 'success');
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
    showToast(t('toastRemovedDuplicates', { count: removedCount }), 'success');
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
    showToast(language === 'ar' ? `تمت إضافة "${newP.name}"` : `Added "${newP.name}"`, 'success');
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
        <div className="saas-card rounded-2xl p-5 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B]">
          {/* Segmented Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-[#1B2C42]">
            <h3 className="text-xs font-bold text-[#102A43] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users size={15} className="text-[#00B8D9]" />
              {t('importParticipantsTitle')}
            </h3>
            <div className="flex bg-gray-100 dark:bg-[#162338] p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setInputTab('paste')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputTab === 'paste' ? 'bg-white dark:bg-[#1E304C] text-[#102A43] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t('tabPaste')}
              </button>
              <button
                type="button"
                onClick={() => setInputTab('excel')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  inputTab === 'excel' ? 'bg-white dark:bg-[#1E304C] text-[#102A43] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t('tabExcel')}
              </button>
            </div>
          </div>

          {inputTab === 'paste' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {t('pasteLabel')}
                </label>
                <button
                  type="button"
                  onClick={handleLoadSampleList}
                  className="text-xs font-bold text-[#00B8D9] hover:underline flex items-center gap-1"
                >
                  <Sparkles size={12} />
                  {t('loadSampleNamesBtn')}
                </button>
              </div>

              <textarea
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] rounded-xl px-3.5 py-3 text-sm text-[#102A43] dark:text-white font-medium resize-none focus:outline-none focus:border-[#00B8D9] transition-colors scrollbar-thin"
                rows={9}
                placeholder={t('pastePlaceholder')}
                dir="auto"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {t('namesDetected', { count: textInput.split('\n').filter(l => l.trim().length > 0).length })}
                </span>
                <button
                  type="button"
                  onClick={handleTextImport}
                  disabled={!textInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{ background: '#00B8D9' }}
                >
                  {t('addNamesToListBtn')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'drag-over'
                    : 'border-gray-200 dark:border-gray-700 hover:border-[#00B8D9] dark:hover:border-[#00B8D9]'
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
                <p className="text-xs font-bold text-[#102A43] dark:text-white">{t('dropExcelHere')}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{t('dropExcelSub')}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 dark:text-gray-500">{t('needSampleFormat')}</span>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="font-bold text-[#00B8D9] hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  {t('downloadSampleCsvBtn')}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Excel Preview & Column Mapper */}
              {excelPreview && (
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-[#1B2C42]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#102A43] dark:text-white">
                    <span>{t('mapColumnsTitle')}</span>
                    <span className="text-gray-400 dark:text-gray-500">{t('totalRowsLabel', { count: excelPreview.rows.length })}</span>
                  </div>

                  {excelPreview.sheetNames.length > 1 && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">{t('worksheetLabel')}</label>
                      <select
                        value={selectedSheet}
                        onChange={e => handleSheetChange(Number(e.target.value))}
                        className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#102A43] dark:text-white"
                      >
                        {excelPreview.sheetNames.map((name, i) => (
                          <option key={i} value={i}>{name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      {t('selectNameColLabel')}
                    </label>
                    <select
                      value={selectedColumn}
                      onChange={e => setSelectedColumn(Number(e.target.value))}
                      className="w-full border border-[#00B8D9] rounded-xl px-3 py-2 text-xs font-bold text-[#102A43] dark:text-white bg-cyan-50/50 dark:bg-cyan-950/30"
                    >
                      {excelPreview.headers.map((h, i) => (
                        <option key={i} value={i}>
                          {t('columnPrefix', { num: i + 1, name: h })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Micro Table Preview */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto max-h-48 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-[11px] whitespace-nowrap">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#162338] border-b border-gray-200 dark:border-gray-700">
                          {excelPreview.headers.map((h, i) => (
                            <th
                              key={i}
                              className={`px-3 py-1.5 text-start font-bold ${
                                i === selectedColumn ? 'text-[#00B8D9] bg-cyan-50 dark:bg-cyan-950/40' : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {excelPreview.rows.slice(0, 5).map((row, ri) => (
                          <tr key={ri} className="border-b border-gray-100 dark:border-[#1B2C42]">
                            {excelPreview.headers.map((_, ci) => (
                              <td
                                key={ci}
                                className={`px-3 py-1.5 truncate max-w-[160px] ${
                                  ci === selectedColumn ? 'font-bold text-[#102A43] dark:text-white bg-cyan-50/40 dark:bg-cyan-950/20' : 'text-gray-500 dark:text-gray-400'
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
                    {t('confirmImportExcelBtn')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Add Single Participant Form */}
        <div className="saas-card rounded-2xl p-4 border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B]">
          <label className="text-xs font-bold text-[#102A43] dark:text-white uppercase tracking-wider mb-2 block">
            {t('addSingleParticipantTitle')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSingleName}
              onChange={e => setNewSingleName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddSingleName(); }}
              placeholder={t('addSinglePlaceholder')}
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#162338] rounded-xl px-3 py-2 text-xs font-medium text-[#102A43] dark:text-white focus:outline-none focus:border-[#00B8D9]"
              dir="auto"
            />
            <button
              type="button"
              onClick={handleAddSingleName}
              disabled={!newSingleName.trim()}
              className="px-3 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-40 transition-opacity flex items-center gap-1 flex-shrink-0"
              style={{ background: '#00B8D9' }}
            >
              <Plus size={14} /> {t('addBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Participant Data Table (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
        <div className="saas-card rounded-2xl border border-sky-100 dark:border-[#1B2C42] bg-white dark:bg-[#101B2B] flex-1 flex flex-col overflow-hidden min-h-[500px]">
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1B2C42] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#102A43] dark:text-white">{t('participantRecordsTitle')}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-[#00B8D9] border border-cyan-100 dark:border-cyan-800">
                {t('selectedOfTotalPill', { selected: selected.length, total: participants.length })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {dupes.length > 0 && (
                <button
                  type="button"
                  onClick={removeDuplicates}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {t('removeDuplicatesBtn', { count: dupes.length })}
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                <button type="button" onClick={() => selectAll(true)} className="hover:text-[#00B8D9]">{t('selectAllBtn')}</button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button type="button" onClick={() => selectAll(false)} className="hover:text-[#00B8D9]">{t('selectNoneBtn')}</button>
                {participants.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      type="button"
                      onClick={() => setParticipants([])}
                      className="text-red-400 hover:text-red-600"
                    >
                      {t('clearAllBtn')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search bar */}
          {participants.length > 0 && (
            <div className="px-5 py-2.5 bg-gray-50/50 dark:bg-[#162338]/50 border-b border-gray-100 dark:border-[#1B2C42] flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('searchParticipantsPlaceholder')}
                className="bg-transparent border-none text-xs text-[#102A43] dark:text-white placeholder-gray-400 focus:outline-none w-full"
                dir="auto"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {t('clearAllBtn')}
                </button>
              )}
            </div>
          )}

          {/* Table / List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 divide-y divide-gray-100 dark:divide-[#1B2C42] max-h-[480px]">
            {participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-[#00B8D9] mb-3">
                  <Upload size={28} />
                </div>
                <h4 className="font-bold text-sm text-[#102A43] dark:text-white">{t('noParticipantsImported')}</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mt-1 mb-4">
                  {t('noParticipantsDesc')}
                </p>
                <button
                  type="button"
                  onClick={handleLoadSampleList}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow hover:opacity-90 flex items-center gap-1.5"
                  style={{ background: '#00B8D9' }}
                >
                  <Sparkles size={13} />
                  {t('loadSampleNamesBtn')}
                </button>
              </div>
            ) : displayedParticipants.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400 dark:text-gray-500">
                {t('noSearchMatches', { query: searchQuery })}
              </div>
            ) : (
              displayedParticipants.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors ${
                    p.selected ? '' : 'opacity-40'
                  } ${p.isDuplicate ? 'bg-amber-50/60 dark:bg-amber-950/20' : 'hover:bg-gray-50 dark:hover:bg-[#162338]'}`}
                >
                  <span className="text-[11px] font-mono text-gray-300 dark:text-gray-600 w-6 text-end flex-shrink-0">
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
                        className="flex-1 border border-[#00B8D9] bg-white dark:bg-[#162338] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#102A43] dark:text-white focus:outline-none"
                        dir="auto"
                      />
                      <button
                        type="button"
                        onClick={() => confirmEdit(p.id)}
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                        title="Save edit"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#162338] rounded"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#102A43] dark:text-white truncate" dir="auto">
                        {p.name}
                      </span>
                      {p.isDuplicate && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 flex-shrink-0">
                          {t('duplicateBadge')}
                        </span>
                      )}
                    </div>
                  )}

                  {editingId !== p.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#00B8D9] hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                        title="Edit name"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeParticipant(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
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
            className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#101B2B] text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#162338] transition-colors flex items-center gap-2"
          >
            <BackIcon size={15} />
            <span>{t('backToTemplateBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => setWizardStep('preview')}
            disabled={selected.length === 0}
            className="px-8 py-3.5 rounded-2xl text-white text-xs font-bold shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 hover:opacity-95 transition-all flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00B8D9 0%, #009BB8 100%)' }}
          >
            <span>{t('proceedToPreviewBtn', { count: selected.length })}</span>
            <NextIcon size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
