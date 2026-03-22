import type { IQuestion } from 'src/types/question';

// ----------------------------------------------------------------------

export type QuestionFormValues = {
  section: 'listening' | 'reading' | 'writing' | 'speaking';
  type: string;
  name?: string;
  part_number?: number;
  token_cost: number;
  media_url?: string;
  instructions?: string;
  text?: string;
  prompt?: string;
  topic?: string;
  word_count?: number;
  options?: { value: string }[];
  items?: { value: string }[];
  match_options?: { value: string }[];
  labels?: { value: string }[];
  speaking_questions?: { value: string }[];
  speaking_points?: { value: string }[];
  answer_letter?: string;
  answer_tfng?: string;
  answer_text?: string;
  answers?: { value: string }[];
  match_answers?: { value: string }[];
};

export function buildContent(type: string, data: QuestionFormValues): Record<string, unknown> | null {
  const instructions = data.instructions || undefined;
  if (type === 'multiple_choice') {
    return { text: data.text, options: data.options?.map((o) => o.value).filter(Boolean) ?? [], instructions };
  }
  if (type === 'short_answer') {
    return {
      text: data.text,
      instructions,
      questions: data.items?.map((o) => o.value).filter(Boolean) ?? [],
    };
  }
  if (type === 'matching') {
    return {
      items: data.items?.map((o) => o.value).filter(Boolean) ?? [],
      match_options: data.match_options?.map((o) => o.value).filter(Boolean) ?? [],
      instructions,
    };
  }
  if (type === 'diagram_labeling' || type === 'map_labeling') {
    return { labels: data.labels?.map((o) => o.value).filter(Boolean) ?? [], instructions };
  }
  if (['essay', 'letter_report', 'graph_description'].includes(type)) {
    return { prompt: data.prompt, instructions, word_count: data.word_count ?? undefined };
  }
  if (type === 'interview' || type === 'discussion') {
    return { topic: data.topic, questions: data.speaking_questions?.map((o) => o.value).filter(Boolean) ?? [], instructions };
  }
  if (type === 'cue_card') {
    return { topic: data.topic, points: data.speaking_points?.map((o) => o.value).filter(Boolean) ?? [], instructions };
  }
  return { text: data.text, instructions };
}

export function buildAnswer(type: string, data: QuestionFormValues): Record<string, unknown> | null {
  if (type === 'multiple_choice') return data.answer_letter ? { answer: data.answer_letter } : null;
  if (type === 'true_false_ng') return data.answer_tfng ? { answer: data.answer_tfng } : null;
  if (type === 'short_answer') {
    const answers = data.answers?.map((a) => a.value).filter(Boolean) ?? [];
    return answers.length ? { answers } : null;
  }
  if (type === 'sentence_completion') {
    return data.answer_text ? { answer: data.answer_text } : null;
  }
  if (type === 'matching') {
    const pairs = (data.items ?? []).map((item, i) => ({
      item: item.value,
      match: data.match_answers?.[i]?.value ?? '',
    }));
    return pairs.length ? { pairs } : null;
  }
  const multiTypes = [
    'fill_in_blank', 'note_completion', 'table_completion', 'flow_chart_completion',
    'summary_completion', 'diagram_labeling', 'map_labeling',
  ];
  if (multiTypes.includes(type)) {
    const answers = data.answers?.map((a) => a.value).filter(Boolean) ?? [];
    return answers.length ? { answers } : null;
  }
  return null;
}

export function parseQuestionToForm(question: IQuestion): Partial<QuestionFormValues> {
  const content = question.content ?? {};
  const answer = question.correct_answer ?? {};
  const type = question.type ?? '';

  const contentFields: Partial<QuestionFormValues> = {
    instructions: (content.instructions as string) ?? '',
    text: (content.text as string) ?? '',
    prompt: (content.prompt as string) ?? '',
    topic: (content.topic as string) ?? '',
    word_count: (content.word_count as number) ?? undefined,
    options: ((content.options as string[]) ?? []).map((v) => ({ value: v })),
    items: type === 'short_answer'
      ? ((content.questions as string[]) ?? []).map((v) => ({ value: v }))
      : ((content.items as string[]) ?? []).map((v) => ({ value: v })),
    match_options: ((content.match_options as string[]) ?? []).map((v) => ({ value: v })),
    labels: ((content.labels as string[]) ?? []).map((v) => ({ value: v })),
    speaking_questions: ((content.questions as string[]) ?? []).map((v) => ({ value: v })),
    speaking_points: ((content.points as string[]) ?? []).map((v) => ({ value: v })),
  };

  let answerFields: Partial<QuestionFormValues> = {};
  if (type === 'multiple_choice') {
    answerFields = { answer_letter: (answer.answer as string) ?? '' };
  } else if (type === 'true_false_ng') {
    answerFields = { answer_tfng: (answer.answer as string) ?? '' };
  } else if (type === 'short_answer') {
    const answers = (answer.answers as string[]) ?? [];
    answerFields = { answers: answers.map((v) => ({ value: v })) };
  } else if (type === 'sentence_completion') {
    answerFields = { answer_text: (answer.answer as string) ?? '' };
  } else if (type === 'matching') {
    const pairs = (answer.pairs as { item: string; match: string }[]) ?? [];
    answerFields = { match_answers: pairs.map((p) => ({ value: p.match })) };
  } else {
    const answers = (answer.answers as string[]) ?? [];
    answerFields = { answers: answers.map((v) => ({ value: v })) };
  }

  return {
    section: question.section,
    type: question.type ?? '',
    name: question.name ?? '',
    part_number: question.part_number ?? undefined,
    token_cost: question.token_cost,
    media_url: question.media_url ?? '',
    ...contentFields,
    ...answerFields,
  };
}
