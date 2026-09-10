'use client';

import { useState } from 'react';
import { useAudioAsset } from '../../hooks/useAudioAsset';
import { WordOccurrenceDto } from '../../lib/textAuthoringTypes';

const TARGET_LANGUAGE = 'am';

interface TextVocabularyEditorProps {
  selectedOccurrences: WordOccurrenceDto[];
  onSaveTranslation: (entryId: string, translation: string) => void;
  onExtractClips: (occurrenceIds: string[]) => void;
  isExtracting: boolean;
  savingEntryId: string | null;
}

function OccurrenceRow({
  occurrence,
  onSaveTranslation,
  savingEntryId,
}: {
  occurrence: WordOccurrenceDto;
  onSaveTranslation: (entryId: string, translation: string) => void;
  savingEntryId: string | null;
}) {
  const existing = occurrence.translations.find((t) => t.languageCode === TARGET_LANGUAGE);
  const [draft, setDraft] = useState(existing?.translation ?? '');
  const { url: clipUrl, error: clipError } = useAudioAsset(occurrence.clipAssetId);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
      <p className="text-sm font-medium text-slate-900">
        {occurrence.text} <span className="text-xs text-slate-400">(position {occurrence.ordinal})</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Contextual translation (Armenian)"
          className="min-w-48 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          aria-label={`Translation for ${occurrence.text} at position ${occurrence.ordinal}`}
        />
        <button
          type="button"
          onClick={() => occurrence.entryId && onSaveTranslation(occurrence.entryId, draft)}
          disabled={!occurrence.entryId || savingEntryId === occurrence.entryId}
          className="rounded-md border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingEntryId === occurrence.entryId ? 'Saving…' : 'Save translation'}
        </button>
      </div>
      {occurrence.clipAssetId ? (
        clipUrl ? (
          <audio controls preload="metadata" className="w-full" src={clipUrl} data-testid={`clip-player-${occurrence.id}`} />
        ) : clipError ? (
          <p className="text-xs text-rose-600">Failed to load clip: {clipError}</p>
        ) : (
          <p className="text-xs text-slate-500">Loading clip…</p>
        )
      ) : (
        <p className="text-xs text-slate-500">No clip extracted yet for this occurrence.</p>
      )}
    </div>
  );
}

/**
 * One entry per occurrence, never per spelling: the same word selected
 * twice in one text (or in a different text entirely) always gets its own
 * translation field and clip here.
 */
export function TextVocabularyEditor({
  selectedOccurrences,
  onSaveTranslation,
  onExtractClips,
  isExtracting,
  savingEntryId,
}: TextVocabularyEditorProps) {
  const missingClipIds = selectedOccurrences.filter((o) => !o.clipAssetId).map((o) => o.id);

  if (!selectedOccurrences.length) {
    return <p className="text-xs text-slate-500">No learning words selected yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Selected words ({selectedOccurrences.length})</p>
        <button
          type="button"
          onClick={() => onExtractClips(missingClipIds)}
          disabled={!missingClipIds.length || isExtracting}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExtracting ? 'Extracting…' : `Extract missing clips (${missingClipIds.length})`}
        </button>
      </div>
      {selectedOccurrences.map((occurrence) => (
        <OccurrenceRow
          key={occurrence.id}
          occurrence={occurrence}
          onSaveTranslation={onSaveTranslation}
          savingEntryId={savingEntryId}
        />
      ))}
    </div>
  );
}
