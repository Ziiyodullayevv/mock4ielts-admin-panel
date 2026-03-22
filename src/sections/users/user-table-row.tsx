'use client';

import type { IUser } from 'src/types/user';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: IUser;
  editHref: string;
};

const AUTH_PROVIDER_COLOR = {
  google: 'warning',
  apple: 'default',
  email: 'info',
} as const;

export function UserTableRow({ row, editHref }: Props) {
  const avatarLetter = row.full_name?.charAt(0).toUpperCase() || row.email.charAt(0).toUpperCase();

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40 }}>{avatarLetter}</Avatar>

          <ListItemText
            primary={row.full_name || '—'}
            secondary={row.email}
            slotProps={{
              primary: { typography: 'body2', fontWeight: 'fontWeightMedium' },
              secondary: { typography: 'caption', color: 'text.secondary' },
            }}
          />
        </Box>
      </TableCell>

      <TableCell>{row.country || '—'}</TableCell>

      <TableCell>
        <Label variant="soft" color={AUTH_PROVIDER_COLOR[row.auth_provider]}>
          {row.auth_provider}
        </Label>
      </TableCell>

      <TableCell align="center">{row.token_balance}</TableCell>

      <TableCell align="center">{row.target_band ?? '—'}</TableCell>

      <TableCell>
        <Label variant="soft" color={row.is_admin ? 'success' : 'default'}>
          {row.is_admin ? 'Admin' : 'User'}
        </Label>
      </TableCell>

      <TableCell align="right">
        <IconButton component={RouterLink} href={editHref}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
