'use client';

import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

type Props = { prefix: string };

export function SummaryListFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();

  const {
    fields: wordFields,
    append: appendWord,
    remove: removeWord,
  } = useFieldArray({
    control,
    name: `${prefix}.options`,
  });

  const correctAnswer: Record<string, string> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};
  const options: { text: string }[] = useWatch({ control, name: `${prefix}.options` }) || [];

  const handleAnswerChange = (key: string, value: string) => {
    setValue(`${prefix}.correct_answer`, { ...correctAnswer, [key]: value }, { shouldDirty: true });
  };

  const handleAddBlank = () => {
    const nextKey = String(Object.keys(correctAnswer).length + 1);
    setValue(
      `${prefix}.correct_answer`,
      { ...correctAnswer, [nextKey]: '' },
      { shouldDirty: true }
    );
  };

  const handleRemoveBlank = (key: string) => {
    const next = { ...correctAnswer };
    delete next[key];
    setValue(`${prefix}.correct_answer`, next, { shouldDirty: true });
  };

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

      <RHFTextField
        name={`${prefix}.metadata.summary_text`}
        label="Summary Text (use ___1___, ___2___ for blanks)"
        multiline
        rows={4}
      />

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
          placeholder="e.g. Choose NO MORE THAN ONE WORD"
        />
      </Stack>

      <Divider />

      <Typography variant="subtitle2">Word Box</Typography>
      {wordFields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${prefix}.options.${index}.text`}
            label={`Word ${index + 1}`}
            size="small"
          />
          <IconButton color="error" onClick={() => removeWord(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}
      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => appendWord({ text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Word
      </Button>

      <Divider />

      <Typography variant="subtitle2">Blank Answers</Typography>
      <Typography variant="caption" color="text.secondary">
        Map each blank to a word from the box
      </Typography>
      {Object.keys(correctAnswer)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => (
          <Stack key={key} direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 600 }}>
              Blank {key}
            </Typography>
            <TextField
              select
              size="small"
              fullWidth
              label="Correct Word"
              value={correctAnswer[key] || ''}
              onChange={(e) => handleAnswerChange(key, e.target.value)}
            >
              <MenuItem value="">
                <em>&mdash;</em>
              </MenuItem>
              {options.map((opt, oi) => (
                <MenuItem key={oi} value={opt?.text || ''}>
                  {opt?.text || ''}
                </MenuItem>
              ))}
            </TextField>
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

      <Divider />
    </Stack>
  );
}
