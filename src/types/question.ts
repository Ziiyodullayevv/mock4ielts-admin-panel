export type QuestionSection = 'listening' | 'reading' | 'writing' | 'speaking';

export type QuestionType =
  | 'multiple_choice'
  | 'true_false_ng'
  | 'matching'
  | 'fill_in_blank'
  | 'short_answer'
  | 'sentence_completion'
  | 'summary_completion'
  | 'note_completion'
  | 'table_completion'
  | 'flow_chart_completion'
  | 'diagram_labeling'
  | 'map_labeling'
  | 'essay'
  | 'letter_report'
  | 'graph_description'
  | 'interview'
  | 'cue_card'
  | 'discussion';

export type IQuestion = {
  id: string;
  name: string | null;
  section: QuestionSection;
  part_number: number | null;
  type: QuestionType | null;
  content: Record<string, unknown> | null;
  media_url: string | null;
  correct_answer: Record<string, unknown> | null;
  token_cost: number;
  created_at: string;
  updated_at: string;
};

export const QUESTION_SECTIONS: Record<QuestionSection, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};

export const QUESTION_TYPES: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  true_false_ng: 'True / False / NG',
  matching: 'Matching',
  fill_in_blank: 'Fill in the Blank',
  short_answer: 'Short Answer',
  sentence_completion: 'Sentence Completion',
  summary_completion: 'Summary Completion',
  note_completion: 'Note Completion',
  table_completion: 'Table Completion',
  flow_chart_completion: 'Flow Chart',
  diagram_labeling: 'Diagram Labeling',
  map_labeling: 'Map Labeling',
  essay: 'Essay',
  letter_report: 'Letter / Report',
  graph_description: 'Graph Description',
  interview: 'Interview',
  cue_card: 'Cue Card',
  discussion: 'Discussion',
};

export const SECTION_QUESTION_TYPES: Record<QuestionSection, QuestionType[]> = {
  listening: [
    'multiple_choice', 'true_false_ng', 'matching', 'fill_in_blank',
    'short_answer', 'note_completion', 'table_completion', 'flow_chart_completion',
    'diagram_labeling', 'map_labeling', 'sentence_completion', 'summary_completion',
  ],
  reading: [
    'multiple_choice', 'true_false_ng', 'matching', 'fill_in_blank',
    'short_answer', 'sentence_completion', 'summary_completion', 'note_completion',
    'table_completion', 'diagram_labeling', 'flow_chart_completion',
  ],
  writing: ['essay', 'letter_report', 'graph_description'],
  speaking: ['interview', 'cue_card', 'discussion'],
};

export const SECTION_COLORS = {
  listening: 'info',
  reading: 'success',
  writing: 'warning',
  speaking: 'error',
} as const;
