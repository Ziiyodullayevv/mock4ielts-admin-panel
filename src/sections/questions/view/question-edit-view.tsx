'use client';

import type { IQuestion } from 'src/types/question';

import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { QuestionEditForm } from '../question-edit-form';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

export function QuestionEditView({ id }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.questions.details(id));
      return res.data?.data as IQuestion;
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit question"
        backHref={paths.dashboard.questions.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Questions', href: paths.dashboard.questions.root },
          { name: 'Edit question' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <QuestionEditForm currentQuestion={data} />
      ) : null}
    </DashboardContent>
  );
}
