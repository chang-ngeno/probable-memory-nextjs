import { updateUser, getUser } from '../_store';

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { id, ...updates } = body || {};
  if (!id) return new Response(JSON.stringify({ message: 'id is required' }), { status: 400 });
  const user = getUser(id);
  if (!user) return new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
  const updated = updateUser(id, updates);
  return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
