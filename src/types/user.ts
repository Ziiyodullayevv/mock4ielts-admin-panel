export type IUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  country: string | null;
  target_band: number | null;
  auth_provider: 'google' | 'apple' | 'email';
  token_balance: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type IUserFilters = {
  search: string;
  auth_provider: string;
};

export type IUsersPagination = {
  page: number;
  pages: number;
  size: number;
  total: number;
};

export type IUsersListResponse = {
  success: boolean;
  data: IUser[];
  message: string;
  pagination: IUsersPagination;
};

export type IUserDetailResponse = {
  success: boolean;
  data: IUser;
  message: string;
  pagination: null;
};
