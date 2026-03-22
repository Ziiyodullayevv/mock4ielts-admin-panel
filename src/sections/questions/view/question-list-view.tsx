'use client';

import type { IQuestion } from 'src/types/question';

import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SECTION_COLORS } from 'src/types/question';

import { QuestionTableRow } from '../question-table-row';
import { QuestionTableToolbar } from '../question-table-toolbar';

// ----------------------------------------------------------------------

const SECTION_TABS = [
  { value: 'all', label: 'All' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'speaking', label: 'Speaking' },
];

const TABLE_HEAD = [
  { id: 'checkbox', label: '', width: 56 },
  { id: 'name', label: 'Name' },
  { id: 'section', label: 'Section' },
  { id: 'type', label: 'Type' },
  { id: 'part_number', label: 'Part', align: 'center' as const },
  { id: 'token_cost', label: 'Cost', align: 'center' as const },
  { id: 'actions', label: '' },
];

// ----------------------------------------------------------------------

export function QuestionListView() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [section, setSection] = useState('all');
  const [filterType, setFilterType] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset selection when page/filters change
  useEffect(() => {
    setSelected([]);
  }, [page, section, filterType, debouncedSearch]);

  const handleSectionChange = useCallback((_: React.SyntheticEvent, value: string) => {
    setSection(value);
    setFilterType('');
    setPage(0);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handleFilterType = useCallback((value: string) => {
    setFilterType(value);
    setPage(0);
  }, []);

  const handleSelectRow = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(
    (questions: IQuestion[]) => {
      const allIds = questions.map((q) => q.id);
      const allSelected = allIds.every((id) => selected.includes(id));
      setSelected(allSelected ? selected.filter((id) => !allIds.includes(id)) : [...new Set([...selected, ...allIds])]);
    },
    [selected]
  );

  const queryParams = {
    page: page + 1,
    size: rowsPerPage,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(section !== 'all' && { section }),
    ...(filterType && { type: filterType }),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['questions', queryParams],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.questions.list, { params: queryParams });
      return res.data;
    },
  });

  const tabCountResults = useQueries({
    queries: SECTION_TABS.map((tab) => ({
      queryKey: ['questions-count', tab.value],
      queryFn: async () => {
        const params: Record<string, unknown> = { page: 1, size: 1 };
        if (tab.value !== 'all') params.section = tab.value;
        const res = await axiosInstance.get(endpoints.questions.list, { params });
        return (res.data?.pagination?.total ?? 0) as number;
      },
      staleTime: 1000 * 60 * 2,
    })),
  });

  const tabCountMap = SECTION_TABS.reduce<Record<string, number | undefined>>(
    (acc, tab, idx) => {
      acc[tab.value] = tabCountResults[idx].data;
      return acc;
    },
    {}
  );

  const { mutateAsync: deleteQuestion, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.questions.details(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions-count'] });
    },
  });

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteIds) return;
    await Promise.all(deleteIds.map((id) => deleteQuestion(id)));
    setSelected((prev) => prev.filter((id) => !deleteIds.includes(id)));
    setDeleteIds(null);
  }, [deleteIds, deleteQuestion]);

  const questions: IQuestion[] = data?.data ?? [];
  const total: number = data?.pagination?.total ?? 0;

  const allPageSelected =
    questions.length > 0 && questions.every((q) => selected.includes(q.id));
  const somePageSelected =
    questions.some((q) => selected.includes(q.id)) && !allPageSelected;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Questions"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Questions' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.questions.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New question
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={section}
          onChange={handleSectionChange}
          sx={[
            (theme) => ({
              px: { md: 2.5 },
              boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
            }),
          ]}
        >
          {SECTION_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={
                <Label
                  variant={tab.value === section ? 'filled' : 'soft'}
                  color={
                    tab.value === 'all'
                      ? 'default'
                      : SECTION_COLORS[tab.value as keyof typeof SECTION_COLORS]
                  }
                >
                  {tab.value === section ? total : (tabCountMap[tab.value] ?? '')}
                </Label>
              }
            />
          ))}
        </Tabs>

        <QuestionTableToolbar
          search={search}
          filterType={filterType}
          onSearch={handleSearch}
          onFilterType={handleFilterType}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                {selected.length > 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={TABLE_HEAD.length}
                      sx={(theme) => ({
                        p: 0,
                        height: 57,
                        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.3),
                      })}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ pl: 1, pr: 1, height: 1 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox checked onClick={() => setSelected([])} />
                          <Typography variant="body2" color="primary.darker" fontWeight={600}>
                            {selected.length} selected
                          </Typography>
                        </Stack>
                        <IconButton color="error" onClick={() => setDeleteIds([...selected])}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow
                    sx={(theme) => ({
                      bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.3),
                    })}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={somePageSelected}
                        checked={allPageSelected}
                        onChange={() => handleSelectAll(questions)}
                      />
                    </TableCell>
                    {TABLE_HEAD.slice(1).map((col) => (
                      <TableCell key={col.id} align={col.align}>
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                )}
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No questions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((row) => (
                    <QuestionTableRow
                      key={row.id}
                      row={row}
                      editHref={paths.dashboard.questions.edit(row.id)}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => handleSelectRow(row.id)}
                      onDeleteRow={() => setDeleteIds([row.id])}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePagination
          component="div"
          page={page}
          count={total}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteIds} onClose={() => setDeleteIds(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete question{deleteIds && deleteIds.length > 1 ? 's' : ''}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {deleteIds && deleteIds.length > 1
              ? `Are you sure you want to delete ${deleteIds.length} questions? This action cannot be undone.`
              : 'Are you sure you want to delete this question? This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={() => setDeleteIds(null)} sx={{ borderRadius: '50px' }}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="error"
            loading={isDeleting}
            onClick={handleConfirmDelete}
            sx={{ borderRadius: '50px' }}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
