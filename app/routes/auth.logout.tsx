import { destroyUserSession } from '~/utils/auth.server';

export function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    throw Response.json({ message: 'Invalid request method' }, { status: 400 });
  }

  return destroyUserSession(request);
}