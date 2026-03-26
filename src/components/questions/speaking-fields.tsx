'use client';

import type { QuestionType } from 'src/types/section';

import { useFieldArray, useFormContext } from 'react-hook-form';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

type Props = { prefix: string; questionType: QuestionType };

function FollowUpsList({ prefix }: { prefix: string }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.follow_ups`,
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Follow-up Questions</Typography>
      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${prefix}.metadata.follow_ups.${index}.text`}
            label={`Follow-up ${index + 1}`}
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
        onClick={() => append({ text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Follow-up
      </Button>
    </Stack>
  );
}

function BulletPointsList({ prefix }: { prefix: string }) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${prefix}.metadata.bullet_points`,
  });

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Bullet Points (You should say...)</Typography>
      {fields.map((field, index) => (
        <Stack key={field.id} direction="row" spacing={1.5} alignItems="center">
          <RHFTextField
            name={`${prefix}.metadata.bullet_points.${index}.text`}
            label={`Point ${index + 1}`}
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
        onClick={() => append({ text: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Point
      </Button>
    </Stack>
  );
}

export function SpeakingFields({ prefix, questionType }: Props) {
  if (questionType === 'speaking_short') {
    return (
      <Stack spacing={2.5}>
        <RHFTextField name={`${prefix}.text`} label="Main Question" multiline rows={2} />
        <Stack direction="row" spacing={2}>
          <RHFTextField name={`${prefix}.metadata.topic`} label="Topic" />
          <RHFTextField
            name={`${prefix}.metadata.suggested_time_seconds`}
            label="Time (seconds)"
            type="number"
            sx={{ maxWidth: 160 }}
          />
        </Stack>
        <Divider />
        <FollowUpsList prefix={prefix} />
      </Stack>
    );
  }

  if (questionType === 'speaking_cue_card') {
    return (
      <Stack spacing={2.5}>
        <RHFTextField name={`${prefix}.text`} label="Cue Card Topic" multiline rows={3} />
        <Stack direction="row" spacing={2}>
          <RHFTextField
            name={`${prefix}.metadata.preparation_seconds`}
            label="Prep Time (sec)"
            type="number"
            sx={{ maxWidth: 160 }}
          />
          <RHFTextField
            name={`${prefix}.metadata.speaking_min_seconds`}
            label="Min Speaking (sec)"
            type="number"
            sx={{ maxWidth: 160 }}
          />
          <RHFTextField
            name={`${prefix}.metadata.speaking_max_seconds`}
            label="Max Speaking (sec)"
            type="number"
            sx={{ maxWidth: 160 }}
          />
        </Stack>
        <Divider />
        <BulletPointsList prefix={prefix} />
        <Divider />
        <RHFTextField
          name={`${prefix}.metadata.rounding_off_question`}
          label="Rounding-off Question"
        />
      </Stack>
    );
  }

  // speaking_discussion
  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Discussion Question" multiline rows={3} />
      <Stack direction="row" spacing={2}>
        <RHFTextField name={`${prefix}.metadata.topic`} label="Topic" />
        <RHFTextField
          name={`${prefix}.metadata.suggested_time_seconds`}
          label="Time (seconds)"
          type="number"
          sx={{ maxWidth: 160 }}
        />
        <RHFSelect name={`${prefix}.metadata.depth`} label="Depth" sx={{ maxWidth: 180 }}>
          <MenuItem value="">Select</MenuItem>
          <MenuItem value="analytical">Analytical</MenuItem>
          <MenuItem value="evaluative">Evaluative</MenuItem>
          <MenuItem value="speculative">Speculative</MenuItem>
        </RHFSelect>
      </Stack>
      <Divider />
      <FollowUpsList prefix={prefix} />
    </Stack>
  );
}
