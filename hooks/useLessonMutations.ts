'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LessonSummary, LessonStatus, TaskType } from '../lib/apiTypes';
import { useApiClient } from './useApiClient';

type UpdateLessonInput = {
  lessonId: string;
  data: Partial<Pick<LessonSummary, 'title' | 'description' | 'status'>> & {
    tasks?: Array<{
      id?: string;
      prompt: string;
      type: TaskType;
      order?: number;
      config?: Record<string, unknown>;
      options?: Array<{ id?: string; label: string; isCorrect?: boolean }>;
    }>;
  };
};

type CreateTaskInput = {
  lessonId: string;
  prompt: string;
  type: TaskType;
  order?: number;
  config?: Record<string, unknown>;
  options?: Array<{ label: string; isCorrect?: boolean }>;
};

type DeleteTaskInput = { lessonId: string; taskId: string };
type DeleteLessonInput = { lessonId: string };

export const useLessonMutations = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();

  const invalidate = (lessonId: string) => {
    queryClient.invalidateQueries({ queryKey: ['lessons'] });
    queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
  };

  const updateLesson = useMutation({
    mutationFn: ({ lessonId, data }: UpdateLessonInput) =>
      request<{ lesson: LessonSummary }>(`/lessons/${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      invalidate(variables.lessonId);
    },
  });

  const createTask = useMutation({
    mutationFn: ({ lessonId, ...data }: CreateTaskInput) =>
      request<{ task: { id: string } }>(`/lessons/${lessonId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      invalidate(variables.lessonId);
    },
  });

  const deleteTask = useMutation({
    mutationFn: ({ lessonId, taskId }: DeleteTaskInput) =>
      request<void>(`/lessons/${lessonId}/tasks/${taskId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, variables) => {
      invalidate(variables.lessonId);
    },
  });

  const deleteLesson = useMutation({
    mutationFn: ({ lessonId }: DeleteLessonInput) =>
      request<void>(`/lessons/${lessonId}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      invalidate(variables.lessonId);
    },
  });

  return { updateLesson, createTask, deleteTask, deleteLesson };
};
