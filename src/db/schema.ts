import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uuid,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";

export const connectionTypeEnum = pgEnum("connection_type", [
  "ftp",
  "sftp",
  "ftps",
  "s3",
  "google_drive",
  "dropbox",
  "onedrive",
  "azure_blob",
  "local",
  "webdav",
]);

export const transferStatusEnum = pgEnum("transfer_status", [
  "pending",
  "queued",
  "in_progress",
  "paused",
  "completed",
  "failed",
  "cancelled",
]);

export const transferTypeEnum = pgEnum("transfer_type", [
  "local_to_remote",
  "remote_to_remote",
  "cloud_to_cloud",
  "cloud_to_remote",
  "cloud_to_local",
  "local_to_local",
  "local_to_cloud",
  "remote_to_local",
  "remote_to_cloud",
]);

export const connections = pgTable("connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: connectionTypeEnum("type").notNull(),
  host: text("host"),
  port: integer("port"),
  username: text("username"),
  password: text("password"),
  basePath: text("base_path").default("/"),
  accessKey: text("access_key"),
  secretKey: text("secret_key"),
  bucket: text("bucket"),
  region: text("region"),
  token: text("token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  sshKey: text("ssh_key"),
  sshKeyPassphrase: text("ssh_key_passphrase"),
  isActive: boolean("is_active").default(true),
  isFavorite: boolean("is_favorite").default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  config: jsonb("config"),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceConnectionId: uuid("source_connection_id").references(() => connections.id),
  destinationConnectionId: uuid("destination_connection_id").references(() => connections.id),
  transferType: transferTypeEnum("transfer_type").notNull(),
  status: transferStatusEnum("status").default("pending").notNull(),
  priority: integer("priority").default(5),
  sourcePath: text("source_path").notNull(),
  destinationPath: text("destination_path").notNull(),
  totalFiles: integer("total_files").default(0),
  transferredFiles: integer("transferred_files").default(0),
  totalSize: bigint("total_size", { mode: "number" }).default(0),
  transferredSize: bigint("transferred_size", { mode: "number" }).default(0),
  currentFile: text("current_file"),
  speed: text("speed"),
  eta: text("eta"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  options: jsonb("options"),
  startedAt: timestamp("started_at"),
  pausedAt: timestamp("paused_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").references(() => connections.id),
  name: text("name").notNull(),
  path: text("path").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recentFiles = pgTable("recent_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").references(() => connections.id),
  path: text("path").notNull(),
  name: text("name").notNull(),
  isDirectory: boolean("is_directory").default(false),
  size: bigint("size", { mode: "number" }),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});

export const sharedLinks = pgTable("shared_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").references(() => connections.id),
  path: text("path").notNull(),
  name: text("name").notNull(),
  token: text("token").notNull().unique(),
  isPublic: boolean("is_public").default(true),
  password: text("password"),
  expiresAt: timestamp("expires_at"),
  maxDownloads: integer("max_downloads"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledTransfers = pgTable("scheduled_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sourceConnectionId: uuid("source_connection_id").references(() => connections.id),
  destinationConnectionId: uuid("destination_connection_id").references(() => connections.id),
  transferType: transferTypeEnum("transfer_type").notNull(),
  sourcePath: text("source_path").notNull(),
  destinationPath: text("destination_path").notNull(),
  cronExpression: text("cron_expression"),
  isActive: boolean("is_active").default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: uuid("connection_id").references(() => connections.id),
  action: text("action").notNull(),
  path: text("path"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type RecentFile = typeof recentFiles.$inferSelect;
export type SharedLink = typeof sharedLinks.$inferSelect;
export type ScheduledTransfer = typeof scheduledTransfers.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
