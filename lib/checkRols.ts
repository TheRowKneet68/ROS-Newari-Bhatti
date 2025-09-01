import { getSession } from 'next-auth/react';

export function checkRole(session, allowedRoles: string[]) {
  if (!session) return false;
  return allowedRoles.includes(session.user.user_type);
}
