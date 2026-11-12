import fs from "fs/promises";
import path from "path";
import type { Client, Transaction, UserSettings, UserRole, Worker, WorkerAttendance } from "@/lib/types";

export interface StoredUser {
  id: string;
  email: string;
  password: string; // stored for local standalone mode
  full_name?: string;
  role: UserRole;
  created_at: string;
}

export interface LocalDatabase {
  users: StoredUser[];
  user_settings: UserSettings[];
  clients: Client[];
  transactions: Transaction[];
  workers: Worker[];
  worker_attendance: WorkerAttendance[];
}

/**
 * On Vercel (serverless), process.cwd() is /var/task which is read-only.
 * Only /tmp is writable. Detect Vercel and use /tmp/data instead.
 */
const SEED_PATH = path.join(process.cwd(), "data", "database.json");
const IS_VERCEL = Boolean(process.env.VERCEL);
const DB_DIR = IS_VERCEL
  ? path.join("/tmp", "data")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "database.json");

const INITIAL_DB: LocalDatabase = {
  users: [],
  user_settings: [],
  clients: [],
  transactions: [],
  workers: [],
  worker_attendance: [],
};

/**
 * Always read from disk to avoid stale in-memory cache issues.
 * In Next.js dev mode, module-level singletons can diverge between
 * server-action modules and page-render modules, causing the page to
 * read stale data even after a successful save.
 *
 * On Vercel, the filesystem is read-only except /tmp, so the local
 * store uses /tmp/data/database.json seeded from the bundled data/database.json.
 */
async function ensureDb(): Promise<LocalDatabase> {
  // 1. Try reading the writable working database (e.g. /tmp/data/database.json)
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const db = JSON.parse(data) as LocalDatabase;
    db.users = db.users || [];
    db.user_settings = db.user_settings || [];
    db.clients = db.clients || [];
    db.transactions = db.transactions || [];
    db.workers = db.workers || [];
    db.worker_attendance = db.worker_attendance || [];
    return db;
  } catch {
    // 2. Working copy doesn't exist yet — seed it from the bundled database.json
    let seedDb: LocalDatabase = INITIAL_DB;
    try {
      const seedData = await fs.readFile(SEED_PATH, "utf-8");
      seedDb = JSON.parse(seedData) as LocalDatabase;
    } catch {
      // If seed file cannot be read, fall back to INITIAL_DB
    }

    try {
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify(seedDb, null, 2), "utf-8");
    } catch {
      console.warn("[localStore] Cannot write to filesystem, using in-memory defaults");
    }

    return {
      ...seedDb,
      users: seedDb.users || [],
      user_settings: seedDb.user_settings || [],
      clients: seedDb.clients || [],
      transactions: seedDb.transactions || [],
      workers: seedDb.workers || [],
      worker_attendance: seedDb.worker_attendance || [],
    };
  }
}

async function saveDb(db: LocalDatabase): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    console.warn("[localStore] Cannot save to filesystem — data will not persist");
  }
}

export const localStore = {
  async getDb(): Promise<LocalDatabase> {
    return await ensureDb();
  },

  async findUserByEmail(email: string): Promise<StoredUser | undefined> {
    const db = await ensureDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id: string): Promise<StoredUser | undefined> {
    const db = await ensureDb();
    return db.users.find((u) => u.id === id);
  },

  async updateUser(
    id: string,
    updates: Partial<Omit<StoredUser, "id" | "created_at">>
  ): Promise<StoredUser | null> {
    const db = await ensureDb();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    db.users[idx] = {
      ...db.users[idx],
      ...updates,
    };
    await saveDb(db);
    return db.users[idx];
  },

  async createUser(user: Omit<StoredUser, "created_at" | "role"> & { role?: UserRole }): Promise<StoredUser> {
    const db = await ensureDb();
    // First user bootstrapping: first user is 'admin', subsequent users default to 'viewer'
    const role: UserRole = user.role ?? (db.users.length === 0 ? "admin" : "viewer");
    const newUser: StoredUser = {
      ...user,
      role,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);

    // Also initialize default user settings
    const defaultSettings: UserSettings = {
      id: "settings-" + user.id,
      user_id: user.id,
      currency: "EGP",
      locale: "ar",
      theme: "system",
    };
    db.user_settings.push(defaultSettings);

    await saveDb(db);
    return newUser;
  },

  async getSettings(userId: string): Promise<UserSettings | null> {
    const db = await ensureDb();
    return db.user_settings.find((s) => s.user_id === userId) ?? null;
  },

  async upsertSettings(settings: Omit<UserSettings, "id">): Promise<UserSettings> {
    const db = await ensureDb();
    const idx = db.user_settings.findIndex((s) => s.user_id === settings.user_id);
    if (idx >= 0) {
      db.user_settings[idx] = { ...db.user_settings[idx], ...settings };
      await saveDb(db);
      return db.user_settings[idx];
    } else {
      const newSettings: UserSettings = {
        id: "settings-" + settings.user_id,
        ...settings,
      };
      db.user_settings.push(newSettings);
      await saveDb(db);
      return newSettings;
    }
  },

  async getClients(_userId?: string): Promise<Client[]> {
    const db = await ensureDb();
    return db.clients;
  },

  async createClient(client: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    const newClient: Client = {
      id: "client-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
      ...client,
    };
    db.clients.push(newClient);
    await saveDb(db);
    return newClient;
  },

  async updateClient(
    id: string,
    userId: string,
    updates: Partial<Omit<Client, "id" | "user_id" | "created_at">>
  ): Promise<Client | null> {
    const db = await ensureDb();
    const idx = db.clients.findIndex((c) => c.id === id && (c.user_id === userId || !userId));
    if (idx === -1) return null;

    db.clients[idx] = {
      ...db.clients[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await saveDb(db);
    return db.clients[idx];
  },

  async deleteClient(id: string, userId?: string): Promise<boolean> {
    const db = await ensureDb();
    const initialLen = db.clients.length;
    db.clients = db.clients.filter((c) => !(c.id === id && (!userId || c.user_id === userId)));
    // Cascade delete transactions
    db.transactions = db.transactions.filter((t) => !(t.client_id === id && (!userId || t.user_id === userId)));
    await saveDb(db);
    return db.clients.length < initialLen;
  },

  async getTransactions(_userId?: string): Promise<Transaction[]> {
    const db = await ensureDb();
    const clientsMap = new Map(db.clients.map((c) => [c.id, c]));
    return db.transactions
      .map((t) => ({
        ...t,
        client: t.client_id ? clientsMap.get(t.client_id) : undefined,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async createTransaction(
    tx: Omit<Transaction, "id" | "created_at" | "updated_at">
  ): Promise<Transaction> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    const newTx: Transaction = {
      id: "tx-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
      ...tx,
    };
    db.transactions.push(newTx);
    await saveDb(db);
    return newTx;
  },

  async updateTransaction(
    id: string,
    userId: string,
    updates: Partial<Omit<Transaction, "id" | "user_id" | "created_at">>
  ): Promise<Transaction | null> {
    const db = await ensureDb();
    const idx = db.transactions.findIndex((t) => t.id === id && (t.user_id === userId || !userId));
    if (idx === -1) return null;

    db.transactions[idx] = {
      ...db.transactions[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await saveDb(db);
    return db.transactions[idx];
  },

  async deleteTransaction(id: string, userId?: string): Promise<boolean> {
    const db = await ensureDb();
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter((t) => !(t.id === id && (!userId || t.user_id === userId)));
    await saveDb(db);
    return db.transactions.length < initialLen;
  },

  // Workers
  async getWorkers(): Promise<Worker[]> {
    const db = await ensureDb();
    return db.workers || [];
  },

  async getWorkerById(id: string): Promise<Worker | undefined> {
    const db = await ensureDb();
    return (db.workers || []).find((w) => w.id === id);
  },

  async createWorker(worker: Omit<Worker, "id" | "created_at" | "updated_at">): Promise<Worker> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    const newWorker: Worker = {
      id: "worker-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
      ...worker,
    };
    db.workers.push(newWorker);
    await saveDb(db);
    return newWorker;
  },

  async updateWorker(
    id: string,
    updates: Partial<Omit<Worker, "id" | "created_at">>
  ): Promise<Worker | null> {
    const db = await ensureDb();
    const idx = db.workers.findIndex((w) => w.id === id);
    if (idx === -1) return null;

    db.workers[idx] = {
      ...db.workers[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await saveDb(db);
    return db.workers[idx];
  },

  async deleteWorker(id: string): Promise<boolean> {
    const db = await ensureDb();
    const initialLen = db.workers.length;
    db.workers = db.workers.filter((w) => w.id !== id);
    // Cascade delete attendance records
    db.worker_attendance = db.worker_attendance.filter((a) => a.worker_id !== id);
    await saveDb(db);
    return db.workers.length < initialLen;
  },

  // Worker Attendance & Salary Records
  async getWorkerAttendance(workerId?: string): Promise<WorkerAttendance[]> {
    const db = await ensureDb();
    let records = db.worker_attendance || [];
    if (workerId) {
      records = records.filter((r) => r.worker_id === workerId);
    }
    return [...records].sort((a, b) => b.date.localeCompare(a.date));
  },

  async createWorkerAttendance(
    record: Omit<WorkerAttendance, "id" | "created_at" | "updated_at">
  ): Promise<WorkerAttendance> {
    const db = await ensureDb();
    const now = new Date().toISOString();
    const newRecord: WorkerAttendance = {
      id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      created_at: now,
      updated_at: now,
      ...record,
    };
    db.worker_attendance.push(newRecord);
    await saveDb(db);
    return newRecord;
  },

  async updateWorkerAttendance(
    id: string,
    updates: Partial<Omit<WorkerAttendance, "id" | "created_at">>
  ): Promise<WorkerAttendance | null> {
    const db = await ensureDb();
    const idx = db.worker_attendance.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    db.worker_attendance[idx] = {
      ...db.worker_attendance[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await saveDb(db);
    return db.worker_attendance[idx];
  },

  async deleteWorkerAttendance(id: string): Promise<boolean> {
    const db = await ensureDb();
    const initialLen = db.worker_attendance.length;
    db.worker_attendance = db.worker_attendance.filter((r) => r.id !== id);
    await saveDb(db);
    return db.worker_attendance.length < initialLen;
  },
};
