import type { Metadata } from 'next';

import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `New Mock Exam | ${CONFIG.appName}` };

export default function Page() {
  return (
    <Typography variant="h4" sx={{ textAlign: 'center', mt: 10 }}>
      New Mock Exam - Coming Soon
    </Typography>
  );
}
