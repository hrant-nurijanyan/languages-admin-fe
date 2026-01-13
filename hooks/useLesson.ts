'use client';

import { useQuery } from '@tanstack/react-query';
import { LessonSummary } from '../lib/apiTypes';
import { useApiClient } from './useApiClient';

export const useLesson = (lessonId: string) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => request<{ lesson: LessonSummary }>(`/lessons/${lessonId}`),
    enabled: Boolean(lessonId),
  });
};
