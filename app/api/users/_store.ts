import bcrypt from 'bcryptjs';
import prismaClient from '../../../lib/prisma';

type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // hashed
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

export function findUserByEmail(email: string): User | undefined {
  for (const u of users.values()) {
    if (u.email === email) return u;
  }
  return undefined;
}

export function findUserByIdentifier(identifier: string): User | undefined {
  const idLower = identifier.toLowerCase();
  for (const u of users.values()) {
    if ((u.email && u.email.toLowerCase() === idLower) || (u.name && u.name.toLowerCase() === idLower)) return u;
  }
  return undefined;
}

export function validatePassword(id: string, password: string): boolean {
  const u = users.get(id);
  if (!u) return false;
  if (!u.password) return false;
  try {
    return bcrypt.compareSync(password, u.password);
  } catch {
    return false;
  }
}

export function createUser(data: { name: string; email: string; role?: string; password?: string }): User {
  const id = genId();
  const now = new Date().toISOString();
  const hashed = data.password ? bcrypt.hashSync(data.password, 8) : undefined;
  const user: User = { id, name: data.name, email: data.email, role: data.role, password: hashed, createdAt: now };
  users.set(id, user);
  return user;
}

export function updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const existing = users.get(id);
  if (!existing) return null;
  // If a new password is provided, hash it before storing
  const incoming: Partial<User> = { ...data };
  if (incoming.password) {
    try {
      incoming.password = bcrypt.hashSync(String(incoming.password), 8);
    } catch {
      // if hashing fails, don't overwrite the existing password
      delete incoming.password;
    }
  }

  const updated: User = {
    ...existing,
    ...incoming,
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

// seed a sample user (passwords are demo-only and stored plaintext for the sample store)
// If a database is configured, optionally migrate/seed from DB (non-blocking)
const _maybeSeed = async () => {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) return;
    // create demo users in DB if missing
    await prismaClient.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        password: bcrypt.hashSync('password', 8),
      },
    });
    await prismaClient.user.upsert({
      where: { email: 'member@example.com' },
      update: {},
      create: {
        name: 'Demo Member',
        email: 'member@example.com',
        role: 'user',
        password: bcrypt.hashSync('password', 8),
      },
    });
  } catch {
    // ignore when no DB or migration not applied — keep file-based store as fallback
  }
};

void _maybeSeed();

export type { User };
