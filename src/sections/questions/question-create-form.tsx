'use client';

import type { QuestionType, QuestionSection } from 'src/types/question';

import * as z from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Form, RHFSelect, RHFTextField } from 'src/components/hook-form';

import { QUESTION_TYPES, SECTION_QUESTION_TYPES } from 'src/types/question';

import { buildAnswer, buildContent } from './question-form-utils';
import { AnswerFields, ContentFields } from './question-type-fields';

// ----------------------------------------------------------------------

const QuestionSchema = z.object({
  section: z.enum(['listening', 'reading', 'writing', 'speaking'], { error: 'Section is required' }),
  type: z.string().min(1, 'Type is required'),
  name: z.string().min(1, 'Name is required'),
  part_number: z.number().int().min(1).max(4).optional(),
  token_cost: z.number().min(0),
  media_url: z.string().optional(),

  // Content fields
  instructions: z.string().optional(),
  text: z.string().optional(),
  prompt: z.string().optional(),
  topic: z.string().optional(),
  word_count: z.number().optional(),
  options: z.array(z.object({ value: z.string() })).optional(),
  items: z.array(z.object({ value: z.string() })).optional(),
  match_options: z.array(z.object({ value: z.string() })).optional(),
  labels: z.array(z.object({ value: z.string() })).optional(),
  speaking_questions: z.array(z.object({ value: z.string() })).optional(),
  speaking_points: z.array(z.object({ value: z.string() })).optional(),

  // Answer fields
  answer_letter: z.string().optional(),
  answer_tfng: z.string().optional(),
  answer_text: z.string().optional(),
  answers: z.array(z.object({ value: z.string() })).optional(),
  match_answers: z.array(z.object({ value: z.string() })).optional(),
});

type FormValues = z.infer<typeof QuestionSchema>;

// ----------------------------------------------------------------------

export function QuestionCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      section: '' as QuestionSection,
      type: '',
      name: '' as string,
      part_number: '' as unknown as number,
      token_cost: 1,
      media_url: '',
      instructions: '',
      text: '',
      prompt: '',
      topic: '',
      answer_letter: '',
      answer_tfng: '',
      answer_text: '',
      options: [{ value: '' }, { value: '' }, { value: '' }, { value: '' }],
      items: [],
      match_options: [],
      labels: [],
      speaking_questions: [],
      speaking_points: [],
      answers: [],
      match_answers: [],
    },
  });

  const { watch, setValue, handleSubmit } = methods;
  const watchedSection = watch('section');
  const watchedType = watch('type');

  // Reset type when section changes
  useEffect(() => {
    setValue('type', '');
  }, [watchedSection, setValue]);

  // Reset content/answer fields when type changes
  useEffect(() => {
    if (!watchedType) return;
    setValue('instructions', '');
    setValue('text', '');
    setValue('prompt', '');
    setValue('topic', '');
    setValue('answer_letter', '');
    setValue('answer_tfng', '');
    setValue('answer_text', '');
    setValue('answers', []);
    setValue('match_answers', []);
  }, [watchedType, setValue]);

  const availableTypes = watchedSection
    ? SECTION_QUESTION_TYPES[watchedSection as QuestionSection]
    : [];

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => {
      const payload = {
        section: data.section,
        type: data.type,
        name: data.name || null,
        part_number: data.part_number ?? null,
        token_cost: data.token_cost,
        media_url: data.media_url || null,
        content: buildContent(data.type, data),
        correct_answer: buildAnswer(data.type, data),
      };
      return axiosInstance.post(endpoints.questions.list, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      router.push(paths.dashboard.questions.root);
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Left: basic info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="subtitle1">Basic Info</Typography>

              <RHFSelect name="section" label="Section *">
                {(['listening', 'reading', 'writing', 'speaking'] as QuestionSection[]).map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="type" label="Type *" disabled={!watchedSection}>
                {availableTypes.map((t: QuestionType) => (
                  <MenuItem key={t} value={t}>{QUESTION_TYPES[t]}</MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField name="name" label="Question name *" />

              <RHFSelect name="part_number" label="Part number">
                {[1, 2, 3, 4].map((n) => (
                  <MenuItem key={n} value={n}>Part {n}</MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="token_cost" label="Token cost *">
                {[1, 5, 10, 25, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>{n} token{n > 1 ? 's' : ''}</MenuItem>
                ))}
              </RHFSelect>
            </Stack>
          </Card>
        </Grid>

        {/* Right: content + answer */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Content</Typography>
              <ContentFields />
            </Card>

            {watchedType && !['essay', 'letter_report', 'graph_description', 'interview', 'cue_card', 'discussion'].includes(watchedType) && (
              <Card sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2.5 }}>Correct Answer</Typography>
                <AnswerFields />
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push(paths.dashboard.questions.root)}
        >
          Cancel
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isPending}>
          Create question
        </LoadingButton>
      </Box>
    </Form>
  );
}
