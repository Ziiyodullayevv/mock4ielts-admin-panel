'use client';

import type { ISection } from 'src/types/section';
import { SECTION_COLORS, SECTION_TYPES, QUESTION_TYPES } from 'src/types/section';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { paths } from 'src/routes/paths';
import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = { id: string };

export function SectionDetailView({ id }: Props) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['section', id],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.sections.details(id));
      return res.data?.data as ISection;
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={data?.title || 'Section Details'}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Sections', href: paths.dashboard.sections.root },
          { name: data?.title || 'Details' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => router.push(paths.dashboard.sections.edit(id))}
          >
            Edit
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography color="error">{(error as Error).message}</Typography>}

      {data && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">Info</Typography>
                  <Label variant="soft" color={SECTION_COLORS[data.section_type]}>
                    {SECTION_TYPES[data.section_type]}
                  </Label>
                </Stack>
                <Divider />
                <InfoRow label="Exam Type" value={data.exam_type?.replace('_', ' ') || '\u2014'} />
                <InfoRow
                  label="Duration"
                  value={data.duration_minutes ? `${data.duration_minutes} min` : '\u2014'}
                />
                <InfoRow label="Difficulty" value={data.difficulty || '\u2014'} />
                <InfoRow label="Status" value={data.is_published ? 'Published' : 'Draft'} />
                <InfoRow label="Total Questions" value={String(data.total_questions ?? 0)} />
                {data.audio_url && <InfoRow label="Audio" value={data.audio_url} />}
                {data.tags && data.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {data.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              {data.parts?.map((part, pi) => (
                <Accordion key={part.id || pi} defaultExpanded={pi === 0}>
                  <AccordionSummary
                    expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: 1 }}>
                      <Typography variant="subtitle1">
                        {part.title || `Part ${pi + 1}`}
                      </Typography>
                      <Chip
                        label={`${part.questions?.length ?? 0} questions`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {part.instructions && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {part.instructions}
                      </Typography>
                    )}
                    {part.passage_text && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          p: 2,
                          bgcolor: 'background.neutral',
                          borderRadius: 1,
                          maxHeight: 200,
                          overflow: 'auto',
                        }}
                      >
                        {part.passage_text}
                      </Typography>
                    )}
                    {part.questions?.map((q, qi) => (
                      <Box
                        key={q.id || qi}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            Q{q.order || qi + 1}
                          </Typography>
                          <Label variant="outlined" color="default" sx={{ fontSize: 11 }}>
                            {QUESTION_TYPES[q.question_type] || q.question_type}
                          </Label>
                          <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                            {q.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {q.points} pt
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                    {(!part.questions || part.questions.length === 0) && (
                      <Typography variant="body2" color="text.disabled">
                        No questions
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
        {value}
      </Typography>
    </Box>
  );
}
