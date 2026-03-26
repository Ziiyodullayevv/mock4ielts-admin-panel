import type { Metadata } from 'next';

import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Mock Exams | ${CONFIG.appName}` };

export default function Page() {
  return (
    <Typography variant="h4" sx={{ textAlign: 'center', mt: 10 }}>
      Mock Exams - Coming Soon
    </Typography>
  );
}
