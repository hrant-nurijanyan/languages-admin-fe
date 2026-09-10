'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAudioJob } from '../../hooks/useAudioJob';
import {
  useTextAuthoringMutations,
  useTextOccurrences,
  useTextReadiness,
  useTextWorkspace,
} from '../../hooks/useTextAuthoring';
import { NarrationControls } from './NarrationControls';
import { OccurrenceSelection } from './OccurrenceSelection';
import { TextVocabularyEditor } from './TextVocabularyEditor';
import { TextReadinessPanel } from './TextReadinessPanel';

interface TextAuthoringPanelProps {
  lessonId: string;
  textId: string;
}

/**
 * Additive text-authoring workspace for one LessonItem ("text"). Mounted
 * alongside the existing legacy item editor; never replaces it, and never
 * writes to the legacy text/audioUrl/timing fields.
 */
export function TextAuthoringPanel({ lessonId, textId }: TextAuthoringPanelProps) {
  const queryClient = useQueryClient();
  const workspaceQuery = useTextWorkspace(lessonId, textId);
  const workspace = workspaceQuery.data?.text;

  const [draftText, setDraftText] = useState('');
  const [hasInitializedDraft, setHasInitializedDraft] = useState(false);
  const [narrationJobId, setNarrationJobId] = useState<string | null>(null);
  const [clipJobId, setClipJobId] = useState<string | null>(null);
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInitializedDraft && workspace) {
      setDraftText(workspace.contentRevision?.text ?? workspace.legacyText);
      setHasInitializedDraft(true);
    }
  }, [hasInitializedDraft, workspace]);

  const alignmentId = workspace?.alignmentSummary?.id ?? null;
  const occurrencesQuery = useTextOccurrences(lessonId, textId, alignmentId);
  const readinessQuery = useTextReadiness(lessonId, textId);
  const mutations = useTextAuthoringMutations(lessonId, textId);
  const narrationJobQuery = useAudioJob(narrationJobId);
  const clipJobQuery = useAudioJob(clipJobId);

  const invalidateAfterGeneration = () => {
    queryClient.invalidateQueries({ queryKey: ['text-workspace', lessonId, textId] });
    queryClient.invalidateQueries({ queryKey: ['text-occurrences', lessonId, textId] });
    queryClient.invalidateQueries({ queryKey: ['text-readiness', lessonId, textId] });
  };

  useEffect(() => {
    if (narrationJobQuery.data?.job.status === 'SUCCEEDED') {
      invalidateAfterGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrationJobQuery.data?.job.status]);

  useEffect(() => {
    if (clipJobQuery.data?.job.status === 'SUCCEEDED') {
      invalidateAfterGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipJobQuery.data?.job.status]);

  const hasUnsavedTextChanges = Boolean(
    workspace && draftText !== (workspace.contentRevision?.text ?? workspace.legacyText),
  );

  const handleSaveText = async () => {
    await mutations.saveContentRevision.mutateAsync(draftText);
  };

  const handleGenerate = async () => {
    if (!workspace?.contentRevision) return;
    const result = await mutations.requestNarrationJob.mutateAsync({
      contentRevisionId: workspace.contentRevision.id,
    });
    setNarrationJobId(result.job.id);
  };

  const handleRetryGenerate = () => {
    if (narrationJobId) {
      setNarrationJobId(null);
      setTimeout(() => setNarrationJobId(narrationJobId), 0);
    }
  };

  const handleToggle = async (occurrenceId: string, selected: boolean) => {
    if (!alignmentId) return;
    await mutations.setSelection.mutateAsync({ alignmentId, changes: [{ occurrenceId, selected }] });
  };

  const handleSaveTranslation = async (entryId: string, translation: string) => {
    setSavingEntryId(entryId);
    try {
      await mutations.setTranslations.mutateAsync({
        entryId,
        translations: translation.trim() ? [{ languageCode: 'am', translation: translation.trim() }] : [],
      });
    } finally {
      setSavingEntryId(null);
    }
  };

  const handleExtractClips = async (occurrenceIds: string[]) => {
    if (!workspace?.narration || !alignmentId || !occurrenceIds.length) return;
    const result = await mutations.requestClipJob.mutateAsync({
      narrationId: workspace.narration.id,
      alignmentId,
      occurrenceIds,
    });
    setClipJobId(result.job.id);
  };

  const handleApprove = async () => {
    if (!workspace?.contentRevision || !workspace.narration || !alignmentId) return;
    await mutations.approveRelease.mutateAsync({
      contentRevisionId: workspace.contentRevision.id,
      narrationId: workspace.narration.id,
      alignmentId,
    });
  };

  const selectedOccurrences = useMemo(
    () => (occurrencesQuery.data?.occurrences ?? []).filter((o) => o.selected),
    [occurrencesQuery.data],
  );

  if (workspaceQuery.isLoading) {
    return <p className="text-xs text-slate-500">Loading text workspace…</p>;
  }
  if (workspaceQuery.error || !workspace) {
    return <p className="text-xs text-rose-600">Failed to load text workspace.</p>;
  }

  return (
    <div className="space-y-4 rounded-xl border border-brand-200 bg-brand-50/30 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Text workspace (V2, admin-only)</p>

      <div>
        <label className="block text-xs font-medium text-slate-500">Text</label>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          className="mt-1 min-h-32 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm"
          rows={4}
        />
        <button
          type="button"
          onClick={handleSaveText}
          disabled={!hasUnsavedTextChanges || mutations.saveContentRevision.isPending}
          className="mt-2 rounded-md border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutations.saveContentRevision.isPending ? 'Saving…' : 'Save text'}
        </button>
      </div>

      <NarrationControls
        narration={workspace.narration}
        audioGenerationConfigured={workspace.audioGenerationConfigured}
        hasUnsavedTextChanges={hasUnsavedTextChanges}
        hasSavedRevision={Boolean(workspace.contentRevision)}
        isGenerating={
          mutations.requestNarrationJob.isPending ||
          narrationJobQuery.data?.job.status === 'QUEUED' ||
          narrationJobQuery.data?.job.status === 'RUNNING'
        }
        activeJob={narrationJobQuery.data?.job}
        onGenerate={handleGenerate}
        onRetry={handleRetryGenerate}
      />

      {workspace.alignmentSummary ? (
        <div>
          <p className="text-xs font-semibold text-slate-700 mb-2">Select learning words</p>
          {occurrencesQuery.data ? (
            <OccurrenceSelection
              occurrences={occurrencesQuery.data}
              pendingOccurrenceId={mutations.setSelection.isPending ? 'pending' : null}
              onToggle={handleToggle}
            />
          ) : (
            <p className="text-xs text-slate-500">Loading occurrences…</p>
          )}
        </div>
      ) : null}

      {workspace.alignmentSummary ? (
        <TextVocabularyEditor
          selectedOccurrences={selectedOccurrences}
          onSaveTranslation={handleSaveTranslation}
          onExtractClips={handleExtractClips}
          isExtracting={
            mutations.requestClipJob.isPending ||
            clipJobQuery.data?.job.status === 'QUEUED' ||
            clipJobQuery.data?.job.status === 'RUNNING'
          }
          savingEntryId={savingEntryId}
        />
      ) : null}

      <TextReadinessPanel
        readiness={readinessQuery.data?.readiness}
        onApprove={handleApprove}
        isApproving={mutations.approveRelease.isPending}
        approvedReleaseId={workspace.approvedTextReleaseId}
      />
    </div>
  );
}
