// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role?: Role | null;
  settings?: Setting[];
  roleId?: number | null;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  roleId?: number;
}
export interface UserUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
}
export interface UserDeleteResponse {
  success: boolean;
}

// Auth types
export interface AuthRegisterPayload {
  name: string;
  email: string;
  password: string;
}
export interface AuthLoginPayload {
  email: string;
  password: string;
}
export interface AuthResponse {
  success: boolean;
  user: Pick<User, "id" | "name" | "email">;
}
export interface AuthLogoutResponse {
  success: boolean;
}

// Passage types
export interface Passage {
  id: number;
  prompt: string;
  reference: string;
  text: string;
  userId: number;
  user?: User;
  reviewDates?: Date[];
  latestReviewDate?: Date | null;
}
export interface PassageCreatePayload {
  prompt: string;
  reference: string;
  text: string;
  userId: number;
  reviewDates?: Date[];
  latestReviewDate?: Date;
}
export interface PassageUpdatePayload {
  prompt?: string;
  reference?: string;
  text?: string;
  reviewDates?: Date[];
  latestReviewDate?: Date;
  userId?: number;
}
export interface PassageDeleteResponse {
  success: boolean;
}

// Role types
export interface Role {
  id: number;
  name: string;
  description?: string;
  users?: User[];
}
export interface RoleCreatePayload {
  name: string;
  description?: string;
}
export interface RoleUpdatePayload {
  name?: string;
  description?: string;
}
export interface RoleDeleteResponse {
  success: boolean;
}

// Setting types
export interface Setting {
  id: number;
  name: string;
  value: string;
  userId: number;
  user?: User;
}
export interface SettingCreatePayload {
  name: string;
  value: string;
  userId: number;
}
export interface SettingUpdatePayload {
  name?: string;
  value?: string;
  userId?: number;
}
export interface SettingDeleteResponse {
  success: boolean;
}
