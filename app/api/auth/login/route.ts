import { findUserByRole, getUser } from '../../users/_store';

type LoginBody = { id?: string; role?: string };

export async function POST(request: Request) {
  const body: LoginBody = await request.json().catch(() => ({} as LoginBody));

  let id: string | null = null;
  if (body?.id) {
    const u = getUser(body.id);
    if (u) id = u.id;
  } else if (body?.role) {
    const u = findUserByRole(body.role);
    if (u) id = u.id;
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (id) {
    // set cookie to simulate login
    headers['Set-Cookie'] = `demo_user_id=${encodeURIComponent(id)}; Path=/; HttpOnly`;
    return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers });
  }

  // clear cookie
  headers['Set-Cookie'] = `demo_user_id=; Path=/; Max-Age=0; HttpOnly`;
  return new Response(JSON.stringify({ ok: false }), { status: 200, headers });
}
