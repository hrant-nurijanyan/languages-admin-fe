export type UserRole = 'admin' | 'editor';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
