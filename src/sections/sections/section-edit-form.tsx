'use client';

import type { ISection, SectionType, QuestionType } from 'src/types/section';
import {
  SECTION_TYPES,
  QUESTION_TYPES,
  SECTION_ALLOWED_TYPES,
} from 'src/types/section';

import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { Form, Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { QuestionFormRenderer } from 'src/components/questions';

// ----------------------------------------------------------------------

type QuestionFormValues = {
  question_type: string;
  text: string;
  options: any[];
  correct_answer: any;
  explanation: string;
  points: number;
  order: number;
  metadata: Record<string, any>;
  image_url: string;
};

type PartFormValues = {
  title: string;
  instructions: string;
  passage_text: string;
  audio_url: string;
  audio_start_time: string;
  audio_end_time: string;
  image_url: string;
  questions: QuestionFormValues[];
};

type FormValues = {
  section_type: string;
  exam_type: string;
  title: string;
  instructions: string;
  audio_url: string;
  duration_minutes: number | '';
  difficulty: string;
  tags: string;
  parts: PartFormValues[];
};

type Props = {
  currentSection: ISection;
};

// ----------------------------------------------------------------------

export function SectionEditForm({ currentSection }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>({
    defaultValues: {
      section_type: currentSection.section_type,
      exam_type: currentSection.exam_type || 'academic',
      title: currentSection.title || '',
      instructions: currentSection.instructions || '',
      audio_url: currentSection.audio_url || '',
      duration_minutes: currentSection.duration_minutes ?? '',
      difficulty: currentSection.difficulty || 'medium',
      tags: currentSection.tags?.join(', ') || '',
      parts: (currentSection.parts || []).map((part) => ({
        title: part.title || '',
        instructions: part.instructions || '',
        passage_text: part.passage_text || '',
        audio_url: part.audio_url || '',
        audio_start_time: part.audio_start_time != null ? String(part.audio_start_time) : '',
        audio_end_time: part.audio_end_time != null ? String(part.audio_end_time) : '',
        image_url: part.image_url || '',
        questions: (part.questions || []).map((q) => ({
          question_type: q.question_type || '',
          text: q.text || '',
          options: q.options || [],
          correct_answer: q.correct_answer ?? null,
          explanation: q.explanation || '',
          points: q.points ?? 1,
          order: q.order ?? 1,
          metadata: q.metadata || {},
          image_url: q.image_url || '',
        })),
      })),
    },
  });

  const { control, handleSubmit, watch } = methods;
  const watchedSectionType = watch('section_type') as SectionType;

  const { fields: partFields } = useFieldArray({ control, name: 'parts' });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        section_type: data.section_type,
        exam_type: data.exam_type,
        title: data.title,
        instructions: data.instructions || null,
        audio_url: data.audio_url || null,
        duration_minutes: data.duration_minutes || null,
        difficulty: data.difficulty || null,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : null,
        parts: data.parts.map((part, pi) => ({
          title: part.title,
          instructions: part.instructions || null,
          passage_text: part.passage_text || null,
          audio_url: part.audio_url || null,
          audio_start_time: part.audio_start_time ? Number(part.audio_start_time) : null,
          audio_end_time: part.audio_end_time ? Number(part.audio_end_time) : null,
          image_url: part.image_url || null,
          order: pi,
          questions: part.questions.map((q, qi) => {
            const meta = q.metadata && Object.keys(q.metadata).length ? { ...q.metadata } : null;

            // Auto-derive metadata.blanks for diagram_completion
            if (q.question_type === 'diagram_completion' && q.correct_answer && meta) {
              meta.blanks = Object.keys(q.correct_answer).sort(
                (a, b) => Number(a) - Number(b)
              );
            }

            // Ensure word_limit is a number
            if (meta?.word_limit) {
              meta.word_limit = Number(meta.word_limit);
            }

            // Ensure select_count is a number
            if (meta?.select_count) {
              meta.select_count = Number(meta.select_count);
            }

            return {
              question_type: q.question_type,
              text: q.text,
              options: q.options?.length ? q.options : null,
              correct_answer: q.correct_answer,
              explanation: q.explanation || null,
              points: Number(q.points) || 1,
              order: q.order ? Number(q.order) : qi + 1,
              metadata: meta,
              image_url: q.image_url || null,
            };
          }),
        })),
      };
      return axiosInstance.patch(endpoints.sections.details(currentSection.id), payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      queryClient.invalidateQueries({ queryKey: ['section', currentSection.id] });
      router.push(paths.dashboard.sections.root);
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  const availableTypes = watchedSectionType ? SECTION_ALLOWED_TYPES[watchedSectionType] : [];

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="subtitle1">Section Info</Typography>

              <Field.Select name="section_type" label="Section Type *">
                {(Object.keys(SECTION_TYPES) as SectionType[]).map((s) => (
                  <MenuItem key={s} value={s}>
                    {SECTION_TYPES[s]}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Select name="exam_type" label="Exam Type">
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="general_training">General Training</MenuItem>
              </Field.Select>

              <Field.Text name="title" label="Title *" />
              <Field.Text name="instructions" label="Instructions" multiline rows={3} />

              {watchedSectionType === 'listening' && (
                <Field.Text name="audio_url" label="Audio URL" placeholder="https://..." />
              )}

              <Field.Text name="duration_minutes" label="Duration (minutes)" type="number" />

              <Field.Select name="difficulty" label="Difficulty">
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Field.Select>

              <Field.Text
                name="tags"
                label="Tags"
                placeholder="cambridge_18, test_1"
                helperText="Comma-separated"
              />
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {partFields.length === 0 && (
              <Card sx={{ p: 5, textAlign: 'center' }}>
                <Typography color="text.disabled">No parts available</Typography>
              </Card>
            )}

            {partFields.map((partField, partIndex) => (
              <PartAccordion
                key={partField.id}
                partIndex={partIndex}
                sectionType={watchedSectionType}
                availableTypes={availableTypes}
              />
            ))}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push(paths.dashboard.sections.root)}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isPending}>
          Save Changes
        </LoadingButton>
      </Box>
    </Form>
  );
}

// ----------------------------------------------------------------------
// Part Accordion with nested questions
// ----------------------------------------------------------------------

function PartAccordion({
  partIndex,
  sectionType,
  availableTypes,
}: {
  partIndex: number;
  sectionType: SectionType;
  availableTypes: QuestionType[];
}) {
  const { control, watch } = useFormContext();
  const partTitle = watch(`parts.${partIndex}.title`);

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control, name: `parts.${partIndex}.questions` });

  return (
    <Accordion defaultExpanded={partIndex === 0}>
      <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="subtitle1">{partTitle || `Part ${partIndex + 1}`}</Typography>
          <Typography variant="caption" color="text.secondary">
            ({questionFields.length} questions)
          </Typography>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={2.5}>
          <Field.Text name={`parts.${partIndex}.title`} label="Part Title" size="small" />
          <Field.Text
            name={`parts.${partIndex}.instructions`}
            label="Instructions"
            multiline
            rows={2}
            size="small"
          />

          {sectionType === 'reading' && (
            <Field.Text
              name={`parts.${partIndex}.passage_text`}
              label="Passage Text"
              multiline
              rows={5}
              size="small"
            />
          )}

          {sectionType === 'listening' && (
            <Stack direction="row" spacing={2}>
              <Field.Text
                name={`parts.${partIndex}.audio_url`}
                label="Part Audio URL"
                size="small"
              />
              <Field.Text
                name={`parts.${partIndex}.audio_start_time`}
                label="Start (sec)"
                type="number"
                size="small"
                sx={{ maxWidth: 130 }}
              />
              <Field.Text
                name={`parts.${partIndex}.audio_end_time`}
                label="End (sec)"
                type="number"
                size="small"
                sx={{ maxWidth: 130 }}
              />
            </Stack>
          )}

          {sectionType === 'writing' && partIndex === 0 && (
            <Field.Text
              name={`parts.${partIndex}.image_url`}
              label="Image URL (chart/graph)"
              size="small"
            />
          )}

          {/* Questions */}
          {questionFields.map((qField, qIndex) => (
            <QuestionItem
              key={qField.id}
              partIndex={partIndex}
              questionIndex={qIndex}
              availableTypes={availableTypes}
              onRemove={() => removeQuestion(qIndex)}
            />
          ))}

          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() =>
              appendQuestion({
                question_type: '',
                text: '',
                options: [],
                correct_answer: null,
                explanation: '',
                points: 1,
                order: questionFields.length + 1,
                metadata: {},
                image_url: '',
              })
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Question
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// ----------------------------------------------------------------------
// Question Item
// ----------------------------------------------------------------------

function QuestionItem({
  partIndex,
  questionIndex,
  availableTypes,
  onRemove,
}: {
  partIndex: number;
  questionIndex: number;
  availableTypes: QuestionType[];
  onRemove: () => void;
}) {
  const { watch } = useFormContext();
  const prefix = `parts.${partIndex}.questions.${questionIndex}`;
  const questionType = watch(`${prefix}.question_type`) as QuestionType;

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Question {questionIndex + 1}</Typography>
          <IconButton color="error" size="small" onClick={onRemove}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Field.Select
            name={`${prefix}.question_type`}
            label="Question Type"
            size="small"
            sx={{ minWidth: 260 }}
          >
            {availableTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {QUESTION_TYPES[t]}
              </MenuItem>
            ))}
          </Field.Select>

          <Field.Text
            name={`${prefix}.points`}
            label="Points"
            type="number"
            size="small"
            sx={{ maxWidth: 100 }}
          />
          <Field.Text
            name={`${prefix}.order`}
            label="Order"
            type="number"
            size="small"
            sx={{ maxWidth: 100 }}
          />
        </Stack>

        {questionType && <QuestionFormRenderer questionType={questionType} prefix={prefix} />}
      </Stack>
    </Card>
  );
}
