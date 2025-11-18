import { createUser, listUsers } from './_store';

type CreateUserBody = {
  name?: string;
  email?: string;
  role?: string;
};

export async function GET() {
  const items = listUsers();
  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const body: CreateUserBody = await request.json().catch(() => ({} as CreateUserBody));
  if (!body?.name || !body?.email) {
    return new Response(JSON.stringify({ message: 'name and email are required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const user = createUser({ name: body.name, email: body.email, role: body.role });
  return new Response(JSON.stringify(user), { status: 201, headers: { 'Content-Type': 'application/json' } });
}