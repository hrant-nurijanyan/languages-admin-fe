'use client';

import { useQuery } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';
import { LessonSummary } from '../lib/apiTypes';

export const useLessons = () => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: ['lessons'],
    queryFn: () => request<{ lessons: LessonSummary[] }>('/lessons'),
  });
};
