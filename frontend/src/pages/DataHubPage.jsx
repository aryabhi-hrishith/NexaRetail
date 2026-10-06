import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/common/Button';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';
import { uploadDataFile } from '../services/api';

const ACCEPTED_EXTENSIONS = ['csv', 'xlsx', 'xls'];
const MAX_COLUMN_CHIPS = 40;

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

/* ------------------------------ helpers ------------------------------ */

const getExtension = (filename) => {
  const index = filename.lastIndexOf('.');
  return index === -1 ? '' : filename.slice(index + 1).toLowerCase();
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getName = (item) => item?.name ?? item?.file?.name ?? 'Unnamed file';
const getSize = (item) => item?.size ?? item?.file?.size ?? 0;

// Returns the backend inspection result for a file, or null if none is available.
const getAnalysis = (item) => {
  const candidate =
    item?.analysis ?? item?.backendData?.analysis ?? item?.backendData ?? null;
  if (!candidate || typeof candidate !== 'object') return null;
  const hasKnownField =
    candidate.row_count !== undefined ||
    candidate.column_count !== undefined ||
    candidate.columns !== undefined ||
    candidate.detected_type !== undefined;
  return hasKnownField ? candidate : null;
};

const getDetectedType = (analysis) => {
  const type = analysis?.detected_type;
  if (!type) return null;
  const text = String(type);
  return text.toLowerCase() === 'unknown' ? null : text.replace(/_/g, ' ');
};

const normalizeColumns = (columns) => {
  if (!Array.isArray(columns)) return [];
  return columns
    .map((column) =>
      typeof column === 'string' ? column : column?.source_name ?? column?.name ?? ''
    )
    .filter(Boolean);
};

const normalizeEvidence = (evidence) => {
  if (!Array.isArray(evidence)) return [];
  return evidence
    .map((entry) =>
      typeof entry === 'string' ? entry : entry?.reason ?? entry?.message ?? ''
    )
    .filter(Boolean);
};

const formatCount = (value) => {
  const raw = value !== null && typeof value === 'object' ? value.value : value;
  if (raw === null || raw === undefined || raw === '') return '—';
  const number = Number(raw);
  return Number.isFinite(number) ? number.toLocaleString() : '—';
};

const getStatusBadge = (item) => {
  const analysis = getAnalysis(item);
  if (!analysis) {
    return { label: item?.status || 'Uploaded', tone: 'slate' };
  }
  const status = String(analysis.detection_status ?? '').toLowerCase();
  if (!getDetectedType(analysis) || status.includes('unknown')) {
    return { label: 'Type unknown', tone: 'slate' };
  }
  if (status.includes('ambig') || status.includes('review') || status.includes('low')) {
    return { label: 'Needs review', tone: 'amber' };
  }
  return { label: 'Type detected', tone: 'emerald' };
};

const makeKey = (file) =>
  `${file.name}-${file.size}-${file.lastModified}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

/* ------------------------------- page -------------------------------- */

export function DataHubPage() {
  const { uploadedFiles, addUploadedFiles, removeUploadedFile, addToast } = useApp();

  const fileInputRef = useRef(null);
  const dragDepth = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [rejections, setRejections] = useState([]);
  // Each entry: { key, name, state: 'uploading' | 'error', error }
  const [queue, setQueue] = useState([]);

  const isUploading = queue.some((entry) => entry.state === 'uploading');
  const inspectedCount = uploadedFiles.filter((item) => getAnalysis(item)).length;

  useEffect(() => {
    if (!analyzeModalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setAnalyzeModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [analyzeModalOpen]);

  /* ----------------------------- upload ------------------------------ */

  const handleFiles = async (fileList) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;

    const taken = new Set([
      ...uploadedFiles.map((item) => getName(item).toLowerCase()),
      ...queue
        .filter((entry) => entry.state === 'uploading')
        .map((entry) => entry.name.toLowerCase()),
    ]);

    const accepted = [];
    const problems = [];

    for (const file of incoming) {
      const lowerName = file.name.toLowerCase();

      if (!ACCEPTED_EXTENSIONS.includes(getExtension(file.name))) {
        problems.push(
          `"${file.name}" is not supported. Please upload .csv, .xlsx or .xls files.`
        );
        continue;
      }
      if (file.size === 0) {
        problems.push(`"${file.name}" is empty and was skipped.`);
        continue;
      }
      if (taken.has(lowerName)) {
        problems.push(`"${file.name}" has already been added.`);
        continue;
      }

      taken.add(lowerName);
      accepted.push(file);
    }

    setRejections(problems);
    if (accepted.length === 0) return;

    const entries = accepted.map((file) => ({
      key: makeKey(file),
      name: file.name,
      state: 'uploading',
      error: null,
    }));

    const acceptedNames = new Set(accepted.map((file) => file.name.toLowerCase()));
    setQueue((prev) => [
      ...prev.filter((entry) => !acceptedNames.has(entry.name.toLowerCase())),
      ...entries,
    ]);

    for (let i = 0; i < accepted.length; i += 1) {
      const file = accepted[i];
      const entry = entries[i];

      try {
        const result = await uploadDataFile(file);
        addUploadedFiles([{ file, backendData: result?.data }]);
        setQueue((prev) => prev.filter((q) => q.key !== entry.key));
        addToast(`${file.name} uploaded and inspected`, 'success');
      } catch (error) {
        const message = error?.message || 'Upload failed. Please try again.';
        setQueue((prev) =>
          prev.map((q) => (q.key === entry.key ? { ...q, state: 'error', error: message } : q))
        );
        addToast(`${file.name}: ${message}`, 'error');
      }
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFiles(event.target.files);
    }
    event.target.value = '';
  };

  const openFilePicker = () => fileInputRef.current?.click();

  /* ----------------------------- drag/drop --------------------------- */

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleDropzoneKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  /* ----------------------------- actions ----------------------------- */

  const handleAnalyzeClick = () => {
    if (uploadedFiles.length === 0) {
      addToast('Please upload at least one retail data file before analyzing.', 'warning');
      return;
    }
    setAnalyzeModalOpen(true);
  };

  const dismissQueueEntry = (key) =>
    setQueue((prev) => prev.filter((entry) => entry.key !== key));

  /* ------------------------------ render ----------------------------- */

  return (
    <div className="space-y-6 pb-12 max-w-6xl">
      {/* Header */}
      <PageHeader
        title="Retail Data Hub"
        subtitle="Upload and manage your raw retail feeds (Sales, Product Catalog, Inventory, Customer Demographics, and Promotions)."
        breadcrumbs={['Home', 'Data Hub']}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" icon={UploadCloud} onClick={openFilePicker}>
              Add Files
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              disabled={uploadedFiles.length === 0 || isUploading}
              onClick={handleAnalyzeClick}
            >
              Analyze My Data
            </Button>
          </div>
        }
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Validation errors */}
      {rejections.length > 0 && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-rose-900">
              Some files could not be added
            </h4>
            <ul className="text-xs text-rose-700 list-disc list-inside space-y-0.5">
              {rejections.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setRejections([])}
            aria-label="Dismiss errors"
            className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={handleDropzoneKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-500 bg-white shadow-sm hover:shadow-md'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <UploadCloud className={`w-8 h-8 ${isDragging ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Drag & Drop your retail files here
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Supports transaction logs, inventory levels, product catalog, customer segments & promotions
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> .CSV
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> .XLSX
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> .XLS
            </span>
          </div>
          <div>
            <Button variant="primary" size="sm" className="mt-2 pointer-events-none">
              Browse Files on Computer
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            Multiple file selection supported. Accepted formats: CSV, XLSX, XLS.
          </p>
        </div>
      </div>

      {/* Upload queue (in progress / failed) */}
      {queue.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Uploads in progress</h3>
          <ul className="divide-y divide-slate-100">
            {queue.map((entry) => (
              <li key={entry.key} className="py-2.5 flex items-center gap-3">
                {entry.state === 'uploading' ? (
                  <span
                    className="inline-block w-4 h-4 shrink-0 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="p-1 rounded-full bg-rose-50 text-rose-600 shrink-0">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate" title={entry.name}>
                    {entry.name}
                  </p>
                  <p
                    className={`text-xs ${
                      entry.state === 'uploading' ? 'text-slate-500' : 'text-rose-600'
                    }`}
                  >
                    {entry.state === 'uploading' ? 'Uploading and inspecting…' : entry.error}
                  </p>
                </div>
                {entry.state === 'error' && (
                  <button
                    type="button"
                    onClick={() => dismissQueueEntry(entry.key)}
                    aria-label={`Dismiss ${entry.name}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded files */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Uploaded Data Feeds ({uploadedFiles.length})
              </h3>
              <p className="text-xs text-slate-500">
                Files staged for upcoming AI decision-support ingestion
              </p>
            </div>
          </div>
          {uploadedFiles.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {inspectedCount} of {uploadedFiles.length} inspected
            </span>
          )}
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto">
              <h4 className="text-sm font-bold text-slate-800">No data files uploaded yet</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your store CSV or Excel spreadsheets above to begin building custom AI decision models.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Detected As</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadedFiles.map((item, index) => {
                  const name = getName(item);
                  const analysis = getAnalysis(item);
                  const detected = getDetectedType(analysis);
                  const badge = getStatusBadge(item);

                  return (
                    <tr
                      key={item.id ?? `${name}-${index}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 font-medium text-slate-900">
                          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                            <FileSpreadsheet className="w-4 h-4" />
                          </span>
                          <span className="truncate max-w-xs" title={name}>
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {getExtension(name).toUpperCase() || '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {formatFileSize(getSize(item))}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {analysis ? (
                          <span className="capitalize">{detected ?? 'Unknown'}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{item.uploadTime ?? '—'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${TONE_CLASSES[badge.tone]}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(item.id)}
                          aria-label={`Remove ${name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-indigo-900">
            About Data Hub Ingestion
          </h4>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Each file is read by the backend, which reports its columns and a best guess at the dataset type (sales, products, inventory and so on). Column mapping, validation and ML processing are connected in later steps.
          </p>
        </div>
      </div>

      {/* Analysis results modal */}
      {analyzeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={() => setAnalyzeModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Data analysis results"
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Data Analysis Results</h3>
                  <p className="text-xs text-slate-500">
                    What the backend found in {uploadedFiles.length}{' '}
                    {uploadedFiles.length === 1 ? 'file' : 'files'}. Mapping and ML processing come in the next step.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalyzeModalOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {uploadedFiles.map((item, index) => {
                const name = getName(item);
                const analysis = getAnalysis(item);
                const badge = getStatusBadge(item);
                const columns = normalizeColumns(analysis?.columns);
                const evidence = normalizeEvidence(analysis?.evidence);
                const detected = getDetectedType(analysis);

                return (
                  <div
                    key={item.id ?? `${name}-${index}`}
                    className="bg-slate-50 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-800 text-sm truncate" title={name}>
                        {name}
                      </span>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${TONE_CLASSES[badge.tone]}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {analysis ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-[10px] text-slate-500">Rows</p>
                            <p className="font-bold text-slate-900">
                              {formatCount(analysis.row_count)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-[10px] text-slate-500">Columns</p>
                            <p className="font-bold text-slate-900">
                              {formatCount(analysis.column_count ?? columns.length)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-[10px] text-slate-500">Detected</p>
                            <p className="font-bold text-slate-900 capitalize">
                              {detected ?? 'Unknown'}
                            </p>
                          </div>
                        </div>

                        {columns.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-1">
                              Detected Columns ({columns.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {columns.slice(0, MAX_COLUMN_CHIPS).map((column, columnIndex) => (
                                <span
                                  key={`${column}-${columnIndex}`}
                                  className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600"
                                >
                                  {column}
                                </span>
                              ))}
                              {columns.length > MAX_COLUMN_CHIPS && (
                                <span className="px-2 py-1 text-[11px] text-slate-400">
                                  +{columns.length - MAX_COLUMN_CHIPS} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {evidence.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-1">
                              Detection Evidence
                            </p>
                            <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5">
                              {evidence.map((entry, evidenceIndex) => (
                                <li key={evidenceIndex}>{entry}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.detection_status && (
                          <div className="text-[11px] text-slate-500">
                            Detection status:{' '}
                            <span className="font-semibold">{String(analysis.detection_status)}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Backend analysis information is not available for this file.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 p-4 sm:p-5 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setAnalyzeModalOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataHubPage;