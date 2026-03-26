'use client';

import type { ISection } from 'src/types/section';
import { SECTION_COLORS, SECTION_TYPES } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { usePopover, useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  row: ISection;
  onDeleteRow: () => void;
};

export function SectionTableRow({ row, onDeleteRow }: Props) {
  const router = useRouter();
  const popover = usePopover();
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover>
        <TableCell sx={{ maxWidth: 260 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            {row.title}
          </Box>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={SECTION_COLORS[row.section_type]}>
            {SECTION_TYPES[row.section_type]}
          </Label>
        </TableCell>

        <TableCell sx={{ textTransform: 'capitalize' }}>
          {row.exam_type?.replace('_', ' ') || '\u2014'}
        </TableCell>

        <TableCell align="center">{row.parts?.length ?? 0}</TableCell>

        <TableCell align="center">{row.total_questions ?? 0}</TableCell>

        <TableCell>
          <Label variant="soft" color={row.is_published ? 'success' : 'default'}>
            {row.is_published ? 'Published' : 'Draft'}
          </Label>
        </TableCell>

        <TableCell sx={{ textTransform: 'capitalize' }}>{row.difficulty || '\u2014'}</TableCell>

        <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} anchorEl={popover.anchorEl} onClose={popover.onClose}>
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              router.push(paths.dashboard.sections.details(row.id));
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
              router.push(paths.dashboard.sections.edit(row.id));
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              popover.onClose();
              confirm.onTrue();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <Dialog open={confirm.value} onClose={confirm.onFalse}>
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this section?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm.onFalse} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
