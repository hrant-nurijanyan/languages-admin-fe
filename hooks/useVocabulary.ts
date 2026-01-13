'use client';

import { useQuery } from '@tanstack/react-query';
import { VocabularyEntry } from '../lib/apiTypes';
import { useApiClient } from './useApiClient';

export const useVocabulary = () => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: ['vocabulary'],
    queryFn: () => request<{ entries: VocabularyEntry[] }>('/vocabulary'),
  });
};

export const useVocabularyEntry = (entryId?: string) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: ['vocabulary', entryId],
    queryFn: () => request<{ entry: VocabularyEntry }>(`/vocabulary/${entryId}`),
    enabled: Boolean(entryId),
  });
};
