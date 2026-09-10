'use client';

import { TextReadiness } from '../../lib/textAuthoringTypes';

const REASON_LABELS: Record<string, string> = {
  NARRATION_MISSING: 'Narration has not been generated yet.',
  NARRATION_FAILED: 'The last narration generation failed.',
  ALIGNMENT_MISSING: 'No alignment is available yet.',
  ALIGNMENT_NEEDS_REVIEW: 'Alignment needs manual review before words can be trusted.',
  NO_WORDS_SELECTED: 'No learning words selected (this is allowed, not an error).',
  SELECTED_MISSING_TRANSLATION: 'Some selected words are missing a translation.',
  SELECTED_MISSING_CLIP: 'Some selected words are missing an extracted clip.',
};

interface TextReadinessPanelProps {
  readiness: TextReadiness | undefined;
  onApprove: () => void;
  isApproving: boolean;
  approvedReleaseId: string | null;
}

export function TextReadinessPanel({ readiness, onApprove, isApproving, approvedReleaseId }: TextReadinessPanelProps) {
  if (!readiness) {
    return <p className="text-xs text-slate-500">Readiness unavailable.</p>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
      <p className="text-xs font-semibold text-slate-700">Readiness</p>
      <ul className="text-xs text-slate-600 space-y-0.5">
        <li>Selected words: {readiness.selectedCount}</li>
        <li>Missing translation: {readiness.selectedMissingTranslationCount}</li>
        <li>Missing clip: {readiness.selectedMissingClipCount}</li>
        <li>Eligible for learners: {readiness.eligibleEntryIds.length}</li>
      </ul>
      {readiness.reasonCodes.length ? (
        <ul className="text-xs text-amber-700 list-disc pl-4">
          {readiness.reasonCodes.map((code) => (
            <li key={code}>{REASON_LABELS[code] ?? code}</li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        onClick={onApprove}
        disabled={!readiness.readyForApproval || isApproving}
        className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isApproving ? 'Approving…' : 'Approve text version'}
      </button>
      <p className="text-xs text-slate-500">
        {approvedReleaseId
          ? `Last approved release: ${approvedReleaseId}.`
          : 'Approving records an admin milestone snapshot; it does not make this content available to learners.'}
      </p>
    </div>
  );
}
