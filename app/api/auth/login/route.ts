import { findUserByRole, getUser, findUserByEmail, findUserByIdentifier, validatePassword } from '../../users/_store';

type LoginBody = { id?: string; role?: string; email?: string; password?: string; remember?: boolean };

function jsonResponse(payload: unknown, status = 200, extraHeaders?: HeadersInit) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (extraHeaders) Object.assign(headers as any, extraHeaders as any);
  return new Response(JSON.stringify(payload), { status, headers });
}

function cookieHeaderForId(id: string | null | undefined, remember?: boolean) {
  if (!id) return `demo_user_id=; Path=/; Max-Age=0; HttpOnly`;
  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined;
  const parts = [`demo_user_id=${encodeURIComponent(id)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (typeof maxAge === 'number') parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

function handleEmailPasswordFlow(body: LoginBody) {
  const identifier = String(body.email).trim();
  let user = findUserByEmail(identifier);
  user ??= findUserByIdentifier(identifier);
  if (!user) return jsonResponse({ ok: false, message: 'user not found' }, 401);
  if (!validatePassword(user.id, String(body.password || ''))) return jsonResponse({ ok: false, message: 'invalid credentials' }, 401);
  return jsonResponse({ ok: true, id: user.id }, 200, { 'Set-Cookie': cookieHeaderForId(user.id, body.remember) });
}

function handleFallbackFlow(body: LoginBody) {
  let id: string | null = null;
  if (body?.id) {
    const u = getUser(body.id);
    if (u) id = u.id;
  } else if (body?.role) {
    const u = findUserByRole(body.role);
    if (u) id = u.id;
  }
  if (id) return jsonResponse({ ok: true, id }, 200, { 'Set-Cookie': cookieHeaderForId(id) });
  // clear cookie
  return jsonResponse({ ok: false }, 200, { 'Set-Cookie': cookieHeaderForId(null) });
}

export async function POST(request: Request) {
  const body: LoginBody = await request.json().catch(() => ({} as LoginBody));

  // preferred: email + password
  if (body?.email && typeof body.password === 'string') {
    return handleEmailPasswordFlow(body);
  }

  // fallback behaviors (id or role) or clear cookie
  return handleFallbackFlow(body);
}
