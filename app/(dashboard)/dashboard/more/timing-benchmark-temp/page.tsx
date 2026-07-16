'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLessons } from '../../../../../hooks/useLessons';
import { useLessonMutations } from '../../../../../hooks/useLessonMutations';
import { useToast } from '../../../../../components/providers/ToastProvider';
import { LessonTimingBenchmarkResponse } from '../../../../../lib/apiTypes';

const cardClass = 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm';
const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-slate-500';
const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const selectClass = inputClass;
const helperClass = 'text-xs text-slate-500';
const buttonClass =
  'inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50';

export default function TimingBenchmarkTempPage() {
  const { data, isLoading, error } = useLessons();
  const { benchmarkLessonItemTimingsTemp } = useLessonMutations();
  const { notify } = useToast();
  const lessons = useMemo(() => data?.lessons ?? [], [data?.lessons]);

  const [lessonId, setLessonId] = useState('');
  const [itemId, setItemId] = useState('');
  const [textOverride, setTextOverride] = useState('');
  const [report, setReport] = useState<LessonTimingBenchmarkResponse | null>(null);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === lessonId) ?? null,
    [lessonId, lessons],
  );
  const selectedItem = useMemo(
    () => selectedLesson?.items.find((item) => item.id === itemId) ?? null,
    [itemId, selectedLesson],
  );

  const canRun = Boolean(selectedLesson && selectedItem && !benchmarkLessonItemTimingsTemp.isPending);

  const handleLessonChange = (nextLessonId: string) => {
    setLessonId(nextLessonId);
    const nextLesson = lessons.find((lesson) => lesson.id === nextLessonId);
    setItemId(nextLesson?.items[0]?.id ?? '');
    setReport(null);
  };

  const handleRun = async () => {
    if (!selectedLesson || !selectedItem) return;

    try {
      const response = await benchmarkLessonItemTimingsTemp.mutateAsync({
        lessonId: selectedLesson.id,
        itemId: selectedItem.id,
        text: textOverride.trim() || selectedItem.text,
      });
      setReport(response);
      notify('Temporary timing benchmark finished');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run temporary timing benchmark';
      notify(message, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Timing benchmark (temporary)</h1>
          <p className="text-sm text-slate-500">
            Compare Whisper vs Qwen on one lesson item before deciding what to keep.
          </p>
        </div>
        <Link
          href="/dashboard/more"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </Link>
      </div>

      <div className={`${cardClass} border-amber-200 bg-amber-50`}>
        <p className="text-sm font-semibold text-amber-900">Temporary tool</p>
        <p className="mt-1 text-sm text-amber-800">
          Use this to compare providers on real lesson audio, then delete this page and the matching backend endpoint.
        </p>
      </div>

      <div className={cardClass}>
        {isLoading ? <p className="text-sm text-slate-500">Loading lessons…</p> : null}
        {error ? <p className="text-sm text-rose-600">Failed to load lessons: {error.message}</p> : null}

        {!isLoading && !error ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="lessonId">
                  Lesson
                </label>
                <select
                  id="lessonId"
                  className={selectClass}
                  value={lessonId}
                  onChange={(event) => handleLessonChange(event.target.value)}
                >
                  <option value="">Select lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="itemId">
                  Lesson item
                </label>
                <select
                  id="itemId"
                  className={selectClass}
                  value={itemId}
                  onChange={(event) => {
                    setItemId(event.target.value);
                    setReport(null);
                  }}
                  disabled={!selectedLesson}
                >
                  <option value="">Select item</option>
                  {(selectedLesson?.items ?? []).map((item, index) => (
                    <option key={item.id} value={item.id}>
                      Item {index + 1}: {item.text.slice(0, 80)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="textOverride">
                Lesson text override
              </label>
              <textarea
                id="textOverride"
                className={`${inputClass} min-h-[180px]`}
                value={textOverride}
                onChange={(event) => {
                  setTextOverride(event.target.value);
                  setReport(null);
                }}
                placeholder={selectedItem?.text ?? 'Select an item to preload its lesson text'}
              />
              <p className="mt-2 text-xs text-slate-500">
                Leave blank to use the saved lesson item text. Change it here if you want to test normalization/alignment behavior against edited text.
              </p>
            </div>

            {selectedItem ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Audio URL:</span> {selectedItem.audioUrl || 'No audio'}
                </p>
                <p className="mt-1 break-words">
                  <span className="font-semibold">Saved text:</span> {selectedItem.text}
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button className={buttonClass} onClick={() => void handleRun()} disabled={!canRun}>
                {benchmarkLessonItemTimingsTemp.isPending ? 'Running…' : 'Run provider benchmark'}
              </button>
              <p className={helperClass}>
                Runs both providers and compares timing quality without saving anything.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {report ? (
        <div className="space-y-4">
          <div className={cardClass}>
            <p className="text-sm font-semibold text-slate-900">Benchmark result</p>
            <p className="mt-1 text-sm text-slate-600">{report.deleteReminder}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {report.results.map((result) => (
              <div key={result.provider} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{result.provider}</p>
                    <p className={`text-xs ${result.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.ok ? 'ok' : 'failed'}
                    </p>
                  </div>
                </div>

                {!result.ok ? (
                  <p className="mt-3 text-sm text-rose-600">{result.error}</p>
                ) : result.summary ? (
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <dt className="text-slate-500">Transcript words</dt>
                        <dd className="font-medium text-slate-900">{result.summary.transcriptWordCount}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Duration</dt>
                        <dd className="font-medium text-slate-900">
                          {result.summary.audioDurationSeconds ?? 'n/a'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Word timings</dt>
                        <dd className="font-medium text-slate-900">{result.summary.wordTimingCount}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Sentence timings</dt>
                        <dd className="font-medium text-slate-900">{result.summary.sentenceTimingCount}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Warnings</dt>
                        <dd className="font-medium text-slate-900">{result.summary.warningCount}</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Estimated words</dt>
                        <dd className="font-medium text-slate-900">{result.summary.estimatedWordCount}</dd>
                      </div>
                    </dl>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Transcript preview
                      </p>
                      <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                        {result.summary.transcriptPreview || '(empty)'}
                      </pre>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          First word timing
                        </p>
                        <p className="mt-1 text-xs text-slate-700">
                          {formatWordTiming(result.summary.firstWordTiming)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Last word timing
                        </p>
                        <p className="mt-1 text-xs text-slate-700">
                          {formatWordTiming(result.summary.lastWordTiming)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Warnings detail
                      </p>
                      {result.summary.warnings.length ? (
                        <ul className="mt-1 space-y-1 text-xs text-slate-700">
                          {result.summary.warnings.map((warning) => (
                            <li key={warning} className="rounded bg-slate-50 px-2 py-1">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-xs text-emerald-700">No warnings.</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatWordTiming(timing: { text: string; startMs: number; endMs: number } | null) {
  if (!timing) {
    return 'n/a';
  }

  return `${timing.text} (${timing.startMs}-${timing.endMs} ms)`;
}
