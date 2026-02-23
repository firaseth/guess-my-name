import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  decimal,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Consent logs - tracks user consent for data storage
export const consentLogs = mysqlTable("consent_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consentGiven: boolean("consentGiven").notNull(),
  consentVersion: varchar("consentVersion", { length: 20 }).default("1.0").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Face registrations - stores user-uploaded photos and their metadata
export const faceRegistrations = mysqlTable("face_registrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  photoUrl: varchar("photoUrl", { length: 500 }).notNull(), // S3 storage path
  embeddingId: varchar("embeddingId", { length: 64 }).unique(), // Reference to vector DB
  qualityScore: decimal("qualityScore", { precision: 3, scale: 2 }), // 0.00 to 1.00
  faceDetected: boolean("faceDetected").default(true).notNull(),
  registeredName: varchar("registeredName", { length: 255 }).notNull(), // The name associated with this face
  metadata: json("metadata"), // Additional face info: face_count, face_position, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Match history - logs all matching attempts
export const matchHistory = mysqlTable("match_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who performed the search
  queryPhotoUrl: varchar("queryPhotoUrl", { length: 500 }).notNull(), // Photo uploaded for matching
  matchedUserId: int("matchedUserId"), // ID of matched user (null if no match)
  matchedName: varchar("matchedName", { length: 255 }), // Name of matched person
  similarityScore: decimal("similarityScore", { precision: 5, scale: 4 }), // 0.0000 to 1.0000
  confidenceLevel: mysqlEnum("confidenceLevel", ["low", "medium", "high"]), // Based on similarity threshold
  wasAccurate: boolean("wasAccurate"), // User feedback: was the match correct?
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Rate limiting - track API usage per user
export const rateLimitLogs = mysqlTable("rate_limit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestCount: int("requestCount").default(1).notNull(),
  windowStart: timestamp("windowStart").notNull(),
  windowEnd: timestamp("windowEnd").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Admin audit log - tracks sensitive operations
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // User who performed the action
  action: varchar("action", { length: 100 }).notNull(), // e.g., "user_deleted", "data_accessed"
  resourceType: varchar("resourceType", { length: 100 }), // e.g., "user", "face_registration"
  resourceId: int("resourceId"), // ID of affected resource
  details: json("details"), // Additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types for TypeScript
export type ConsentLog = typeof consentLogs.$inferSelect;
export type InsertConsentLog = typeof consentLogs.$inferInsert;

export type FaceRegistration = typeof faceRegistrations.$inferSelect;
export type InsertFaceRegistration = typeof faceRegistrations.$inferInsert;

export type MatchHistory = typeof matchHistory.$inferSelect;
export type InsertMatchHistory = typeof matchHistory.$inferInsert;

export type RateLimitLog = typeof rateLimitLogs.$inferSelect;
export type InsertRateLimitLog = typeof rateLimitLogs.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
