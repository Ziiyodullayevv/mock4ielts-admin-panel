'use client';

import type { ISection } from 'src/types/section';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { SectionTableRow } from '../section-table-row';
import { SectionTableToolbar } from '../section-table-toolbar';

// ----------------------------------------------------------------------

const SECTION_TABS = [
  { value: '', label: 'All' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'speaking', label: 'Speaking' },
];

const TABLE_HEAD = [
  { id: 'title', label: 'Title' },
  { id: 'section_type', label: 'Type' },
  { id: 'exam_type', label: 'Exam Type' },
  { id: 'parts', label: 'Parts', align: 'center' as const },
  { id: 'questions', label: 'Questions', align: 'center' as const },
  { id: 'status', label: 'Status' },
  { id: 'difficulty', label: 'Difficulty' },
  { id: 'created_at', label: 'Created' },
  { id: 'actions', label: '' },
];

// ----------------------------------------------------------------------

export function SectionListView() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sectionType, setSectionType] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'sections',
      {
        sectionType,
        page: page + 1,
        size: rowsPerPage,
        search: debouncedSearch,
        difficulty: filterDifficulty,
      },
    ],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.sections.list, {
        params: {
          ...(sectionType && { section_type: sectionType }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filterDifficulty && { difficulty: filterDifficulty }),
          page: page + 1,
          size: rowsPerPage,
        },
      });
      return res.data;
    },
  });

  const sections: ISection[] = data?.data ?? [];
  const total: number = data?.pagination?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(endpoints.sections.details(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sections'] }),
  });

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setSectionType(newValue);
    setPage(0);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handleFilterDifficulty = useCallback((value: string) => {
    setFilterDifficulty(value);
    setPage(0);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Sections"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Sections' }]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.sections.new)}
          >
            New Section
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Tabs
          value={sectionType}
          onChange={handleTabChange}
          sx={{
            px: 2.5,
            boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
          }}
        >
          {SECTION_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <SectionTableToolbar
          search={search}
          filterDifficulty={filterDifficulty}
          onSearch={handleSearch}
          onFilterDifficulty={handleFilterDifficulty}
        />

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((col) => (
                    <TableCell key={col.id} align={col.align}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} />
                    </TableCell>
                  </TableRow>
                ) : sections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No sections found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sections.map((row) => (
                    <SectionTableRow
                      key={row.id}
                      row={row}
                      onDeleteRow={() => deleteMutation.mutate(row.id)}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </DashboardContent>
  );
}
