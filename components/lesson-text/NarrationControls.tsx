'use client';

import { useAudioAsset } from '../../hooks/useAudioAsset';
import { AudioJob, TextNarrationSummary } from '../../lib/textAuthoringTypes';

interface NarrationControlsProps {
  narration: TextNarrationSummary | null;
  audioGenerationConfigured: boolean;
  hasUnsavedTextChanges: boolean;
  hasSavedRevision: boolean;
  isGenerating: boolean;
  activeJob: AudioJob | null | undefined;
  onGenerate: () => void;
  onRetry: () => void;
}

export function NarrationControls({
  narration,
  audioGenerationConfigured,
  hasUnsavedTextChanges,
  hasSavedRevision,
  isGenerating,
  activeJob,
  onGenerate,
  onRetry,
}: NarrationControlsProps) {
  const { url: narrationUrl, error: narrationLoadError } = useAudioAsset(narration?.assetId ?? null);

  const disabledReason = !audioGenerationConfigured
    ? 'Narration generation is not configured on this server (missing ELEVENLABS_API_KEY).'
    : !hasSavedRevision
      ? 'Save the text before generating narration.'
      : hasUnsavedTextChanges
        ? 'Save your text edits before generating narration.'
        : isGenerating
          ? 'A narration generation job is already in progress.'
          : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-700">Narration (ElevenLabs)</p>
          <p className="text-xs text-slate-500">
            Generates one natural full-text recording. Word clips are extracted from this narration later, never
            synthesized separately.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={Boolean(disabledReason)}
          title={disabledReason ?? undefined}
          className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? 'Generating…' : 'Generate narration'}
        </button>
      </div>

      {disabledReason ? <p className="text-xs text-amber-700">{disabledReason}</p> : null}

      {activeJob?.status === 'FAILED' ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
          <p>
            Generation failed: {activeJob.error?.message ?? 'Unknown error'}
            {activeJob.error?.code ? ` (${activeJob.error.code})` : ''}
          </p>
          {activeJob.error?.retryable ? (
            <button type="button" onClick={onRetry} className="mt-1 font-semibold underline">
              Retry
            </button>
          ) : (
            <p className="mt-1 text-rose-500">This error requires configuration changes before retrying.</p>
          )}
        </div>
      ) : null}

      {narration ? (
        <div className="space-y-1">
          <p className="text-xs text-slate-500">
            Voice {narration.voiceId} · {narration.model} · generated {new Date(narration.createdAt).toLocaleString()}
          </p>
          {narrationUrl ? (
            <audio controls preload="metadata" className="w-full" src={narrationUrl} data-testid="narration-player" />
          ) : narrationLoadError ? (
            <p className="text-xs text-rose-600">Failed to load narration audio: {narrationLoadError}</p>
          ) : (
            <p className="text-xs text-slate-500">Loading narration audio…</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500">No narration generated yet.</p>
      )}
    </div>
  );
}
