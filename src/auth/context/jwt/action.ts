'use client';

import axios, { endpoints } from 'src/lib/axios';

import { JWT_REFRESH_KEY } from './constant';
import { setSession } from './utils';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const accessToken = res.data?.data?.access_token;
    const refreshToken = res.data?.data?.refresh_token;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    if (refreshToken) {
      sessionStorage.setItem(JWT_REFRESH_KEY, refreshToken);
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
