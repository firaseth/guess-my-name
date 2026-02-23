import { eq, and, desc, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import {
  consentLogs,
  faceRegistrations,
  matchHistory,
  rateLimitLogs,
  auditLogs,
  type InsertConsentLog,
  type InsertFaceRegistration,
  type InsertMatchHistory,
  type InsertRateLimitLog,
  type InsertAuditLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * CONSENT MANAGEMENT
 */
export async function recordConsent(data: InsertConsentLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(consentLogs).values(data);
  return (result as any).insertId;
}

export async function getLatestConsent(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(consentLogs)
    .where(eq(consentLogs.userId, userId))
    .orderBy(desc(consentLogs.createdAt))
    .limit(1);

  return result[0] || null;
}

export async function hasUserConsented(userId: number): Promise<boolean> {
  const consent = await getLatestConsent(userId);
  return consent?.consentGiven ?? false;
}

/**
 * FACE REGISTRATION MANAGEMENT
 */
export async function registerFace(data: InsertFaceRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(faceRegistrations).values(data);
  return (result as any).insertId;
}

export async function getUserFaceRegistrations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(faceRegistrations)
    .where(eq(faceRegistrations.userId, userId))
    .orderBy(desc(faceRegistrations.createdAt));
}

export async function getFaceRegistrationById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(faceRegistrations)
    .where(eq(faceRegistrations.id, id));

  return result[0] || null;
}

export async function deleteFaceRegistration(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(faceRegistrations).where(eq(faceRegistrations.id, id));
}

export async function getAllFaceRegistrations() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(faceRegistrations);
}

/**
 * MATCH HISTORY
 */
export async function recordMatch(data: InsertMatchHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(matchHistory).values(data);
  return (result as any).insertId;
}

export async function getUserMatchHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(matchHistory)
    .where(eq(matchHistory.userId, userId))
    .orderBy(desc(matchHistory.createdAt))
    .limit(limit);
}

export async function getMatchById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(matchHistory)
    .where(eq(matchHistory.id, id));

  return result[0] || null;
}

/**
 * RATE LIMITING
 */
export async function checkRateLimit(
  userId: number,
  endpoint: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  const existing = await db
    .select()
    .from(rateLimitLogs)
    .where(
      and(
        eq(rateLimitLogs.userId, userId),
        eq(rateLimitLogs.endpoint, endpoint),
        gte(rateLimitLogs.windowStart, windowStart)
      )
    );

  if (existing.length === 0) {
    // Create new rate limit entry
    await db.insert(rateLimitLogs).values({
      userId,
      endpoint,
      requestCount: 1,
      windowStart: now,
      windowEnd: new Date(now.getTime() + windowMs),
    });
    return true;
  }

  const log = existing[0];
  if (log.requestCount >= limit) {
    return false;
  }

  // Increment request count
  await db
    .update(rateLimitLogs)
    .set({ requestCount: log.requestCount + 1 })
    .where(eq(rateLimitLogs.id, log.id));

  return true;
}

/**
 * AUDIT LOGGING
 */
export async function logAuditEvent(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(auditLogs).values(data);
  return (result as any).insertId;
}

export async function getAuditLogs(
  userId?: number,
  action?: string,
  limit = 100
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (userId) conditions.push(eq(auditLogs.userId, userId));
  if (action) conditions.push(eq(auditLogs.action, action));

  let query = db.select().from(auditLogs);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return (query.orderBy(desc(auditLogs.createdAt)).limit(limit)) as any;
}

/**
 * USER DATA DELETION (GDPR)
 */
export async function deleteUserData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all user's face registrations
  await db.delete(faceRegistrations).where(eq(faceRegistrations.userId, userId));

  // Delete all user's match history
  await db.delete(matchHistory).where(eq(matchHistory.userId, userId));

  // Delete all user's consent logs
  await db.delete(consentLogs).where(eq(consentLogs.userId, userId));

  // Delete all user's rate limit logs
  await db.delete(rateLimitLogs).where(eq(rateLimitLogs.userId, userId));

  // Log the deletion
  await logAuditEvent({
    userId,
    action: "user_data_deleted",
    resourceType: "user",
    resourceId: userId,
    details: { deletedAt: new Date().toISOString() },
  });
}
