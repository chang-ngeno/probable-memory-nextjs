import { getUser, updateUser, deleteUser } from '../_store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const user = getUser(id);
  if (!user) return new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
  return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const updated = updateUser(id, body);
  if (!updated) return new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
  return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const ok = deleteUser(id);
  if (!ok) return new Response(JSON.stringify({ message: 'not found' }), { status: 404 });
  return new Response(null, { status: 204 });
}
