import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuestionListView } from 'src/sections/questions/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Questions | ${CONFIG.appName}` };

export default function Page() {
  return <QuestionListView />;
}
