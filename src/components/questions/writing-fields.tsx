'use client';

import type { QuestionType } from 'src/types/section';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

type Props = { prefix: string; questionType: QuestionType };

export function WritingFields({ prefix, questionType }: Props) {
  return (
    <Stack spacing={2.5}>
      <RHFTextField name={`${prefix}.text`} label="Task / Prompt" multiline rows={5} />

      <Stack direction="row" spacing={2}>
        <RHFTextField
          name={`${prefix}.metadata.word_limit_min`}
          label="Min Words"
          type="number"
          sx={{ maxWidth: 160 }}
        />
        <RHFTextField
          name={`${prefix}.metadata.word_limit_recommended`}
          label="Recommended Words"
          type="number"
          sx={{ maxWidth: 160 }}
        />
        <RHFTextField
          name={`${prefix}.metadata.time_recommended_minutes`}
          label="Time (min)"
          type="number"
          sx={{ maxWidth: 160 }}
        />
      </Stack>

      {questionType === 'essay' && (
        <RHFSelect name={`${prefix}.metadata.essay_type`} label="Essay Type">
          <MenuItem value="">Select type</MenuItem>
          <MenuItem value="agree_disagree">Agree / Disagree</MenuItem>
          <MenuItem value="discuss_both_views">Discuss Both Views</MenuItem>
          <MenuItem value="advantages_disadvantages">Advantages / Disadvantages</MenuItem>
          <MenuItem value="problem_solution">Problem / Solution</MenuItem>
          <MenuItem value="two_part_question">Two-Part Question</MenuItem>
          <MenuItem value="causes_effects">Causes / Effects</MenuItem>
        </RHFSelect>
      )}

      {questionType === 'letter_writing' && (
        <RHFSelect name={`${prefix}.metadata.letter_type`} label="Letter Type">
          <MenuItem value="">Select type</MenuItem>
          <MenuItem value="formal">Formal</MenuItem>
          <MenuItem value="semi_formal">Semi-Formal</MenuItem>
          <MenuItem value="informal">Informal</MenuItem>
        </RHFSelect>
      )}

      {questionType === 'graph_description' && (
        <>
          <RHFSelect name={`${prefix}.metadata.graph_type`} label="Graph Type">
            <MenuItem value="">Select type</MenuItem>
            <MenuItem value="bar_chart">Bar Chart</MenuItem>
            <MenuItem value="line_graph">Line Graph</MenuItem>
            <MenuItem value="pie_chart">Pie Chart</MenuItem>
            <MenuItem value="table">Table</MenuItem>
            <MenuItem value="process_diagram">Process Diagram</MenuItem>
            <MenuItem value="map_comparison">Map Comparison</MenuItem>
            <MenuItem value="combined">Combined</MenuItem>
          </RHFSelect>
          <RHFTextField
            name={`${prefix}.image_url`}
            label="Graph / Chart Image URL"
            placeholder="https://..."
          />
        </>
      )}
    </Stack>
  );
}
