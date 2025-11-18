import { getUser } from '../../users/_store';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = /(?:^|; )demo_user_id=([^;]+)/.exec(cookie);
  const id = match ? decodeURIComponent(match[1]) : null;
  if (!id) {
    return new Response(JSON.stringify({ id: null, role: 'guest' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  const user = getUser(id);
  if (!user) return new Response(JSON.stringify({ id: null, role: 'guest' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
