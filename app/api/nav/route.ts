type NavItem = { name: string; href: string };

const navData: NavItem[] = [
  { name: 'Home', href: '/home' },
  { name: 'Admin: Create User', href: '/admin/user/create' },
  { name: 'Admin: Edit User', href: '/admin/user/edit' },
  { name: 'Update Profile', href: '/user/profile/update' },
];

export async function GET() {
  return new Response(JSON.stringify(navData), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
