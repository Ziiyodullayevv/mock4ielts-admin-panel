import type { NavSectionProps } from 'src/components/nav-section';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  user: icon('ic-user'),
  order: icon('ic-order'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: 'Users',
        path: paths.dashboard.users.root,
        icon: ICONS.user,
      },
      {
        title: 'Sections',
        path: paths.dashboard.sections.root,
        icon: ICONS.order,
      },
      {
        title: 'Mock Exams',
        path: paths.dashboard.mockExams.root,
        icon: ICONS.order,
      },
      {
        title: 'Contests',
        path: paths.dashboard.contests.root,
        icon: ICONS.order,
      },
    ],
  },
  {
    subheader: 'Account',
    items: [
      {
        title: 'Profile',
        path: paths.dashboard.profile,
        icon: ICONS.user,
      },
    ],
  },
];
