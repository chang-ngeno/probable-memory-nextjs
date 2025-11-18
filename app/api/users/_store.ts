type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
  updatedAt?: string;
};

const users = new Map<string, User>();

function genId(): string {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    try {
      return g.crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function listUsers(): User[] {
  return Array.from(users.values());
}

export function getUser(id: string): User | undefined {
  return users.get(id);
}

export function createUser(data: { name: string; email: string; role?: string }): User {
  const id = genId();
  const now = new Date().toISOString();
  const user: User = { id, name: data.name, email: data.email, role: data.role, createdAt: now };
  users.set(id, user);
  return user;
}

export function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const existing = users.get(id);
  if (!existing) return null;
  const updated: User = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  users.set(id, updated);
  return updated;
}

export function deleteUser(id: string): boolean {
  return users.delete(id);
}

export function findUserByRole(role: string) {
  for (const u of users.values()) {
    if (u.role === role) return u;
  }
  return undefined;
}

// seed a sample user
createUser({ name: 'Demo User', email: 'demo@example.com', role: 'admin' });
// seed a demo non-admin user
createUser({ name: 'Demo Member', email: 'member@example.com', role: 'user' });

export type { User };
