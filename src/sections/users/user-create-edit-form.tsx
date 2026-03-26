'use client';

import type { IUser } from 'src/types/user';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import axiosInstance, { endpoints } from 'src/lib/axios';

import { Label } from 'src/components/label';
import { Form, Field, schemaUtils } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DEFAULT_AVATAR = `${CONFIG.assetsDir}/assets/images/mock/avatar/avatar-25.webp`;

const BAND_SCORES = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const UserSchema = z.object({
  full_name: z.string().min(1, { error: 'Full name is required!' }),
  email: z.string(),
  phone: schemaUtils.phoneNumber({ isValid: isValidPhoneNumber }),
  country: schemaUtils.nullableInput(z.string().min(1, { error: 'Country is required!' }), {
    error: 'Country is required!',
  }),
  target_band: z.union([z.coerce.number().min(0).max(9), z.literal('')]).optional(),
  token_balance: z.coerce.number().min(0),
  is_admin: z.boolean(),
});

type Props = {
  currentUser?: IUser;
};

// ----------------------------------------------------------------------

export function UserCreateEditForm({ currentUser }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const displayName = currentUser?.full_name || currentUser?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'U';

  const methods = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      full_name: currentUser?.full_name ?? '',
      email: currentUser?.email ?? '',
      phone: currentUser?.phone ?? '',
      country: currentUser?.country ?? 'Uzbekistan',
      target_band: currentUser?.target_band ?? 0,
      token_balance: currentUser?.token_balance ?? 0,
      is_admin: currentUser?.is_admin ?? false,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      axiosInstance.patch(endpoints.users.details(currentUser!.id), {
        full_name: data.full_name,
        phone: data.phone || null,
        country: data.country || null,
        target_band: data.target_band === '' ? null : (data.target_band ?? null),
        token_balance: data.token_balance,
        is_admin: data.is_admin,
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
        {/* Left card — Avatar & switches */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ pt: 10, pb: 5, px: 3, position: 'relative' }}>
            <Label
              color={currentUser?.is_admin ? 'primary' : 'warning'}
              sx={{ position: 'absolute', top: 24, right: 24 }}
            >
              {currentUser?.is_admin ? 'Admin' : 'User'}
            </Label>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
              <Box
                sx={{
                  p: '8px',
                  mb: 2,
                  borderRadius: '50%',
                  border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
                }}
              >
                <Avatar src={DEFAULT_AVATAR} alt={displayName} sx={{ width: 120, height: 120 }}>
                  {avatarLetter}
                </Avatar>
              </Box>

              <Typography variant="subtitle1" noWrap sx={{ mt: 1 }}>
                {currentUser?.full_name || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {currentUser?.email}
              </Typography>
            </Box>

            <Field.Switch
              name="is_admin"
              label="Admin"
              labelPlacement="start"
              sx={{ justifyContent: 'space-between', width: 1 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ ml: 0 }}>
              Apply admin role
            </Typography>

            <Button
              variant="soft"
              color="error"
              sx={{ mt: 3, width: 1 }}
              onClick={() => router.push(paths.dashboard.users.root)}
            >
              Delete user
            </Button>
          </Card>
        </Grid>

        {/* Right card — Form fields */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="full_name" label="Full name" />
              <Field.Text name="email" label="Email address" disabled />
              <Field.Phone name="phone" label="Phone number" defaultCountry="UZ" />

              <Field.CountrySelect
                fullWidth
                name="country"
                label="Country"
                placeholder="Choose a country"
              />

              <Field.Select name="target_band" label="Target band">
                {BAND_SCORES.map((score) => (
                  <MenuItem key={score} value={score}>
                    {score.toFixed(1)}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text name="token_balance" label="Token balance" type="number" />
            </Box>

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
