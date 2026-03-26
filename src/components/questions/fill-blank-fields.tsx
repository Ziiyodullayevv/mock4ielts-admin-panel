'use client';

import type { QuestionType } from 'src/types/section';

import { useState, useEffect } from 'react';
import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

// ----------------------------------------------------------------------

type Props = {
  prefix: string;
  questionType: QuestionType;
};

// ----------------------------------------------------------------------
// Comma-separated field — parses only on blur so commas/spaces work
// ----------------------------------------------------------------------

function CommaSeparatedField({
  label,
  value,
  onChange,
  fullWidth = true,
  size = 'small' as const,
}: {
  label: string;
  value: string[];
  onChange: (answers: string[]) => void;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}) {
  const [rawText, setRawText] = useState(Array.isArray(value) ? value.join(', ') : '');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setRawText(Array.isArray(value) ? value.join(', ') : '');
    }
  }, [value, focused]);

  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={rawText}
      onFocus={() => setFocused(true)}
      onChange={(e) => setRawText(e.target.value)}
      onBlur={() => {
        setFocused(false);
        const answers = rawText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        onChange(answers);
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Blank Answers Editor (shared)
// Correct answer is an object: { "1": ["answer1", "answer2"], "2": ["answer3"] }
// ----------------------------------------------------------------------

function extractBlankIds(text: string): string[] {
  const regex = /___(\d+)___/g;
  const ids: string[] = [];
  let match = regex.exec(text);
  while (match) {
    if (!ids.includes(match[1])) ids.push(match[1]);
    match = regex.exec(text);
  }
  return ids.sort((a, b) => Number(a) - Number(b));
}

function BlankAnswersEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const correctAnswer: Record<string, string[]> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};

  // Watch text fields that may contain ___N___ patterns
  const text: string = useWatch({ control, name: `${prefix}.text` }) || '';
  const notesHtml: string = useWatch({ control, name: `${prefix}.metadata.notes_html` }) || '';
  const table: { rows?: string[][] } =
    useWatch({ control, name: `${prefix}.metadata.table` }) || {};
  const steps: { text?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.steps` }) || [];
  const sentences: { text?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.sentences` }) || [];
  const formLayout: { value?: string }[] =
    useWatch({ control, name: `${prefix}.metadata.form_layout` }) || [];

  // Collect all text sources to find ___N___ patterns
  const allText = [
    text,
    notesHtml,
    ...(table.rows?.flat() || []),
    ...steps.map((s) => s?.text || ''),
    ...sentences.map((s) => s?.text || ''),
    ...formLayout.map((f) => f?.value || ''),
  ].join(' ');

  const detectedIds = extractBlankIds(allText);

  const blankKeys = Object.keys(correctAnswer).sort((a, b) => Number(a) - Number(b));

  // Auto-sync: add detected blanks that are not yet in correct_answer
  const handleAutoDetect = () => {
    const updated = { ...correctAnswer };
    let changed = false;
    for (const id of detectedIds) {
      if (!(id in updated)) {
        updated[id] = [''];
        changed = true;
      }
    }
    if (changed) {
      setValue(`${prefix}.correct_answer`, updated, { shouldDirty: true });
    }
  };

  const handleAddBlank = () => {
    const allNums = [...blankKeys, ...detectedIds].map(Number).filter((n) => !Number.isNaN(n));
    const nextKey = String((allNums.length > 0 ? Math.max(...allNums) : 0) + 1);
    setValue(
      `${prefix}.correct_answer`,
      { ...correctAnswer, [nextKey]: [''] },
      { shouldDirty: true }
    );
  };

  const handleRemoveBlank = (key: string) => {
    const next = { ...correctAnswer };
    delete next[key];
    setValue(`${prefix}.correct_answer`, next, { shouldDirty: true });
  };

  const handleRenameBlank = (oldKey: string, newKey: string) => {
    if (!newKey || newKey === oldKey || newKey in correctAnswer) return;
    const next = { ...correctAnswer };
    next[newKey] = next[oldKey];
    delete next[oldKey];
    setValue(`${prefix}.correct_answer`, next, { shouldDirty: true });
  };

  // Blanks not yet in correct_answer
  const missingIds = detectedIds.filter((id) => !(id in correctAnswer));

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography variant="subtitle2">Blank Answers</Typography>
        {missingIds.length > 0 && (
          <Button size="small" variant="outlined" onClick={handleAutoDetect}>
            Auto-detect ({missingIds.length} found)
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Blank numbers must match ___N___ in the text. Separate multiple acceptable answers with
        commas.
      </Typography>

      {blankKeys.map((key) => (
        <Stack key={key} direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            label="#"
            value={key}
            onChange={(e) => handleRenameBlank(key, e.target.value.trim())}
            sx={{ width: 64 }}
          />
          <CommaSeparatedField
            label="Acceptable answers (comma-separated)"
            value={correctAnswer[key] || []}
            onChange={(answers) =>
              setValue(
                `${prefix}.correct_answer`,
                { ...correctAnswer, [key]: answers },
                { shouldDirty: true }
              )
            }
          />
          <IconButton color="error" onClick={() => handleRemoveBlank(key)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={handleAddBlank}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Blank
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Common metadata fields
// ----------------------------------------------------------------------

function CommonMetadata({ prefix }: { prefix: string }) {
  return (
    <Stack direction="row" spacing={2}>
      <RHFTextField
        name={`${prefix}.metadata.word_limit`}
        label="Word Limit"
        type="number"
        sx={{ maxWidth: 160 }}
      />
      <RHFTextField
        name={`${prefix}.metadata.instruction`}
        label="Instruction"
        placeholder="e.g. Write NO MORE THAN TWO WORDS"
      />
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Form Completion — metadata.form_layout: { label, value }[]
// ----------------------------------------------------------------------

function FormLayoutEditor({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.form_layout`,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Form Layout</Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${prefix}.metadata.form_layout.${index}.label`}
            label="Field Label"
            sx={{ maxWidth: 200 }}
          />
          <RHFTextField
            name={`${prefix}.metadata.form_layout.${index}.value`}
            label="Value / Blank placeholder"
          />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: '', value: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Form Field
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Table Completion — metadata.table: { headers: string[], rows: string[][] }
// ----------------------------------------------------------------------

function TableEditor({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const table: { headers: string[]; rows: string[][] } = useWatch({
    control,
    name: `${prefix}.metadata.table`,
  }) || { headers: [], rows: [] };

  const handleAddHeader = () => {
    setValue(
      `${prefix}.metadata.table`,
      {
        headers: [...table.headers, ''],
        rows: table.rows.map((row) => [...row, '']),
      },
      { shouldDirty: true }
    );
  };

  const handleRemoveHeader = (colIndex: number) => {
    setValue(
      `${prefix}.metadata.table`,
      {
        headers: table.headers.filter((_, i) => i !== colIndex),
        rows: table.rows.map((row) => row.filter((_, i) => i !== colIndex)),
      },
      { shouldDirty: true }
    );
  };

  const handleHeaderChange = (colIndex: number, value: string) => {
    const newHeaders = [...table.headers];
    newHeaders[colIndex] = value;
    setValue(`${prefix}.metadata.table`, { ...table, headers: newHeaders }, { shouldDirty: true });
  };

  const handleAddRow = () => {
    setValue(
      `${prefix}.metadata.table`,
      {
        ...table,
        rows: [...table.rows, new Array(table.headers.length).fill('')],
      },
      { shouldDirty: true }
    );
  };

  const handleRemoveRow = (rowIndex: number) => {
    setValue(
      `${prefix}.metadata.table`,
      { ...table, rows: table.rows.filter((_, i) => i !== rowIndex) },
      { shouldDirty: true }
    );
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = table.rows.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row
    );
    setValue(`${prefix}.metadata.table`, { ...table, rows: newRows }, { shouldDirty: true });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Table</Typography>

      <Typography variant="caption" color="text.secondary">
        Use ___N___ (e.g. ___1___) to mark blanks in cells
      </Typography>

      {/* Headers */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="caption" sx={{ minWidth: 60 }}>
          Headers:
        </Typography>
        {table.headers.map((header, ci) => (
          <Stack key={ci} direction="row" spacing={0.5} alignItems="center">
            <TextField
              size="small"
              value={header}
              onChange={(e) => handleHeaderChange(ci, e.target.value)}
              placeholder={`Col ${ci + 1}`}
              sx={{ width: 140 }}
            />
            <IconButton size="small" color="error" onClick={() => handleRemoveHeader(ci)}>
              <Iconify icon="mingcute:close-line" width={16} />
            </IconButton>
          </Stack>
        ))}
        <Button size="small" onClick={handleAddHeader}>
          + Column
        </Button>
      </Stack>

      {/* Rows */}
      {table.rows.map((row, ri) => (
        <Stack key={ri} direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ minWidth: 60 }}>
            Row {ri + 1}
          </Typography>
          {row.map((cell, ci) => (
            <TextField
              key={ci}
              size="small"
              value={cell}
              onChange={(e) => handleCellChange(ri, ci, e.target.value)}
              sx={{ width: 140 }}
            />
          ))}
          <IconButton size="small" color="error" onClick={() => handleRemoveRow(ri)}>
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={handleAddRow}
        sx={{ alignSelf: 'flex-start' }}
        disabled={table.headers.length === 0}
      >
        Add Row
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Flow Chart Completion — metadata.steps: { step: number; text: string }[]
// ----------------------------------------------------------------------

function FlowChartEditor({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.steps`,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Flow Chart Steps</Typography>
      <Typography variant="caption" color="text.secondary">
        Use ___N___ (e.g. ___1___) to mark blanks in step text
      </Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 600 }}>
            Step {index + 1}
          </Typography>
          <RHFTextField name={`${prefix}.metadata.steps.${index}.text`} label="Step text" />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ step: fields.length + 1, text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Step
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Sentence Completion — metadata.sentences: { order: number; text: string }[]
// ----------------------------------------------------------------------

function SentenceEditor({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.sentences`,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Sentences</Typography>
      <Typography variant="caption" color="text.secondary">
        Use ___N___ (e.g. ___1___) to mark blanks in sentence text
      </Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 40, fontWeight: 600 }}>
            {index + 1}.
          </Typography>
          <RHFTextField name={`${prefix}.metadata.sentences.${index}.text`} label="Sentence" />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ order: fields.length + 1, text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Sentence
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Short Answer Fields
// ----------------------------------------------------------------------

export function ShortAnswerFields({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();
  const correctAnswer: string[] = useWatch({ control, name: `${prefix}.correct_answer` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Stack direction="row" spacing={2}>
        <RHFTextField
          name={`${prefix}.metadata.word_limit`}
          label="Word Limit"
          type="number"
          sx={{ maxWidth: 160 }}
        />
        <RHFTextField
          name={`${prefix}.metadata.instruction`}
          label="Instruction"
          placeholder="e.g. Write NO MORE THAN THREE WORDS"
        />
      </Stack>

      <Divider />

      <Typography variant="subtitle2">Acceptable Answers</Typography>
      <Typography variant="caption" color="text.secondary">
        Separate multiple acceptable answers with commas
      </Typography>

      <CommaSeparatedField
        label="Correct answers (comma-separated)"
        value={correctAnswer}
        size="medium"
        onChange={(answers) => setValue(`${prefix}.correct_answer`, answers, { shouldDirty: true })}
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// Note Completion — metadata.notes_html: string (HTML)
// correct_answer: { "31": ["carbon footprint"], ... }
// ----------------------------------------------------------------------

function NoteCompletionFields({ prefix }: { prefix: string }) {
  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Title / Instructions" multiline rows={2} />

      <CommonMetadata prefix={prefix} />

      <Divider />

      <RHFTextField
        name={`${prefix}.metadata.notes_html`}
        label="Notes (HTML)"
        multiline
        rows={8}
        helperText="Use ___N___ (e.g. ___31___) to mark blanks. HTML tags are supported."
        placeholder="<h4>Title</h4><ul><li>The main goal is ___31___</li></ul>"
      />

      <Divider />

      <BlankAnswersEditor prefix={prefix} />

      <Divider />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// Diagram Completion
// image_url: string
// metadata: { word_limit, instruction, blanks: ["26","27"] }
// correct_answer: { "26": ["collection tank"], ... }
// ----------------------------------------------------------------------

function DiagramCompletionFields({ prefix }: { prefix: string }) {
  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

      <RHFTextField
        name={`${prefix}.image_url`}
        label="Diagram Image URL"
        placeholder="https://..."
      />

      <CommonMetadata prefix={prefix} />

      <Divider />

      <BlankAnswersEditor prefix={prefix} />

      <Divider />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// Main Fill-in-the-Blank Fields Component
// ----------------------------------------------------------------------

export function FillBlankFields({ prefix, questionType }: Props) {
  if (questionType === 'short_answer') {
    return <ShortAnswerFields prefix={prefix} />;
  }

  if (questionType === 'note_completion') {
    return <NoteCompletionFields prefix={prefix} />;
  }

  if (questionType === 'diagram_completion') {
    return <DiagramCompletionFields prefix={prefix} />;
  }

  return (
    <Stack spacing={2.5}>
      <RHFTextField
        name={`${prefix}.text`}
        label="Text / Instructions"
        multiline
        rows={4}
        helperText="Use ___N___ (e.g. ___1___) to mark blanks"
      />

      <CommonMetadata prefix={prefix} />

      <Divider />

      {/* Type-specific metadata editors */}
      {questionType === 'form_completion' && <FormLayoutEditor prefix={prefix} />}
      {questionType === 'table_completion' && <TableEditor prefix={prefix} />}
      {questionType === 'flow_chart_completion' && <FlowChartEditor prefix={prefix} />}
      {questionType === 'sentence_completion' && <SentenceEditor prefix={prefix} />}

      {(questionType === 'form_completion' ||
        questionType === 'table_completion' ||
        questionType === 'flow_chart_completion' ||
        questionType === 'sentence_completion') && <Divider />}

      <BlankAnswersEditor prefix={prefix} />

      <Divider />

    </Stack>
  );
}
