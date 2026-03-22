import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuestionCreateView } from 'src/sections/questions/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `New question | ${CONFIG.appName}` };

export default function Page() {
  return <QuestionCreateView />;
}
