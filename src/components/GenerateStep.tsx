import { useState, useEffect, useRef } from 'react';
import type { CertificateResult } from '../types';
import { useApp } from '../context/AppContext';
import { generateAllCertificates, buildZip, buildCombinedPdf } from '../services/pdfGenerator';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Archive,
  FileText,
  RotateCcw,
  LayoutDashboard,
  Search,
  Eye,
  X
} from 'lucide-react';

function downloadBlob(blob: Blob | Uint8Array, filename: string) {
  const b =
    blob instanceof Uint8Array
      ? new Blob([blob.buffer as ArrayBuffer], { type: 'application/pdf' })
      : blob;
  const url = URL.createObjectURL(b);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GenerateStep() {
  const {
    currentTemplate,
    participants,
    results,
    setResults,
    isGenerating,
    setIsGenerating,
    saveProject,
    setView,
    resetWizard,
    showToast,
  } = useApp();

  const [started, setStarted] = useState(false);
  const [buildingZip, setBuildingZip] = useState(false);
  const [buildingCombined, setBuildingCombined] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalTitle, setPreviewModalTitle] = useState('');
  const [generationDuration, setGenerationDuration] = useState<number | null>(null);

  const selected = participants.filter(p => p.selected);
  const doneResults = results.filter(r => r.status === 'done');
  const errorResults = results.filter(r => r.status === 'error');
  const hasTriggeredRef = useRef(false);

  async function runBatch() {
    if (!currentTemplate || selected.length === 0) return;
    setStarted(true);
    setIsGenerating(true);
    setResults([]);

    const startTime = performance.now();
    const map = new Map<string, CertificateResult>();

    const allResults = await generateAllCertificates(
      currentTemplate,
      selected,
      (r) => {
        map.set(r.participantId, { ...r });
        setResults(Array.from(map.values()));
      }
    );

    const endTime = performance.now();
    const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(2));
    setGenerationDuration(durationSeconds);

    setResults(allResults);
    setIsGenerating(false);

    const successCount = allResults.filter(r => r.status === 'done').length;

    saveProject({
      id: crypto.randomUUID(),
      name: `${currentTemplate.name} Batch`,
      templateId: currentTemplate.id,
      templateName: currentTemplate.name,
      createdAt: Date.now(),
      certificateCount: successCount,
      status: 'completed',
    });

    showToast(`Successfully generated ${successCount} certificates!`, 'success');
  }

  // Auto-start generation when arriving on this step if not started yet
  useEffect(() => {
    if (!hasTriggeredRef.current && currentTemplate && selected.length > 0 && results.length === 0) {
      hasTriggeredRef.current = true;
      runBatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDownloadZip() {
    setBuildingZip(true);
    showToast('Compressing certificates into ZIP archive…', 'info');
    try {
      const blob = await buildZip(results);
      downloadBlob(blob, `${currentTemplate?.name.replace(/\s+/g, '_') || 'CertiFlow'}_Certificates.zip`);
      showToast('ZIP archive downloaded successfully', 'success');
    } catch {
      showToast('Failed to create ZIP package', 'error');
    }
    setBuildingZip(false);
  }

  async function handleDownloadCombined() {
    setBuildingCombined(true);
    showToast('Assembling multi-page combined PDF document…', 'info');
    try {
      const bytes = await buildCombinedPdf(results);
      downloadBlob(bytes, `${currentTemplate?.name.replace(/\s+/g, '_') || 'CertiFlow'}_All_In_One.pdf`);
      showToast('Combined PDF downloaded successfully', 'success');
    } catch {
      showToast('Failed to generate combined PDF', 'error');
    }
    setBuildingCombined(false);
  }

  function handleDownloadSingle(r: CertificateResult) {
    if (r.pdfBytes) {
      downloadBlob(r.pdfBytes, r.fileName);
      showToast(`Downloaded ${r.fileName}`, 'success');
    }
  }

  function openPreviewModal(r: CertificateResult) {
    if (!r.pdfBytes) return;
    const blob = new Blob([r.pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setPreviewModalUrl(url);
    setPreviewModalTitle(r.name);
  }

  function closePreviewModal() {
    if (previewModalUrl) {
      URL.revokeObjectURL(previewModalUrl);
      setPreviewModalUrl(null);
    }
  }

  const progress = started && selected.length > 0
    ? Math.round((results.filter(r => r.status !== 'generating').length / selected.length) * 100)
    : 0;

  const filteredResults = results.filter(r =>
    r.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    r.fileName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Status & Hero Download CTAs */}
      <div className="saas-card rounded-3xl p-6 sm:p-8 border border-sky-100 relative overflow-hidden bg-white shadow-sm">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-50/50 -mr-20 -mt-20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-[#35BFA3] mb-2">
              {isGenerating ? (
                <>
                  <Loader2 size={13} className="animate-spin text-[#00B8D9]" />
                  <span>Generating Batch in Browser…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-[#35BFA3]" />
                  <span>Generation Finished Successfully</span>
                </>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight">
              {isGenerating ? 'Rendering Certificates…' : 'Export Ready: All Certificates Generated'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl">
              {isGenerating
                ? `Processed ${results.filter(r => r.status !== 'generating').length} of ${selected.length} records…`
                : `${doneResults.length} certificates generated with template "${currentTemplate?.name}" in ${generationDuration ?? 1.2}s. Download individually or as combined packages.`}
            </p>
          </div>

          {/* Primary Bulk Download Actions */}
          {!isGenerating && doneResults.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCombined}
                disabled={buildingCombined}
                className="px-5 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-[#102A43] hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {buildingCombined ? <Loader2 size={15} className="animate-spin text-[#00B8D9]" /> : <FileText size={15} className="text-[#00B8D9]" />}
                <span>Combined PDF ({doneResults.length} Pages)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={buildingZip}
                className="px-6 py-3 rounded-2xl text-white text-xs font-bold shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #35BFA3 0%, #259E85 100%)' }}
              >
                {buildingZip ? <Loader2 size={15} className="animate-spin" /> : <Archive size={15} />}
                <span>Download All as ZIP</span>
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar & KPI Chips */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-[#102A43]">
              {isGenerating ? `Processing ${results.length} of ${selected.length} records…` : 'Complete'}
            </span>
            <span className="font-mono text-[#00B8D9]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #00B8D9 0%, #35BFA3 100%)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] text-gray-400 block font-medium">Successful</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">{doneResults.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] text-gray-400 block font-medium">Failed</span>
              <span className="text-lg font-bold text-red-500 font-mono">{errorResults.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] text-gray-400 block font-medium">Generation Speed</span>
              <span className="text-lg font-bold text-[#102A43] font-mono">
                {generationDuration ? `${generationDuration}s` : '1.2s'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
              <span className="text-[11px] text-gray-400 block font-medium">Estimated Package</span>
              <span className="text-lg font-bold text-[#00B8D9] font-mono">
                ~{(doneResults.length * 0.18).toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Certificate File Records List */}
      <div className="saas-card rounded-2xl border border-sky-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#102A43]">Generated PDF Files</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-[#00B8D9]">
              {filteredResults.length} Files
            </span>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by participant or filename..."
              className="bg-transparent border-none text-xs text-[#102A43] focus:outline-none w-48 sm:w-64"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Files Table List */}
        <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto scrollbar-thin">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">
              {results.length === 0 ? 'Generation in progress…' : 'No certificates match your search'}
            </div>
          ) : (
            filteredResults.map((r, i) => (
              <div
                key={r.participantId}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-mono text-gray-300 w-6 text-right flex-shrink-0">
                    {i + 1}
                  </span>

                  {r.status === 'done' && (
                    <CheckCircle2 size={18} className="text-[#35BFA3] flex-shrink-0" />
                  )}
                  {r.status === 'generating' && (
                    <Loader2 size={18} className="text-[#00B8D9] animate-spin flex-shrink-0" />
                  )}
                  {r.status === 'error' && (
                    <XCircle size={18} className="text-red-500 flex-shrink-0" />
                  )}

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#102A43] truncate" dir="auto">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate font-mono">
                      {r.fileName} • {r.status === 'done' ? '~180 KB' : r.error || 'Rendering…'}
                    </div>
                  </div>
                </div>

                {r.status === 'done' && r.pdfBytes && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => openPreviewModal(r)}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-[#102A43] transition-colors flex items-center gap-1"
                      title="Preview PDF"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Inspect</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(r)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-50 border border-cyan-200 text-xs font-bold text-[#00B8D9] hover:bg-cyan-100 transition-colors flex items-center gap-1"
                      title="Download PDF"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Completion Actions */}
      {!isGenerating && started && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              resetWizard();
              setView('dashboard');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-[#102A43] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={15} />
            <span>Return to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetWizard();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl text-white text-xs font-bold shadow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ background: '#00B8D9' }}
          >
            <RotateCcw size={15} />
            <span>Create Another Batch</span>
          </button>
        </div>
      )}

      {/* Individual Certificate Preview Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#102A43]">{previewModalTitle}</h3>
                <p className="text-xs text-gray-400">PDF Certificate Preview</p>
              </div>
              <button
                type="button"
                onClick={closePreviewModal}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-[#102A43]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-2 bg-gray-100 min-h-[500px]">
              <iframe
                src={previewModalUrl}
                className="w-full h-full rounded-xl border border-gray-200"
                style={{ minHeight: '520px' }}
                title="Certificate Preview Modal"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
