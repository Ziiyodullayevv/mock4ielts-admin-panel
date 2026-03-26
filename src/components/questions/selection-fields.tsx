'use client';

import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

// ----------------------------------------------------------------------

type Props = {
  prefix: string;
};

// ----------------------------------------------------------------------
// Single Choice
// ----------------------------------------------------------------------

export function SingleChoiceFields({ prefix }: Props) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.options`,
  });

  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Divider />

      <Typography variant="subtitle2">Options</Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${prefix}.options.${index}.label`}
            label="Label"
            sx={{ maxWidth: 100 }}
          />
          <RHFTextField name={`${prefix}.options.${index}.text`} label="Option Text" />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: String.fromCharCode(65 + fields.length), text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Option
      </Button>

      <Divider />

      <RHFSelect name={`${prefix}.correct_answer`} label="Correct Answer">
        <MenuItem value="">
          <em>Select correct answer</em>
        </MenuItem>
        {options.map((opt: { label: string; text: string }, index: number) => (
          <MenuItem key={index} value={opt?.label || ''}>
            {opt?.label || ''} — {opt?.text || ''}
          </MenuItem>
        ))}
      </RHFSelect>

      <RHFTextField name={`${prefix}.explanation`} label="Explanation" multiline rows={2} />
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Multiple Choice
// ----------------------------------------------------------------------

export function MultipleChoiceFields({ prefix }: Props) {
  const { control, setValue } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.options`,
  });

  const options = useWatch({ control, name: `${prefix}.options` }) || [];
  const correctAnswer: string[] = useWatch({ control, name: `${prefix}.correct_answer` }) || [];

  const handleToggleAnswer = (label: string) => {
    const current = Array.isArray(correctAnswer) ? correctAnswer : [];
    const next = current.includes(label)
      ? current.filter((l: string) => l !== label)
      : [...current, label];
    setValue(`${prefix}.correct_answer`, next, { shouldDirty: true });
  };

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <Stack direction="row" spacing={2}>
        <RHFTextField
          name={`${prefix}.metadata.select_count`}
          label="Number of correct answers"
          type="number"
          sx={{ maxWidth: 220 }}
        />
        <RHFTextField
          name={`${prefix}.metadata.instruction`}
          label="Instruction"
          placeholder="e.g. Choose TWO letters, A–E"
        />
      </Stack>

      <Divider />

      <Typography variant="subtitle2">Options</Typography>

      {fields.map((field, index) => {
        const label = options[index]?.label || '';
        const isSelected = Array.isArray(correctAnswer) && correctAnswer.includes(label);

        return (
          <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
            <Button
              variant={isSelected ? 'contained' : 'outlined'}
              color={isSelected ? 'primary' : 'inherit'}
              size="small"
              onClick={() => handleToggleAnswer(label)}
              sx={{ minWidth: 36, px: 1 }}
            >
              {label || '?'}
            </Button>
            <RHFTextField
              name={`${prefix}.options.${index}.label`}
              label="Label"
              sx={{ maxWidth: 100 }}
            />
            <RHFTextField name={`${prefix}.options.${index}.text`} label="Option Text" />
            <IconButton color="error" onClick={() => remove(index)} size="small">
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Stack>
        );
      })}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: String.fromCharCode(65 + fields.length), text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Option
      </Button>

      <Divider />

      <Typography variant="caption" color="text.secondary">
        Selected correct answers: {Array.isArray(correctAnswer) ? correctAnswer.join(', ') : '—'}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// True / False / Not Given
// ----------------------------------------------------------------------

export function TrueFalseNotGivenFields({ prefix }: Props) {
  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <RHFSelect name={`${prefix}.correct_answer`} label="Correct Answer">
        <MenuItem value="">
          <em>Select correct answer</em>
        </MenuItem>
        <MenuItem value="TRUE">TRUE</MenuItem>
        <MenuItem value="FALSE">FALSE</MenuItem>
        <MenuItem value="NOT GIVEN">NOT GIVEN</MenuItem>
      </RHFSelect>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Yes / No / Not Given
// ----------------------------------------------------------------------

export function YesNoNotGivenFields({ prefix }: Props) {
  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Question Text" multiline rows={3} />

      <RHFSelect name={`${prefix}.correct_answer`} label="Correct Answer">
        <MenuItem value="">
          <em>Select correct answer</em>
        </MenuItem>
        <MenuItem value="YES">YES</MenuItem>
        <MenuItem value="NO">NO</MenuItem>
        <MenuItem value="NOT GIVEN">NOT GIVEN</MenuItem>
      </RHFSelect>
    </Stack>
  );
}
