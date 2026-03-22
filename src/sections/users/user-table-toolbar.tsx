'use client';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  search: string;
  onSearch: (value: string) => void;
};

export function UserTableToolbar({ search, onSearch }: Props) {
  return (
    <TextField
      value={search}
      onChange={(e) => onSearch(e.target.value)}
      placeholder="Search by email..."
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ p: 2.5, width: { xs: 1, md: 320 } }}
    />
  );
}
