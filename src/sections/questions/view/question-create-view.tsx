import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { QuestionCreateForm } from '../question-create-form';

// ----------------------------------------------------------------------

export function QuestionCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create question"
        backHref={paths.dashboard.questions.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Questions', href: paths.dashboard.questions.root },
          { name: 'New question' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <QuestionCreateForm />
    </DashboardContent>
  );
}
