'use client';

import type { QuestionType } from 'src/types/section';

import { useWatch, useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

// ----------------------------------------------------------------------

type Props = {
  prefix: string;
  questionType: QuestionType;
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function alphaLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, 'x'],
    [9, 'ix'],
    [5, 'v'],
    [4, 'iv'],
    [1, 'i'],
  ];
  let result = '';
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

// ----------------------------------------------------------------------
// Options list — writes to ${prefix}.options [{label, text}]
// ----------------------------------------------------------------------

function OptionsListEditor({
  prefix,
  label,
  addLabel,
  labelGenerator,
}: {
  prefix: string;
  label: string;
  addLabel: string;
  labelGenerator: (index: number) => string;
}) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `${prefix}.options` });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{label}</Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${prefix}.options.${index}.label`}
            label="Label"
            size="small"
            sx={{ maxWidth: 100 }}
          />
          <RHFTextField name={`${prefix}.options.${index}.text`} label="Text" size="small" />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ label: labelGenerator(fields.length), text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Items list — writes to ${prefix}.metadata.<fieldName> [{order, text}]
// ----------------------------------------------------------------------

function ItemsListEditor({
  prefix,
  fieldName,
  label,
  addLabel,
  itemLabel,
  startOrder,
}: {
  prefix: string;
  fieldName: string;
  label: string;
  addLabel: string;
  itemLabel?: string;
  startOrder?: number;
}) {
  const { control } = useFormContext();
  const fullName = `${prefix}.metadata.${fieldName}`;
  const { fields, append, remove } = useFieldArray({ control, name: fullName });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">{label}</Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${fullName}.${index}.order`}
            label="#"
            type="number"
            size="small"
            sx={{ maxWidth: 70 }}
          />
          <RHFTextField
            name={`${fullName}.${index}.text`}
            label={itemLabel || `Item`}
            size="small"
          />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ order: (startOrder || 0) + fields.length + 1, text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        {addLabel}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Answer Mapping Editor
// correct_answer: { "23": "C", "24": "A" }
// ----------------------------------------------------------------------

function AnswerMappingEditor({
  prefix,
  items,
  options,
  itemLabel,
  optionLabel,
  itemKeyField,
}: {
  prefix: string;
  items: { order?: number; id?: string; text?: string }[];
  options: { label?: string; text?: string }[];
  itemLabel: string;
  optionLabel: string;
  itemKeyField?: 'order' | 'id';
}) {
  const { control, setValue } = useFormContext();
  const correctAnswer: Record<string, string> =
    useWatch({ control, name: `${prefix}.correct_answer` }) || {};

  const keyField = itemKeyField || 'order';

  const handleChange = (key: string, value: string) => {
    setValue(`${prefix}.correct_answer`, { ...correctAnswer, [key]: value }, { shouldDirty: true });
  };

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Answer Mapping</Typography>
      <Typography variant="caption" color="text.secondary">
        Map each {itemLabel.toLowerCase()} to the correct {optionLabel.toLowerCase()}
      </Typography>

      {items.map((item, index) => {
        const key = String(item[keyField] || index + 1);
        return (
          <Stack key={index} direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 200, fontWeight: 500 }}>
              {key}. {item.text || `${itemLabel} ${key}`}
            </Typography>
            <TextField
              select
              size="small"
              label={optionLabel}
              value={correctAnswer[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">
                <em>—</em>
              </MenuItem>
              {options.map((opt, oi) => (
                <MenuItem key={oi} value={opt.label || String(oi + 1)}>
                  {opt.label || String(oi + 1)} — {opt.text || ''}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );
      })}
    </Stack>
  );
}

// ----------------------------------------------------------------------
// Labels on Image Editor — for map_labeling
// metadata.labels_on_image: [{id, x, y}]
// ----------------------------------------------------------------------

function LabelsOnImageEditor({ prefix }: { prefix: string }) {
  const { control } = useFormContext();
  const fullName = `${prefix}.metadata.labels_on_image`;
  const { fields, append, remove } = useFieldArray({ control, name: fullName });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Labels on Image</Typography>
      <Typography variant="caption" color="text.secondary">
        Define label positions (ID and coordinates on the image)
      </Typography>

      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${fullName}.${index}.id`}
            label="ID"
            size="small"
            sx={{ maxWidth: 80 }}
          />
          <RHFTextField
            name={`${fullName}.${index}.x`}
            label="X"
            type="number"
            size="small"
            sx={{ maxWidth: 80 }}
          />
          <RHFTextField
            name={`${fullName}.${index}.y`}
            label="Y"
            type="number"
            size="small"
            sx={{ maxWidth: 80 }}
          />
          <IconButton color="error" onClick={() => remove(index)} size="small">
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={() => append({ id: String(fields.length + 1), x: 0, y: 0 })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Label
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING
// options: [{label, text}]
// metadata: { instruction, items: [{order, text}], reuse_options }
// correct_answer: { "23": "C" }
// ----------------------------------------------------------------------

function MatchingGenericFields({ prefix }: { prefix: string }) {
  const { control, setValue } = useFormContext();

  const items = useWatch({ control, name: `${prefix}.metadata.items` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];
  const reuseOptions = useWatch({ control, name: `${prefix}.metadata.reuse_options` });

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

      <RHFTextField
        name={`${prefix}.metadata.instruction`}
        label="Instruction"
        placeholder="e.g. Choose the correct letter A, B or C"
        size="small"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={!!reuseOptions}
            onChange={(e) =>
              setValue(`${prefix}.metadata.reuse_options`, e.target.checked, {
                shouldDirty: true,
              })
            }
          />
        }
        label="Allow reuse of options"
      />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="items"
        label="Items (Statements)"
        addLabel="Add Item"
        itemLabel="Item"
      />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Options"
        addLabel="Add Option"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={items}
        options={options}
        itemLabel="Item"
        optionLabel="Option"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING HEADINGS
// options: [{label, text}] (headings i, ii, iii)
// metadata: { instruction, paragraphs: [{order, text}] }
// correct_answer: { "1": "iv" }
// ----------------------------------------------------------------------

function MatchingHeadingsFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const paragraphs = useWatch({ control, name: `${prefix}.metadata.paragraphs` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="paragraphs"
        label="Paragraphs"
        addLabel="Add Paragraph"
        itemLabel="Paragraph"
      />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Headings"
        addLabel="Add Heading"
        labelGenerator={(i) => toRoman(i + 1)}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={paragraphs}
        options={options}
        itemLabel="Paragraph"
        optionLabel="Heading"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING INFORMATION
// options: [{label, text}] (paragraphs A, B, C)
// metadata: { instruction, items: [{order, text}] }
// correct_answer: { "1": "A" }
// ----------------------------------------------------------------------

function MatchingInformationFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const items = useWatch({ control, name: `${prefix}.metadata.items` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Paragraphs"
        addLabel="Add Paragraph"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="items"
        label="Items (Statements)"
        addLabel="Add Item"
        itemLabel="Item"
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={items}
        options={options}
        itemLabel="Item"
        optionLabel="Paragraph"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING FEATURES
// options: [{label, text}] (features A, B, C)
// metadata: { instruction, items: [{order, text}] }
// correct_answer: { "1": "A" }
// ----------------------------------------------------------------------

function MatchingFeaturesFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const items = useWatch({ control, name: `${prefix}.metadata.items` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Features / Categories"
        addLabel="Add Feature"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="items"
        label="Items (Statements)"
        addLabel="Add Item"
        itemLabel="Item"
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={items}
        options={options}
        itemLabel="Item"
        optionLabel="Feature"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MATCHING SENTENCE ENDINGS
// options: [{label, text}] (endings A, B, C)
// metadata: { instruction, sentence_starts: [{order, text}] }
// correct_answer: { "1": "A" }
// ----------------------------------------------------------------------

function MatchingSentenceEndingsFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const sentenceStarts = useWatch({ control, name: `${prefix}.metadata.sentence_starts` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />
      <RHFTextField name={`${prefix}.metadata.instruction`} label="Instruction" size="small" />

      <Divider />

      <ItemsListEditor
        prefix={prefix}
        fieldName="sentence_starts"
        label="Sentence Starts"
        addLabel="Add Sentence Start"
        itemLabel="Start"
      />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Sentence Endings"
        addLabel="Add Ending"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={sentenceStarts}
        options={options}
        itemLabel="Sentence"
        optionLabel="Ending"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// MAP LABELING
// options: [{label, text}] (answer choices A-H)
// image_url: string
// metadata: { instruction, input_mode, labels_on_image: [{id, x, y}] }
// correct_answer: { "36": "F" }
// ----------------------------------------------------------------------

function MapLabelingFields({ prefix }: { prefix: string }) {
  const { control } = useFormContext();

  const labels = useWatch({ control, name: `${prefix}.metadata.labels_on_image` }) || [];
  const options = useWatch({ control, name: `${prefix}.options` }) || [];

  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Instructions" multiline rows={2} />

      <RHFTextField
        name={`${prefix}.image_url`}
        label="Map / Plan Image URL"
        placeholder="https://..."
      />

      <Stack direction="row" spacing={2}>
        <RHFTextField
          name={`${prefix}.metadata.instruction`}
          label="Instruction"
          placeholder="e.g. Choose FIVE answers from the box A-H"
          size="small"
        />
        <RHFTextField
          name={`${prefix}.metadata.input_mode`}
          label="Input Mode"
          placeholder="e.g. select_from_list"
          size="small"
          sx={{ maxWidth: 200 }}
        />
      </Stack>

      <Divider />

      <LabelsOnImageEditor prefix={prefix} />

      <Divider />

      <OptionsListEditor
        prefix={prefix}
        label="Options / Answer Choices"
        addLabel="Add Option"
        labelGenerator={alphaLabel}
      />

      <Divider />

      <AnswerMappingEditor
        prefix={prefix}
        items={labels}
        options={options}
        itemLabel="Label"
        optionLabel="Option"
        itemKeyField="id"
      />

    </Stack>
  );
}

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------

export function MatchingFields({ prefix, questionType }: Props) {
  switch (questionType) {
    case 'matching':
      return <MatchingGenericFields prefix={prefix} />;
    case 'matching_headings':
      return <MatchingHeadingsFields prefix={prefix} />;
    case 'matching_information':
      return <MatchingInformationFields prefix={prefix} />;
    case 'matching_features':
      return <MatchingFeaturesFields prefix={prefix} />;
    case 'matching_sentence_endings':
      return <MatchingSentenceEndingsFields prefix={prefix} />;
    case 'map_labeling':
      return <MapLabelingFields prefix={prefix} />;
    default:
      return null;
  }
}
