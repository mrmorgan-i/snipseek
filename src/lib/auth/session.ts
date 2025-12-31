import { cache } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, type User } from '@/lib/auth';
import { paths } from '@/lib/paths';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type SessionResponse = {
  user: SessionUser;
} | null;

// get the current session from injected headers or fallback to auth API
export const getSession = cache(async (): Promise<SessionResponse> => {
  const headersList = await headers();

  const userId = headersList.get('x-user-id');

  if (userId) {
    return {
      user: {
        id: userId,
        email: headersList.get('x-user-email') || '',
        name: headersList.get('x-user-name') || '',
        image: headersList.get('x-user-image') || null,
      },
    };
  }

  // fallback to direct auth API call
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return null;
  }

  const user = session.user as User;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || '',
      image: user.image || null,
    },
  };
});

// utility function to require authentication
export const requireAuth = cache(async (): Promise<NonNullable<SessionResponse>> => {
  const session = await getSession();

  if (!session) {
    redirect(paths.publicPaths.signIn);
  }

  return session;
});

// get session from request object
export async function getSessionFromRequest(req: Request): Promise<SessionResponse> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return null;
  }

  const user = session.user as User;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || '',
      image: user.image || null,
    },
  };
}
