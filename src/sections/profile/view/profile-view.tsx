'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const BAND_SCORES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const ProfileSchema = z.object({
  full_name: z.string().max(100, 'Max 100 characters').optional(),
  phone: z.string().max(20, 'Max 20 characters').optional(),
  country: z.string().max(100, 'Max 100 characters').optional(),
  target_band: z.union([z.coerce.number().min(0).max(9), z.literal('')]).optional(),
});

type ProfileSchemaType = z.infer<typeof ProfileSchema>;

// ----------------------------------------------------------------------

export function ProfileView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axiosInstance.get(endpoints.profile.me);
      return res.data?.data;
    },
  });

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ py: 3 }}>
          {error.message || 'Failed to load profile'}
        </Typography>
      )}

      {data && <ProfileForm profile={data} />}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ProfileFormProps = {
  profile: Record<string, any>;
};

function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient();

  const avatarLetter =
    profile?.full_name?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    'U';

  const methods = useForm<ProfileSchemaType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      country: profile?.country ?? '',
      target_band: profile?.target_band ?? '',
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProfileSchemaType) =>
      axiosInstance.patch(endpoints.profile.me, {
        ...data,
        phone: data.phone || null,
        country: data.country || null,
        target_band: data.target_band === '' ? null : data.target_band ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const onSubmit = handleSubmit((data) => mutate(data));

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Avatar card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ width: 100, height: 100, fontSize: 40, mb: 3 }}>
              {avatarLetter}
            </Avatar>

            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              {profile?.full_name || '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {profile?.email}
            </Typography>

            <Divider sx={{ width: 1, mb: 3 }} />

            <Stack spacing={1} sx={{ width: 1, typography: 'body2' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box component="span" color="text.secondary">
                  Provider
                </Box>
                <Box component="span">{profile?.auth_provider}</Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box component="span" color="text.secondary">
                  Tokens
                </Box>
                <Box component="span">{profile?.token_balance ?? 0}</Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box component="span" color="text.secondary">
                  Role
                </Box>
                <Box component="span">{profile?.is_admin ? 'Admin' : 'User'}</Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box component="span" color="text.secondary">
                  Joined
                </Box>
                <Box component="span">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : '—'}
                </Box>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Form card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <RHFTextField name="full_name" label="Full name" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="phone" label="Phone" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="country" label="Country" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFSelect name="target_band" label="Target band">
                  {BAND_SCORES.map((score) => (
                    <MenuItem key={score} value={score}>
                      {score.toFixed(1)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isPending}
                disabled={!isDirty}
              >
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
