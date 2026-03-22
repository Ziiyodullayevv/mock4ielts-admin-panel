'use client';

import type { IQuestion } from 'src/types/question';

import { useState, useCallback } from 'react';

import List from '@mui/material/List';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

import { QUESTION_TYPES, SECTION_COLORS } from 'src/types/question';

// ----------------------------------------------------------------------

type Props = {
  row: IQuestion;
  editHref: string;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
};

export function QuestionTableRow({ row, editHref, selected, onSelectRow, onDeleteRow }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleOpenMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const handleDelete = useCallback(() => {
    handleCloseMenu();
    onDeleteRow();
  }, [handleCloseMenu, onDeleteRow]);

  return (
    <>
      <TableRow hover selected={selected} sx={{ '& td': { borderBottom: '1px dashed', borderColor: 'divider' } }}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell sx={{ maxWidth: 300 }}>
          {row.name ?? <span style={{ color: 'var(--palette-text-disabled)' }}>—</span>}
        </TableCell>

        <TableCell>
          <Label variant="soft" color={SECTION_COLORS[row.section]}>
            {row.section}
          </Label>
        </TableCell>

        <TableCell>
          {row.type ? (
            <Label variant="soft" color="default">
              {QUESTION_TYPES[row.type]}
            </Label>
          ) : '—'}
        </TableCell>

        <TableCell align="center">{row.part_number ?? '—'}</TableCell>

        <TableCell align="center">{row.token_cost}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={!!menuAnchor}
        anchorEl={menuAnchor}
        onClose={handleCloseMenu}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <List dense disablePadding sx={{ py: 0.5 }}>
          <MenuItem component={RouterLink} href={editHref} onClick={handleCloseMenu}>
            <ListItemIcon><Iconify icon="solar:pen-bold" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon><Iconify icon="solar:trash-bin-trash-bold" sx={{ color: 'error.main' }} /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </List>
      </CustomPopover>
    </>
  );
}
