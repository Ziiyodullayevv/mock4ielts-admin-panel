'use client';

import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Types that require text/passage content
const TEXT_TYPES = [
  'true_false_ng', 'short_answer', 'fill_in_blank',
  'sentence_completion', 'summary_completion', 'note_completion',
  'table_completion', 'flow_chart_completion',
];

// Types that have multiple answers (array)
const MULTI_ANSWER_TYPES = [
  'fill_in_blank', 'sentence_completion', 'summary_completion',
  'note_completion', 'table_completion', 'flow_chart_completion',
  'diagram_labeling', 'map_labeling',
];

// Writing types (no correct answer)
const WRITING_TYPES = ['essay', 'letter_report', 'graph_description'];

// Speaking types (no correct answer)
const SPEAKING_TYPES = ['interview', 'cue_card', 'discussion'];

// ----------------------------------------------------------------------

export function ContentFields() {
  const { control } = useFormContext();
  const type = useWatch({ control, name: 'type' }) as string;

  const { fields: optionFields, append: appendOption, remove: removeOption } =
    useFieldArray({ control, name: 'options' });

  const { fields: itemFields, append: appendItem, remove: removeItem } =
    useFieldArray({ control, name: 'items' });

  const { fields: matchOptionFields, append: appendMatchOption, remove: removeMatchOption } =
    useFieldArray({ control, name: 'match_options' });

  const { fields: labelFields, append: appendLabel, remove: removeLabel } =
    useFieldArray({ control, name: 'labels' });

  const { fields: speakingQuestionFields, append: appendSpeakingQ, remove: removeSpeakingQ } =
    useFieldArray({ control, name: 'speaking_questions' });

  const { fields: speakingPointFields, append: appendPoint, remove: removePoint } =
    useFieldArray({ control, name: 'speaking_points' });

  if (!type) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ py: 3, textAlign: 'center' }}>
        Select a question type to configure content
      </Typography>
    );
  }

  // ── Multiple Choice ──────────────────────────────────────────────
  if (type === 'multiple_choice') {
    return (
      <Stack spacing={2}>
        <RHFTextField name="instructions" label="Instructions" multiline rows={2} />
        <RHFTextField name="text" label="Question text" multiline rows={3} />
        <Divider />
        <Typography variant="subtitle2">Answer Options</Typography>
        {optionFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`options.${index}.value`}
            label={`Option ${String.fromCharCode(65 + index)}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeOption(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendOption({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add option
        </Button>
      </Stack>
    );
  }

  // ── Matching ─────────────────────────────────────────────────────
  if (type === 'matching') {
    return (
      <Stack spacing={2}>
        <RHFTextField name="instructions" label="Instructions" multiline rows={2} />
        <Divider />
        <Typography variant="subtitle2">Items (left column)</Typography>
        {itemFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`items.${index}.value`}
            label={`Item ${index + 1}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeItem(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendItem({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add item
        </Button>

        <Divider />
        <Typography variant="subtitle2">Match options (right column)</Typography>
        {matchOptionFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`match_options.${index}.value`}
            label={`Option ${String.fromCharCode(65 + index)}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeMatchOption(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendMatchOption({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add match option
        </Button>
      </Stack>
    );
  }

  // ── Diagram / Map Labeling ────────────────────────────────────────
  if (type === 'diagram_labeling' || type === 'map_labeling') {
    return (
      <Stack spacing={2}>
        <RHFTextField name="instructions" label="Instructions" multiline rows={2} />
        <RHFTextField name="media_url" label="Image URL" />
        <Divider />
        <Typography variant="subtitle2">Labels</Typography>
        {labelFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`labels.${index}.value`}
            label={`Label ${index + 1}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeLabel(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendLabel({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add label
        </Button>
      </Stack>
    );
  }

  // ── Writing types ─────────────────────────────────────────────────
  if (WRITING_TYPES.includes(type)) {
    return (
      <Stack spacing={2}>
        <RHFTextField name="prompt" label="Prompt / Task description" multiline rows={4} />
        <RHFTextField name="instructions" label="Instructions" multiline rows={2} />
        {(type === 'essay' || type === 'letter_report') && (
          <RHFTextField name="word_count" label="Minimum word count" type="number" />
        )}
        {type === 'graph_description' && (
          <RHFTextField name="media_url" label="Graph/Chart image URL" />
        )}
      </Stack>
    );
  }

  // ── Speaking: Interview / Discussion ─────────────────────────────
  if (type === 'interview' || type === 'discussion') {
    return (
      <Stack spacing={2}>
        <RHFTextField name="topic" label="Topic" />
        <RHFTextField name="instructions" label="Instructions (optional)" />
        <Divider />
        <Typography variant="subtitle2">Questions</Typography>
        {speakingQuestionFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`speaking_questions.${index}.value`}
            label={`Question ${index + 1}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeSpeakingQ(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendSpeakingQ({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add question
        </Button>
      </Stack>
    );
  }

  // ── Speaking: Cue Card ────────────────────────────────────────────
  if (type === 'cue_card') {
    return (
      <Stack spacing={2}>
        <RHFTextField name="topic" label="Cue card topic" multiline rows={2} />
        <RHFTextField name="instructions" label="Instructions (optional)" />
        <Divider />
        <Typography variant="subtitle2">Talk about points</Typography>
        {speakingPointFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`speaking_points.${index}.value`}
            label={`Point ${index + 1}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removePoint(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendPoint({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add point
        </Button>
      </Stack>
    );
  }

  // ── Short Answer ──────────────────────────────────────────────────
  if (type === 'short_answer') {
    return (
      <Stack spacing={2}>
        <RHFTextField name="instructions" label="Instructions" multiline rows={2} />
        <RHFTextField name="text" label="Passage / Audio context" multiline rows={4} />
        <Divider />
        <Typography variant="subtitle2">Questions</Typography>
        {itemFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`items.${index}.value`}
            label={`Question ${index + 1}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeItem(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendItem({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add question
        </Button>
      </Stack>
    );
  }

  // ── Default: text-based types (true_false_ng, fill_in_blank, etc.) ──
  return (
    <Stack spacing={2}>
      <RHFTextField name="instructions" label="Instructions" multiline rows={2} />
      <RHFTextField
        name="text"
        label={TEXT_TYPES.includes(type) ? 'Question / Passage text' : 'Question text'}
        multiline
        rows={4}
      />
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function AnswerFields() {
  const { control } = useFormContext();
  const type = useWatch({ control, name: 'type' }) as string;
  const items = useWatch({ control, name: 'items' }) as { value: string }[] | undefined;
  const options = useWatch({ control, name: 'options' }) as { value: string }[] | undefined;

  const { fields: answerFields, append: appendAnswer, remove: removeAnswer } =
    useFieldArray({ control, name: 'answers' });

  // No answer fields for writing/speaking
  if (!type || WRITING_TYPES.includes(type) || SPEAKING_TYPES.includes(type)) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
        {WRITING_TYPES.includes(type) || SPEAKING_TYPES.includes(type)
          ? 'No correct answer required for this type'
          : 'Select a question type first'}
      </Typography>
    );
  }

  // ── Multiple Choice ──
  if (type === 'multiple_choice') {
    const optionCount = options?.length ?? 0;
    return (
      <RHFSelect name="answer_letter" label="Correct answer">
        {Array.from({ length: optionCount }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
          <MenuItem key={letter} value={letter}>{letter}</MenuItem>
        ))}
      </RHFSelect>
    );
  }

  // ── True / False / NG ──
  if (type === 'true_false_ng') {
    return (
      <RHFSelect name="answer_tfng" label="Correct answer">
        <MenuItem value="TRUE">TRUE</MenuItem>
        <MenuItem value="FALSE">FALSE</MenuItem>
        <MenuItem value="NOT GIVEN">NOT GIVEN</MenuItem>
      </RHFSelect>
    );
  }

  // ── Short Answer ── (one answer per question)
  if (type === 'short_answer') {
    const questionList = items ?? [];
    return (
      <Stack spacing={1.5}>
        <Typography variant="caption" color="text.secondary">
          One answer per question (in order)
        </Typography>
        {questionList.map((question, index) => (
          <Stack key={index} direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 180, color: 'text.secondary' }} noWrap>
              {index + 1}. {question?.value || `Question ${index + 1}`}
            </Typography>
            <RHFTextField name={`answers.${index}.value`} label="Answer" />
          </Stack>
        ))}
        {questionList.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            Add questions in the Content section first
          </Typography>
        )}
      </Stack>
    );
  }

  // ── Sentence Completion ──
  if (type === 'sentence_completion') {
    return <RHFTextField name="answer_text" label="Correct answer" />;
  }

  // ── Matching ── (one text answer per item)
  if (type === 'matching') {
    const itemList = items ?? [];
    return (
      <Stack spacing={1.5}>
        <Typography variant="caption" color="text.secondary">
          Enter the matching option letter for each item
        </Typography>
        {itemList.map((item, index) => (
          <Stack key={index} direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 160, color: 'text.secondary' }} noWrap>
              {index + 1}. {item?.value || `Item ${index + 1}`}
            </Typography>
            <RHFTextField name={`match_answers.${index}.value`} label="Match" sx={{ maxWidth: 120 }} />
          </Stack>
        ))}
        {itemList.length === 0 && (
          <Typography variant="body2" color="text.disabled">
            Add items in the Content section first
          </Typography>
        )}
      </Stack>
    );
  }

  // ── Multi-answer types (fill in blank, etc.) ──
  if (MULTI_ANSWER_TYPES.includes(type)) {
    return (
      <Stack spacing={1.5}>
        <Typography variant="caption" color="text.secondary">
          Add one answer per blank (in order)
        </Typography>
        {answerFields.map((field, index) => (
          <RHFTextField
            key={field.id}
            name={`answers.${index}.value`}
            label={`Answer ${index + 1}`}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="error" edge="end" sx={{ mr: -0.5 }} onClick={() => removeAnswer(index)}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ))}
        <Button
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => appendAnswer({ value: '' })}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add answer
        </Button>
      </Stack>
    );
  }

  return null;
}
