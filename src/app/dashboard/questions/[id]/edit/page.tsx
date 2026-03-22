import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { QuestionEditView } from 'src/sections/questions/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Edit question | ${CONFIG.appName}` };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <QuestionEditView id={id} />;
}
