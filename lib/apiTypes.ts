export type LessonStatus = 'DRAFT' | 'PUBLISHED';

export type TaskType = 'PICK_ONE' | 'FILL_IN_BLANK' | 'MATCH';

export interface TaskOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface TaskSummary {
  id: string;
  prompt: string;
  type: TaskType;
  order: number;
  options: TaskOption[];
}

export type VocabularyKind = 'WORD' | 'PHRASE' | 'SENTENCE';

export interface VocabularyTranslation {
  id: string;
  languageCode: string;
  translation: string;
  usageExample?: string | null;
}

export interface VocabularyEntry {
  id: string;
  englishText: string;
  kind: VocabularyKind;
  notes?: string | null;
  tags: string[];
  translations: VocabularyTranslation[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description?: string | null;
  status: LessonStatus;
  tasks: TaskSummary[];
}
