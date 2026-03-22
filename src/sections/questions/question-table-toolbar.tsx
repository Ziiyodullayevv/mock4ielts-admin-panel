'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

import { QUESTION_TYPES } from 'src/types/question';

// ----------------------------------------------------------------------

type Props = {
  search: string;
  filterType: string;
  onSearch: (value: string) => void;
  onFilterType: (value: string) => void;
};

export function QuestionTableToolbar({ search, filterType, onSearch, onFilterType }: Props) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px' }}>
      <TextField
        select
        value={filterType}
        onChange={(e) => onFilterType(e.target.value)}
        label="Type"
        sx={{ width: { xs: 1, md: 200 }, flexShrink: 0 }}
      >
        <MenuItem value="">All types</MenuItem>
        {(Object.entries(QUESTION_TYPES) as [string, string][]).map(([value, label]) => (
          <MenuItem key={value} value={value}>{label}</MenuItem>
        ))}
      </TextField>

      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by name..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ flexGrow: 1 }}
      />
    </div>
  );
}
