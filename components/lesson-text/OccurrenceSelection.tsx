'use client';

import { OccurrencesResponse } from '../../lib/textAuthoringTypes';

interface OccurrenceSelectionProps {
  occurrences: OccurrencesResponse;
  pendingOccurrenceId: string | null;
  onToggle: (occurrenceId: string, selected: boolean) => void;
}

/**
 * Repeated words are disambiguated by sentence/position; nothing is selected
 * by default (product requirement: most simple words are deliberately
 * excluded, "select all" is never the default).
 */
export function OccurrenceSelection({ occurrences, pendingOccurrenceId, onToggle }: OccurrenceSelectionProps) {
  const occurrenceById = new Map(occurrences.occurrences.map((o) => [o.id, o]));

  if (occurrences.status === 'NEEDS_REVIEW') {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        This narration&apos;s alignment needs manual review before words can be selected. The full narration is still
        available for ordinary playback.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {occurrences.sentences.map((sentence) => (
        <div key={sentence.id} className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500 mb-2">{sentence.text}</p>
          <div className="flex flex-wrap gap-2">
            {sentence.occurrenceIds.map((ordinal) => {
              const occurrence = occurrences.occurrences.find(
                (o) => o.ordinal === ordinal && o.sentenceId === sentence.id,
              );
              if (!occurrence) return null;
              const disabled = occurrence.mappingStatus === 'UNMAPPED' || pendingOccurrenceId === occurrence.id;
              return (
                <label
                  key={occurrence.id}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${
                    occurrence.selected ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-700'
                  } ${disabled ? 'opacity-50' : ''}`}
                  title={occurrence.mappingStatus === 'UNMAPPED' ? 'Not mappable to speech in this narration' : undefined}
                >
                  <input
                    type="checkbox"
                    checked={occurrence.selected}
                    disabled={disabled}
                    onChange={(e) => onToggle(occurrence.id, e.target.checked)}
                    aria-label={`Select occurrence "${occurrence.text}" (position ${occurrence.ordinal})`}
                  />
                  {occurrence.text}
                </label>
              );
            })}
          </div>
        </div>
      ))}
      {!occurrenceById.size ? <p className="text-xs text-slate-500">No words mapped yet.</p> : null}
    </div>
  );
}
