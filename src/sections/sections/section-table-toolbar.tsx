'use client';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  search: string;
  filterDifficulty: string;
  onSearch: (value: string) => void;
  onFilterDifficulty: (value: string) => void;
};

export function SectionTableToolbar({
  search,
  filterDifficulty,
  onSearch,
  onFilterDifficulty,
}: Props) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '20px' }}>
      <TextField
        select
        value={filterDifficulty}
        onChange={(e) => onFilterDifficulty(e.target.value)}
        label="Difficulty"
        sx={{ width: { xs: 1, md: 200 }, flexShrink: 0 }}
      >
        <MenuItem value="">All difficulties</MenuItem>
        <MenuItem value="easy">Easy</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="hard">Hard</MenuItem>
      </TextField>

      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search sections..."
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
