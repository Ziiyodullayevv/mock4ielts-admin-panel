'use client';

import type { IUser } from 'src/types/user';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import axiosInstance, { endpoints } from 'src/lib/axios';

import { Form, RHFSwitch, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const UserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string(),
  country: z.string(),
  target_band: z.number().min(0).max(9).optional(),
  token_balance: z.number().min(0),
  is_admin: z.boolean(),
});

type UserSchemaType = z.infer<typeof UserSchema>;

type Props = {
  currentUser?: IUser;
};

export function UserCreateEditForm({ currentUser }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const avatarLetter =
    currentUser?.full_name?.charAt(0).toUpperCase() ||
    currentUser?.email?.charAt(0).toUpperCase() ||
    'U';

  const methods = useForm<UserSchemaType>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      full_name: currentUser?.full_name ?? '',
      phone: currentUser?.phone ?? '',
      country: currentUser?.country ?? '',
      target_band: currentUser?.target_band ?? undefined,
      token_balance: currentUser?.token_balance ?? 0,
      is_admin: currentUser?.is_admin ?? false,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserSchemaType) =>
      axiosInstance.patch(endpoints.users.details(currentUser!.id), {
        ...data,
        phone: data.phone || null,
        country: data.country || null,
        target_band: data.target_band ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', currentUser!.id] });
      router.push(paths.dashboard.users.root);
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
            <Avatar sx={{ width: 100, height: 100, fontSize: 40, mb: 3 }}>{avatarLetter}</Avatar>

            <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
              {currentUser?.full_name || '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {currentUser?.email}
            </Typography>

            <Divider sx={{ width: 1, mb: 3 }} />

            <Stack spacing={1} sx={{ width: 1, typography: 'body2' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box component="span" color="text.secondary">
                  Provider
                </Box>
                <Box component="span">{currentUser?.auth_provider}</Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box component="span" color="text.secondary">
                  Joined
                </Box>
                <Box component="span">
                  {currentUser?.created_at
                    ? new Date(currentUser.created_at).toLocaleDateString()
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
                <RHFTextField name="target_band" label="Target band (0–9)" type="number" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField name="token_balance" label="Token balance" type="number" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <RHFSwitch name="is_admin" label="Admin role" />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push(paths.dashboard.users.root)}
              >
                Cancel
              </Button>
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
